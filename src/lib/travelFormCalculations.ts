/**
 * Travel Form Calculation Utilities
 */

export interface TravelFormData {
  // Accommodation
  hotelRate?: number;
  hotelNights?: number;
  privateRate?: number;
  privateNights?: number;
  
  // Meals
  breakfastRate?: number;
  breakfastDays?: number;
  lunchRate?: number;
  lunchDays?: number;
  dinnerRate?: number;
  dinnerDays?: number;
  
  // Incidentals
  incidentalRate?: number;
  incidentalDays?: number;
  
  // Transportation
  transportationType?: string;
  personalVehicleRate?: number;
  oneWayWinnipegKm?: number;
  oneWayWinnipegTrips?: number;
  oneWayThompsonKm?: number;
  oneWayThompsonTrips?: number;
  winnipegFlatRate?: number;
  thompsonFlatRate?: number;
  
  // Taxi
  taxiFareRate?: number;
  taxiFareDays?: number;
  
  // Parking
  parkingTotal?: number;
}

export interface TravelFormTotals {
  hotelTotal: number;
  privateTotal: number;
  breakfastTotal: number;
  lunchTotal: number;
  dinnerTotal: number;
  incidentalTotal: number;
  oneWayWinnipegTotal: number;
  oneWayThompsonTotal: number;
  publicTransportTotal: number;
  taxiFareTotal: number;
  grandTotal: number;
}

/**
 * Calculate all totals for a travel form
 */
export function calculateTravelFormTotals(data: TravelFormData): TravelFormTotals {
  // Accommodation totals
  const hotelTotal = (data.hotelRate || 0) * (data.hotelNights || 0);
  const privateTotal = (data.privateRate || 0) * (data.privateNights || 0);
  
  // Meal totals
  const breakfastTotal = (data.breakfastRate || 0) * (data.breakfastDays || 0);
  const lunchTotal = (data.lunchRate || 0) * (data.lunchDays || 0);
  const dinnerTotal = (data.dinnerRate || 0) * (data.dinnerDays || 0);
  
  // Incidental total
  const incidentalTotal = (data.incidentalRate || 0) * (data.incidentalDays || 0);
  
  // Transportation totals
  let oneWayWinnipegTotal = 0;
  let oneWayThompsonTotal = 0;
  let publicTransportTotal = 0;
  
  const transportType = data.transportationType || 'PERSONAL_VEHICLE';
  
  if (transportType === 'PERSONAL_VEHICLE' || transportType === 'COMBINATION') {
    oneWayWinnipegTotal = (data.oneWayWinnipegKm || 0) * 
      (data.oneWayWinnipegTrips || 0) * (data.personalVehicleRate || 0);
    oneWayThompsonTotal = (data.oneWayThompsonKm || 0) * 
      (data.oneWayThompsonTrips || 0) * (data.personalVehicleRate || 0);
  }
  
  if (transportType === 'PUBLIC_TRANSPORT_WINNIPEG') {
    publicTransportTotal = data.winnipegFlatRate || 0;
  } else if (transportType === 'PUBLIC_TRANSPORT_THOMPSON') {
    publicTransportTotal = data.thompsonFlatRate || 0;
  } else if (transportType === 'COMBINATION') {
    publicTransportTotal = (data.winnipegFlatRate || 0) + (data.thompsonFlatRate || 0);
  }
  
  // Taxi total
  const taxiFareTotal = (data.taxiFareRate || 0) * (data.taxiFareDays || 0);
  
  // Grand total
  const grandTotal = 
    hotelTotal + privateTotal +
    breakfastTotal + lunchTotal + dinnerTotal +
    incidentalTotal +
    oneWayWinnipegTotal + oneWayThompsonTotal +
    publicTransportTotal +
    taxiFareTotal +
    (data.parkingTotal || 0);
  
  // Round all values
  const round = (n: number) => Math.round(n * 100) / 100;
  
  return {
    hotelTotal: round(hotelTotal),
    privateTotal: round(privateTotal),
    breakfastTotal: round(breakfastTotal),
    lunchTotal: round(lunchTotal),
    dinnerTotal: round(dinnerTotal),
    incidentalTotal: round(incidentalTotal),
    oneWayWinnipegTotal: round(oneWayWinnipegTotal),
    oneWayThompsonTotal: round(oneWayThompsonTotal),
    publicTransportTotal: round(publicTransportTotal),
    taxiFareTotal: round(taxiFareTotal),
    grandTotal: round(grandTotal),
  };
}

/**
 * Default travel form rates
 */
export const DEFAULT_TRAVEL_RATES = {
  hotelRate: 200.00,
  privateRate: 50.00,
  breakfastRate: 20.50,
  lunchRate: 20.10,
  dinnerRate: 50.65,
  incidentalRate: 10.00,
  personalVehicleRate: 0.50,
  oneWayWinnipegKm: 904,
  oneWayThompsonKm: 150,
  winnipegFlatRate: 450.00,
  thompsonFlatRate: 100.00,
  taxiFareRate: 17.30,
};
