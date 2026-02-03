/**
 * Travel Form by ID API - Get, Update, Delete individual travel forms
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

const updateTravelFormSchema = z.object({
  name: z.string().min(1).optional(),
  destination: z.string().min(1).optional(),
  departureDate: z.string().datetime().optional(),
  returnDate: z.string().datetime().optional(),
  reasonsForTravel: z.string().min(1).optional(),
  
  // Accommodation
  hotelRate: z.number().optional(),
  hotelNights: z.number().optional(),
  privateRate: z.number().optional(),
  privateNights: z.number().optional(),
  
  // Meals
  breakfastRate: z.number().optional(),
  breakfastDays: z.number().optional(),
  lunchRate: z.number().optional(),
  lunchDays: z.number().optional(),
  dinnerRate: z.number().optional(),
  dinnerDays: z.number().optional(),
  
  // Incidentals
  incidentalRate: z.number().optional(),
  incidentalDays: z.number().optional(),
  
  // Transportation
  transportationType: z.enum(['PERSONAL_VEHICLE', 'PUBLIC_TRANSPORT_WINNIPEG', 'PUBLIC_TRANSPORT_THOMPSON', 'COMBINATION', 'OTHER']).optional(),
  personalVehicleRate: z.number().optional(),
  licensePlateNumber: z.string().nullable().optional(),
  oneWayWinnipegKm: z.number().optional(),
  oneWayWinnipegTrips: z.number().optional(),
  oneWayThompsonKm: z.number().optional(),
  oneWayThompsonTrips: z.number().optional(),
  winnipegFlatRate: z.number().optional(),
  thompsonFlatRate: z.number().optional(),
  
  // Taxi
  taxiFareRate: z.number().optional(),
  taxiFareDays: z.number().optional(),
  
  // Parking
  parkingTotal: z.number().optional(),
});

// GET - Get single travel form
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'travel-forms:id:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;

    const form = await prisma.comm_TravelForm.findUnique({
      where: { id },
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

    if (!form) {
      return apiError('Travel form not found', 404);
    }

    logApiAccess(request, 'travel-forms:id:GET', true, { formId: id });

    return apiSuccess(form);

  } catch (error: any) {
    console.error('Travel form get error:', error);
    logApiAccess(request, 'travel-forms:id:GET', false, { error: error.message });
    return apiError('Failed to fetch travel form', 500);
  }
}

// PUT - Update travel form
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'travel-forms:id:PUT', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;
    const body = await request.json();
    
    const validation = updateTravelFormSchema.safeParse(body);
    if (!validation.success) {
      return apiError('Validation error', 400, validation.error.issues);
    }

    // Check if form exists and is editable (DRAFT status)
    const existing = await prisma.comm_TravelForm.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!existing) {
      return apiError('Travel form not found', 404);
    }

    if (existing.status !== 'DRAFT') {
      return apiError('Only draft travel forms can be edited', 400);
    }

    const updateData = validation.data;

    // Get current form data to merge with updates for total calculation
    const currentForm = await prisma.comm_TravelForm.findUnique({
      where: { id }
    });

    // Merge current data with updates
    const mergedData = {
      ...currentForm,
      ...updateData,
      departureDate: updateData.departureDate ? new Date(updateData.departureDate) : currentForm!.departureDate,
      returnDate: updateData.returnDate ? new Date(updateData.returnDate) : currentForm!.returnDate,
    };

    // Recalculate totals
    const totals = calculateTravelFormTotals(mergedData);

    const form = await prisma.comm_TravelForm.update({
      where: { id },
      data: {
        ...updateData,
        departureDate: updateData.departureDate ? new Date(updateData.departureDate) : undefined,
        returnDate: updateData.returnDate ? new Date(updateData.returnDate) : undefined,
        
        // Update calculated totals
        hotelTotal: totals.hotelTotal,
        privateTotal: totals.privateTotal,
        breakfastTotal: totals.breakfastTotal,
        lunchTotal: totals.lunchTotal,
        dinnerTotal: totals.dinnerTotal,
        incidentalTotal: totals.incidentalTotal,
        oneWayWinnipegTotal: totals.oneWayWinnipegTotal,
        oneWayThompsonTotal: totals.oneWayThompsonTotal,
        publicTransportTotal: totals.publicTransportTotal,
        taxiFareTotal: totals.taxiFareTotal,
        grandTotal: totals.grandTotal,
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

    logApiAccess(request, 'travel-forms:id:PUT', true, { formId: id });

    return apiSuccess(form, 'Travel form updated');

  } catch (error: any) {
    console.error('Travel form update error:', error);
    logApiAccess(request, 'travel-forms:id:PUT', false, { error: error.message });
    return apiError('Failed to update travel form', 500);
  }
}

// DELETE - Delete draft travel form
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'travel-forms:id:DELETE', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;

    // Check if form exists and is a draft
    const form = await prisma.comm_TravelForm.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!form) {
      return apiError('Travel form not found', 404);
    }

    if (form.status !== 'DRAFT') {
      return apiError('Only draft travel forms can be deleted', 400);
    }

    await prisma.comm_TravelForm.delete({
      where: { id }
    });

    logApiAccess(request, 'travel-forms:id:DELETE', true, { formId: id });

    return apiSuccess({ deleted: true }, 'Travel form deleted');

  } catch (error: any) {
    console.error('Travel form delete error:', error);
    logApiAccess(request, 'travel-forms:id:DELETE', false, { error: error.message });
    return apiError('Failed to delete travel form', 500);
  }
}
