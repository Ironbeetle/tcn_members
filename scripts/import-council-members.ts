import { PrismaClient, Positions, Portfolios } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface CSVRow {
  position: string;
  first_name: string;
  last_name: string;
  portfolios: string;
  email: string;
  phone: string;
  bio: string;
  image_url: string;
}

function parseCSV(content: string): CSVRow[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    // Handle CSV with potential commas in quoted fields
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Push last value
    
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });
    
    return row as unknown as CSVRow;
  });
}

function mapPosition(position: string): Positions {
  switch (position.toUpperCase()) {
    case 'CHIEF':
      return Positions.CHIEF;
    case 'COUNCILLOR':
    default:
      return Positions.COUNCILLOR;
  }
}

function parsePortfolios(portfolioStr: string): Portfolios[] {
  // Parse string like "[TREATY,ECONOMIC_DEVELOPMENT,LEADERSHIP]"
  const cleaned = portfolioStr.replace(/[\[\]]/g, '').trim();
  
  if (!cleaned) return [];
  
  const portfolioArray = cleaned.split(',').map(p => p.trim());
  
  const validPortfolios: Portfolios[] = [];
  
  for (const portfolio of portfolioArray) {
    switch (portfolio.toUpperCase()) {
      case 'TREATY':
        validPortfolios.push(Portfolios.TREATY);
        break;
      case 'HEALTH':
        validPortfolios.push(Portfolios.HEALTH);
        break;
      case 'EDUCATION':
        validPortfolios.push(Portfolios.EDUCATION);
        break;
      case 'HOUSING':
        validPortfolios.push(Portfolios.HOUSING);
        break;
      case 'ECONOMIC_DEVELOPMENT':
        validPortfolios.push(Portfolios.ECONOMIC_DEVELOPMENT);
        break;
      case 'ENVIRONMENT':
        validPortfolios.push(Portfolios.ENVIRONMENT);
        break;
      case 'PUBLIC_SAFETY':
        validPortfolios.push(Portfolios.PUBLIC_SAFETY);
        break;
      case 'LEADERSHIP':
        validPortfolios.push(Portfolios.LEADERSHIP);
        break;
      default:
        console.warn(`⚠️  Unknown portfolio: ${portfolio}`);
    }
  }
  
  return validPortfolios;
}

async function importCouncilMembers() {
  console.log('Starting council member import from council_memberlist.csv...\n');
  
  const csvPath = path.join(__dirname, '..', 'council_memberlist.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at: ${csvPath}`);
    process.exit(1);
  }
  
  // Find the current council to link members to
  const currentCouncil = await prisma.current_Council.findFirst({
    orderBy: { created: 'desc' }
  });
  
  if (!currentCouncil) {
    console.error('❌ No Current_Council record found. Please create a council first.');
    process.exit(1);
  }
  
  console.log(`📋 Found Current Council (ID: ${currentCouncil.id})`);
  console.log(`   Term: ${currentCouncil.council_start.toLocaleDateString()} - ${currentCouncil.council_end.toLocaleDateString()}\n`);
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);
  
  console.log(`Found ${rows.length} council members to import.\n`);
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const row of rows) {
    try {
      // Check if council member already exists by email (unique identifier)
      const existing = await prisma.council_Member.findFirst({
        where: { 
          email: row.email,
          councilId: currentCouncil.id
        }
      });
      
      if (existing) {
        console.log(`⏭️  Skipping ${row.first_name} ${row.last_name} (${row.email}) - already exists`);
        skipped++;
        continue;
      }
      
      const portfolios = parsePortfolios(row.portfolios);
      
      // Create the council member
      await prisma.council_Member.create({
        data: {
          position: mapPosition(row.position),
          first_name: row.first_name.trim(),
          last_name: row.last_name.trim(),
          portfolios: portfolios,
          email: row.email.trim(),
          phone: row.phone.trim(),
          bio: row.bio || null,
          image_url: row.image_url || null,
          councilId: currentCouncil.id,
        }
      });
      
      console.log(`✅ Imported ${row.position}: ${row.first_name} ${row.last_name}`);
      console.log(`   📧 ${row.email}`);
      console.log(`   📁 Portfolios: ${portfolios.join(', ') || 'None'}`);
      imported++;
      
    } catch (error) {
      console.error(`❌ Error importing ${row.first_name} ${row.last_name}:`, error);
      errors++;
    }
  }
  
  console.log('\n========================================');
  console.log('Import Summary:');
  console.log(`✅ Imported: ${imported}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log('========================================');
}

importCouncilMembers()
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
