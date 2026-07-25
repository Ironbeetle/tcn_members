// GET /api/signup-forms/submissions
// Pull endpoint for TCN_COMM to fetch submissions (backup to webhook push)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Verify API key from TCN_COMM
function verifyApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key')
  const validKeys = process.env.API_KEYS?.split(',') || []
  return apiKey !== null && validKeys.includes(apiKey)
}

export async function GET(request: NextRequest) {
  // Verify API key
  if (!verifyApiKey(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get('formId')  // This is tcn_form_id from TCN_COMM
    const since = searchParams.get('since')    // ISO date for incremental sync

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    // If formId provided, look up the form by TCN_COMM's form ID
    if (formId) {
      const form = await prisma.signup_form.findUnique({
        where: { tcn_form_id: formId }
      })
      
      if (!form) {
        return NextResponse.json(
          { success: false, error: 'Form not found' },
          { status: 404 }
        )
      }
      where.formId = form.id
    }

    // Filter by date if 'since' is provided (for incremental sync)
    if (since) {
      const sinceDate = new Date(since)
      if (isNaN(sinceDate.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid date format for "since" parameter' },
          { status: 400 }
        )
      }
      where.created = { gte: sinceDate }
    }

    // Fetch submissions with related form and member data
    const submissions = await prisma.signup_submission.findMany({
      where,
      include: {
        form: true,
        fnmember: {
          include: {
            profile: true  // Get profile for email/phone
          }
        }
      },
      orderBy: { created: 'desc' }
    })

    // Transform to expected format
    const transformedSubmissions = submissions.map(sub => {
      // Get profile data (first profile if exists)
      const profile = sub.fnmember.profile?.[0]
      
      return {
        id: sub.id,
        formId: sub.form.tcn_form_id,  // Return TCN_COMM's form ID
        memberId: sub.fnmember.t_number,  // Use t_number as member identifier
        name: `${sub.fnmember.first_name} ${sub.fnmember.last_name}`,
        email: profile?.email || null,
        phone: profile?.phone_number || null,
        responses: sub.responses,
        submittedAt: sub.created.toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        submissions: transformedSubmissions
      }
    })

  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch submissions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
