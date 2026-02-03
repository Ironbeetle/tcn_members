/**
 * Travel Form Rates API - Get default travel rates
 */

import { NextRequest } from 'next/server';
import { 
  validateApiKey, 
  apiSuccess, 
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';
import { DEFAULT_TRAVEL_RATES } from '@/lib/travelFormCalculations';

export async function GET(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'travel-forms:rates:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  logApiAccess(request, 'travel-forms:rates:GET', true);

  return apiSuccess(DEFAULT_TRAVEL_RATES);
}
