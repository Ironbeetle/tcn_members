import { PrismaClient, ActivationStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface CSVRow {
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

function parseCSV(content: string): CSVRow[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });
    
    return row as CSVRow;
  });
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

async function importMembers() {
  console.log('Starting member import from memberlistNEW.csv...\n');
  
  const csvPath = path.join(__dirname, '..', 'memberlistNEW.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at: ${csvPath}`);
    process.exit(1);
  }
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);
  
  console.log(`Found ${rows.length} members to import.\n`);
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const row of rows) {
    try {
      // Check if member already exists by t_number (unique field)
      const existing = await prisma.fnmember.findUnique({
        where: { t_number: row.t_number }
      });
      
      if (existing) {
        console.log(`⏭️  Skipping ${row.first_name} ${row.last_name} (T#${row.t_number}) - already exists`);
        skipped++;
        continue;
      }
      
      // Create the member
      await prisma.fnmember.create({
        data: {
          id: row.id,
          created: new Date(row.created),
          updated: new Date(row.updated),
          birthdate: new Date(row.birthdate),
          first_name: row.first_name.trim(),
          last_name: row.last_name.trim(),
          t_number: row.t_number,
          activated: mapActivationStatus(row.activated),
          deceased: row.deceased || null,
        }
      });
      
      console.log(`✅ Imported ${row.first_name} ${row.last_name} (T#${row.t_number})`);
      imported++;
      
    } catch (error) {
      console.error(`❌ Error importing ${row.first_name} ${row.last_name} (T#${row.t_number}):`, error);
      errors++;
    }
  }
  
  console.log('\n========== Import Summary ==========');
  console.log(`Total records in CSV: ${rows.length}`);
  console.log(`Successfully imported: ${imported}`);
  console.log(`Skipped (already exist): ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log('====================================\n');
}

async function main() {
  try {
    await importMembers();
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
