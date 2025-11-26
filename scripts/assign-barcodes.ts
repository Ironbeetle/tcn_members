#!/usr/bin/env tsx
/**
 * Barcode Assignment Script
 * 
 * This script assigns available barcodes to fnmembers who don't have one yet.
 * It checks the schema for unassigned barcodes (where fnmemberId is null)
 * and links them to members without barcodes.
 * 
 * Usage: npx tsx scripts/assign-barcodes.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function assignBarcodes() {
  try {
    console.log('🔍 Checking for members without barcodes...\n')

    // Get all members without barcodes
    const membersWithoutBarcodes = await prisma.fnmember.findMany({
      where: {
        barcode: {
          none: {}
        }
      },
      select: {
        id: true,
        t_number: true,
        first_name: true,
        last_name: true,
      },
      orderBy: {
        created: 'asc'
      }
    })

    console.log(`Found ${membersWithoutBarcodes.length} members without barcodes\n`)

    // Get all available barcodes (not assigned to any member)
    // activated: 1 = not assigned, 2 = assigned
    const availableBarcodes = await prisma.barcode.findMany({
      where: {
        fnmemberId: null,
        activated: 1 // 1 = available/not assigned
      },
      select: {
        id: true,
        barcode: true,
      },
      orderBy: {
        created: 'asc'
      }
    })

    console.log(`Found ${availableBarcodes.length} available barcodes\n`)

    if (membersWithoutBarcodes.length === 0) {
      console.log('✅ All members already have barcodes assigned!')
      return
    }

    if (availableBarcodes.length === 0) {
      console.log('❌ No available barcodes to assign!')
      console.log('   Please create more barcode records first.')
      return
    }

    const assignmentCount = Math.min(
      membersWithoutBarcodes.length,
      availableBarcodes.length
    )

    console.log(`🔄 Assigning ${assignmentCount} barcodes...\n`)

    let successCount = 0
    let errorCount = 0

    // Assign barcodes to members
    for (let i = 0; i < assignmentCount; i++) {
      const member = membersWithoutBarcodes[i]
      const barcode = availableBarcodes[i]

      try {
        await prisma.barcode.update({
          where: { id: barcode.id },
          data: { 
            fnmemberId: member.id,
            activated: 2 // 2 = assigned to a member
          }
        })

        console.log(`✅ Assigned barcode ${barcode.barcode} to ${member.first_name} ${member.last_name} (${member.t_number})`)
        successCount++
      } catch (error) {
        console.error(`❌ Failed to assign barcode ${barcode.barcode} to ${member.t_number}:`, error)
        errorCount++
      }
    }

    console.log(`\n📊 Assignment Summary:`)
    console.log(`   ✅ Successfully assigned: ${successCount}`)
    console.log(`   ❌ Failed: ${errorCount}`)

    if (membersWithoutBarcodes.length > availableBarcodes.length) {
      const remaining = membersWithoutBarcodes.length - availableBarcodes.length
      console.log(`   ⚠️  ${remaining} members still need barcodes`)
    }

  } catch (error) {
    console.error('❌ Error during barcode assignment:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
assignBarcodes()
  .then(() => {
    console.log('\n✨ Barcode assignment complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Barcode assignment failed:', error)
    process.exit(1)
  })
