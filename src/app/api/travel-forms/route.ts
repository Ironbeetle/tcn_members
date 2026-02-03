/**
 * Travel Forms API - Manage staff travel authorization forms
 * 
 * Endpoint for the TCN Communications desktop app to manage travel forms.
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  validateApiKey, 
  apiSuccess, 
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';
import { z } from 'zod';
import { calculateTravelFormTotals, DEFAULT_TRAVEL_RATES } from '@/lib/travelFormCalculations';

const travelFormSchema = z.object({
  userId: z.string(),
  name: z.string().min(1),
  destination: z.string().min(1),
  departureDate: z.string().datetime(),
  returnDate: z.string().datetime(),
  reasonsForTravel: z.string().min(1),
  
  // Accommodation
  hotelRate: z.number().default(DEFAULT_TRAVEL_RATES.hotelRate),
  hotelNights: z.number().default(0),
  privateRate: z.number().default(DEFAULT_TRAVEL_RATES.privateRate),
  privateNights: z.number().default(0),
  
  // Meals
  breakfastRate: z.number().default(DEFAULT_TRAVEL_RATES.breakfastRate),
  breakfastDays: z.number().default(0),
  lunchRate: z.number().default(DEFAULT_TRAVEL_RATES.lunchRate),
  lunchDays: z.number().default(0),
  dinnerRate: z.number().default(DEFAULT_TRAVEL_RATES.dinnerRate),
  dinnerDays: z.number().default(0),
  
  // Incidentals
  incidentalRate: z.number().default(DEFAULT_TRAVEL_RATES.incidentalRate),
  incidentalDays: z.number().default(0),
  
  // Transportation
  transportationType: z.enum(['PERSONAL_VEHICLE', 'PUBLIC_TRANSPORT_WINNIPEG', 'PUBLIC_TRANSPORT_THOMPSON', 'COMBINATION', 'OTHER']).default('PERSONAL_VEHICLE'),
  personalVehicleRate: z.number().default(DEFAULT_TRAVEL_RATES.personalVehicleRate),
  licensePlateNumber: z.string().nullable().optional(),
  oneWayWinnipegKm: z.number().default(DEFAULT_TRAVEL_RATES.oneWayWinnipegKm),
  oneWayWinnipegTrips: z.number().default(0),
  oneWayThompsonKm: z.number().default(DEFAULT_TRAVEL_RATES.oneWayThompsonKm),
  oneWayThompsonTrips: z.number().default(0),
  winnipegFlatRate: z.number().default(DEFAULT_TRAVEL_RATES.winnipegFlatRate),
  thompsonFlatRate: z.number().default(DEFAULT_TRAVEL_RATES.thompsonFlatRate),
  
  // Taxi
  taxiFareRate: z.number().default(DEFAULT_TRAVEL_RATES.taxiFareRate),
  taxiFareDays: z.number().default(0),
  
  // Parking
  parkingTotal: z.number().default(0),
  
  // Status
  status: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ISSUED', 'COMPLETED', 'CANCELLED']).default('DRAFT'),
});

// GET - Get all travel forms (admin) or filter by user
export async function GET(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'travel-forms:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (userId) {
      where.userId = userId;
    }
    if (status) {
      where.status = status;
    }

    const [forms, total] = await Promise.all([
      prisma.comm_TravelForm.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              department: true,
            }
          }
        },
        orderBy: { created: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.comm_TravelForm.count({ where }),
    ]);

    logApiAccess(request, 'travel-forms:GET', true, { count: forms.length });

    return apiSuccess({
      forms,
      count: forms.length,
      total,
      pagination: {
        limit,
        offset,
        hasMore: offset + forms.length < total,
      },
    });

  } catch (error: any) {
    console.error('Travel forms list error:', error);
    logApiAccess(request, 'travel-forms:GET', false, { error: error.message });
    return apiError('Failed to fetch travel forms', 500);
  }
}

// POST - Create new travel form
export async function POST(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'travel-forms:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const body = await request.json();
    
    const validation = travelFormSchema.safeParse(body);
    if (!validation.success) {
      return apiError('Validation error', 400, validation.error.issues);
    }

    const data = validation.data;

    // Calculate totals
    const totals = calculateTravelFormTotals(data);

    const form = await prisma.comm_TravelForm.create({
      data: {
        userId: data.userId,
        name: data.name,
        destination: data.destination,
        departureDate: new Date(data.departureDate),
        returnDate: new Date(data.returnDate),
        reasonsForTravel: data.reasonsForTravel,
        
        // Accommodation
        hotelRate: data.hotelRate,
        hotelNights: data.hotelNights,
        hotelTotal: totals.hotelTotal,
        privateRate: data.privateRate,
        privateNights: data.privateNights,
        privateTotal: totals.privateTotal,
        
        // Meals
        breakfastRate: data.breakfastRate,
        breakfastDays: data.breakfastDays,
        breakfastTotal: totals.breakfastTotal,
        lunchRate: data.lunchRate,
        lunchDays: data.lunchDays,
        lunchTotal: totals.lunchTotal,
        dinnerRate: data.dinnerRate,
        dinnerDays: data.dinnerDays,
        dinnerTotal: totals.dinnerTotal,
        
        // Incidentals
        incidentalRate: data.incidentalRate,
        incidentalDays: data.incidentalDays,
        incidentalTotal: totals.incidentalTotal,
        
        // Transportation
        transportationType: data.transportationType,
        personalVehicleRate: data.personalVehicleRate,
        licensePlateNumber: data.licensePlateNumber || null,
        oneWayWinnipegKm: data.oneWayWinnipegKm,
        oneWayWinnipegTrips: data.oneWayWinnipegTrips,
        oneWayWinnipegTotal: totals.oneWayWinnipegTotal,
        oneWayThompsonKm: data.oneWayThompsonKm,
        oneWayThompsonTrips: data.oneWayThompsonTrips,
        oneWayThompsonTotal: totals.oneWayThompsonTotal,
        winnipegFlatRate: data.winnipegFlatRate,
        thompsonFlatRate: data.thompsonFlatRate,
        publicTransportTotal: totals.publicTransportTotal,
        
        // Taxi
        taxiFareRate: data.taxiFareRate,
        taxiFareDays: data.taxiFareDays,
        taxiFareTotal: totals.taxiFareTotal,
        
        // Parking
        parkingTotal: data.parkingTotal,
        
        // Grand Total
        grandTotal: totals.grandTotal,
        
        // Status
        status: data.status,
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            department: true,
          }
        }
      }
    });

    logApiAccess(request, 'travel-forms:POST', true, { formId: form.id });

    return apiSuccess(form, 'Travel form created');

  } catch (error: any) {
    console.error('Travel form create error:', error);
    logApiAccess(request, 'travel-forms:POST', false, { error: error.message });
    return apiError('Failed to create travel form', 500);
  }
}
