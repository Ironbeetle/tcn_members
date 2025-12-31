import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function parseBarcodesCSV(content: string): string[] {
  // The CSV has barcode numbers, one per line (no header)
  const lines = content.trim().split('\n');
  return lines.map(line => line.trim()).filter(line => line.length > 0);
}

async function importBarcodes() {
  console.log('Starting barcode import from barcodesBeta.csv...\n');
  
  const csvPath = path.join(__dirname, '..', 'barcodesBeta.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at: ${csvPath}`);
    process.exit(1);
  }
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const barcodes = parseBarcodesCSV(csvContent);
  
  console.log(`Found ${barcodes.length} barcodes to import.\n`);
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const barcodeNumber of barcodes) {
    try {
      // Check if barcode already exists
      const existing = await prisma.barcode.findFirst({
        where: { barcode: barcodeNumber }
      });
      
      if (existing) {
        console.log(`⏭️  Skipping ${barcodeNumber} - already exists`);
        skipped++;
        continue;
      }
      
      // Check if barcode PDF file exists
      const pdfPath = path.join(__dirname, '..', 'barcodes', `${barcodeNumber}.pdf`);
      if (!fs.existsSync(pdfPath)) {
        console.log(`⚠️  Warning: PDF file not found for ${barcodeNumber}`);
      }
      
      // Create the barcode (unassigned, activated=1)
      await prisma.barcode.create({
        data: {
          barcode: barcodeNumber,
          activated: 1,  // 1 = unassigned, 2 = assigned
          fnmemberId: null,
        }
      });
      
      console.log(`✅ Imported barcode ${barcodeNumber}`);
      imported++;
      
    } catch (error) {
      console.error(`❌ Error importing ${barcodeNumber}:`, error);
      errors++;
    }
  }
  
  console.log('\n========== Import Summary ==========');
  console.log(`Total barcodes in CSV: ${barcodes.length}`);
  console.log(`Successfully imported: ${imported}`);
  console.log(`Skipped (already exist): ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log('====================================\n');
}

async function main() {
  try {
    await importBarcodes();
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
