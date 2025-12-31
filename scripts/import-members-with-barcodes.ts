import { PrismaClient, ActivationStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface MemberCSVRow {
  id: string;
  created: string;
  updated: string;
  birthdate: string;
  first_name: string;
  last_name: string;
  t_number: string;
  activated: string;
  deceased: string;
}

function parseMemberCSV(content: string): MemberCSVRow[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).filter(line => line.trim().length > 0).map(line => {
    const values = line.split(',');
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });
    
    return row as unknown as MemberCSVRow;
  });
}

function parseBarcodesCSV(content: string): string[] {
  // The CSV has barcode numbers, one per line (no header)
  const lines = content.trim().split('\n');
  return lines.map(line => line.trim()).filter(line => line.length > 0);
}

function mapActivationStatus(status: string): ActivationStatus {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return ActivationStatus.PENDING;
    case 'ACTIVATED':
      return ActivationStatus.ACTIVATED;
    case 'NONE':
    default:
      return ActivationStatus.NONE;
  }
}

async function importMembersAndBarcodes() {
  console.log('========================================');
  console.log('  COMBINED MEMBER & BARCODE IMPORT');
  console.log('========================================\n');
  
  // File paths
  const memberCsvPath = path.join(__dirname, '..', 'memberlistNEW.csv');
  const barcodeCsvPath = path.join(__dirname, '..', 'barcodesBeta.csv');
  
  // Validate files exist
  if (!fs.existsSync(memberCsvPath)) {
    console.error(`❌ Member CSV file not found at: ${memberCsvPath}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(barcodeCsvPath)) {
    console.error(`❌ Barcode CSV file not found at: ${barcodeCsvPath}`);
    process.exit(1);
  }
  
  // Parse CSV files
  const memberContent = fs.readFileSync(memberCsvPath, 'utf-8');
  const barcodeContent = fs.readFileSync(barcodeCsvPath, 'utf-8');
  
  const members = parseMemberCSV(memberContent);
  const barcodes = parseBarcodesCSV(barcodeContent);
  
  console.log(`📋 Found ${members.length} members in memberlistNEW.csv`);
  console.log(`📋 Found ${barcodes.length} barcodes in barcodesBeta.csv\n`);
  
  if (members.length > barcodes.length) {
    console.log(`⚠️  Warning: More members (${members.length}) than barcodes (${barcodes.length})`);
    console.log(`   Some members will not receive a barcode.\n`);
  }
  
  // Stats
  let membersImported = 0;
  let membersSkipped = 0;
  let memberErrors = 0;
  let barcodesCreated = 0;
  let barcodesAssigned = 0;
  let barcodeErrors = 0;
  
  // Track which barcodes have been used
  let barcodeIndex = 0;
  
  console.log('----------------------------------------');
  console.log('  STEP 1: Importing Members & Assigning Barcodes');
  console.log('----------------------------------------\n');
  
  for (const member of members) {
    try {
      // Check if member already exists by t_number
      const existingMember = await prisma.fnmember.findUnique({
        where: { t_number: member.t_number },
        include: { barcode: true }
      });
      
      if (existingMember) {
        // Member exists - check if they need a barcode
        if (existingMember.barcode.length === 0 && barcodeIndex < barcodes.length) {
          // Assign a barcode to existing member
          const barcodeNumber = barcodes[barcodeIndex];
          
          // Check if barcode PDF exists
          const pdfPath = path.join(__dirname, '..', 'barcodes', `${barcodeNumber}.pdf`);
          if (!fs.existsSync(pdfPath)) {
            console.log(`⚠️  Warning: PDF file not found for ${barcodeNumber}`);
          }
          
          // Check if barcode already exists in DB
          const existingBarcode = await prisma.barcode.findFirst({
            where: { barcode: barcodeNumber }
          });
          
          if (existingBarcode) {
            // Update existing barcode to assign to this member
            await prisma.barcode.update({
              where: { id: existingBarcode.id },
              data: {
                fnmemberId: existingMember.id,
                activated: 2  // 2 = assigned
              }
            });
          } else {
            // Create new barcode and assign
            await prisma.barcode.create({
              data: {
                barcode: barcodeNumber,
                activated: 2,  // 2 = assigned
                fnmemberId: existingMember.id
              }
            });
            barcodesCreated++;
          }
          
          console.log(`🔗 Assigned barcode ${barcodeNumber} to existing member ${member.first_name} ${member.last_name}`);
          barcodesAssigned++;
          barcodeIndex++;
        }
        
        console.log(`⏭️  Skipping ${member.first_name} ${member.last_name} (T#${member.t_number}) - member already exists`);
        membersSkipped++;
        continue;
      }
      
      // Create the new member
      const newMember = await prisma.fnmember.create({
        data: {
          id: member.id,
          created: new Date(member.created),
          updated: new Date(member.updated),
          birthdate: new Date(member.birthdate),
          first_name: member.first_name.trim(),
          last_name: member.last_name.trim(),
          t_number: member.t_number,
          activated: mapActivationStatus(member.activated),
          deceased: member.deceased || null,
        }
      });
      
      console.log(`✅ Imported ${member.first_name} ${member.last_name} (T#${member.t_number})`);
      membersImported++;
      
      // Assign a barcode to the new member if available
      if (barcodeIndex < barcodes.length) {
        const barcodeNumber = barcodes[barcodeIndex];
        
        // Check if barcode PDF exists
        const pdfPath = path.join(__dirname, '..', 'barcodes', `${barcodeNumber}.pdf`);
        if (!fs.existsSync(pdfPath)) {
          console.log(`⚠️  Warning: PDF file not found for ${barcodeNumber}`);
        }
        
        // Check if barcode already exists in DB
        const existingBarcode = await prisma.barcode.findFirst({
          where: { barcode: barcodeNumber }
        });
        
        if (existingBarcode) {
          // Update existing barcode to assign to this member
          await prisma.barcode.update({
            where: { id: existingBarcode.id },
            data: {
              fnmemberId: newMember.id,
              activated: 2  // 2 = assigned
            }
          });
        } else {
          // Create new barcode and assign
          await prisma.barcode.create({
            data: {
              barcode: barcodeNumber,
              activated: 2,  // 2 = assigned
              fnmemberId: newMember.id
            }
          });
          barcodesCreated++;
        }
        
        console.log(`   🔗 Assigned barcode ${barcodeNumber}`);
        barcodesAssigned++;
        barcodeIndex++;
      } else {
        console.log(`   ⚠️  No barcode available for this member`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${member.first_name} ${member.last_name} (T#${member.t_number}):`, error);
      memberErrors++;
    }
  }
  
  // Import any remaining barcodes as unassigned
  console.log('\n----------------------------------------');
  console.log('  STEP 2: Importing Remaining Barcodes');
  console.log('----------------------------------------\n');
  
  const remainingBarcodes = barcodes.slice(barcodeIndex);
  
  if (remainingBarcodes.length > 0) {
    console.log(`📋 ${remainingBarcodes.length} barcodes remaining to import as unassigned\n`);
    
    for (const barcodeNumber of remainingBarcodes) {
      try {
        const existing = await prisma.barcode.findFirst({
          where: { barcode: barcodeNumber }
        });
        
        if (existing) {
          console.log(`⏭️  Skipping ${barcodeNumber} - already exists`);
          continue;
        }
        
        // Check if barcode PDF exists
        const pdfPath = path.join(__dirname, '..', 'barcodes', `${barcodeNumber}.pdf`);
        if (!fs.existsSync(pdfPath)) {
          console.log(`⚠️  Warning: PDF file not found for ${barcodeNumber}`);
        }
        
        await prisma.barcode.create({
          data: {
            barcode: barcodeNumber,
            activated: 1,  // 1 = unassigned
            fnmemberId: null
          }
        });
        
        console.log(`✅ Imported unassigned barcode ${barcodeNumber}`);
        barcodesCreated++;
        
      } catch (error) {
        console.error(`❌ Error importing barcode ${barcodeNumber}:`, error);
        barcodeErrors++;
      }
    }
  } else {
    console.log('No remaining barcodes to import.\n');
  }
  
  // Print summary
  console.log('\n========================================');
  console.log('            IMPORT SUMMARY');
  console.log('========================================\n');
  console.log('MEMBERS:');
  console.log(`  📄 Total in CSV:        ${members.length}`);
  console.log(`  ✅ Successfully imported: ${membersImported}`);
  console.log(`  ⏭️  Skipped (existing):   ${membersSkipped}`);
  console.log(`  ❌ Errors:               ${memberErrors}`);
  console.log('');
  console.log('BARCODES:');
  console.log(`  📄 Total in CSV:        ${barcodes.length}`);
  console.log(`  ✅ Created in database: ${barcodesCreated}`);
  console.log(`  🔗 Assigned to members: ${barcodesAssigned}`);
  console.log(`  ❌ Errors:              ${barcodeErrors}`);
  console.log('');
  console.log('Note: Barcode activated values:');
  console.log('  1 = Unassigned (available)');
  console.log('  2 = Assigned to a member');
  console.log('========================================\n');
}

async function main() {
  try {
    await importMembersAndBarcodes();
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
