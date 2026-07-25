/**
 * Pay Period Utility Functions
 */

/**
 * Get pay period dates based on a reference date
 * Bi-weekly periods starting from January 6, 2025 (Monday)
 */
export function getPayPeriodDates(date: Date = new Date()): { start: Date; end: Date } {
  const referenceDate = new Date('2025-01-06T00:00:00.000Z');
  
  const daysSinceReference = Math.floor(
    (date.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const periodIndex = Math.floor(daysSinceReference / 14);
  
  const start = new Date(referenceDate);
  start.setDate(start.getDate() + periodIndex * 14);
  
  const end = new Date(start);
  end.setDate(end.getDate() + 13);
  
  return { start, end };
}

/**
 * Get the pay period that contains a specific date
 */
export function getPayPeriodForDate(date: Date): { start: Date; end: Date; periodIndex: number } {
  const referenceDate = new Date('2025-01-06T00:00:00.000Z');
  
  const daysSinceReference = Math.floor(
    (date.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const periodIndex = Math.floor(daysSinceReference / 14);
  
  const start = new Date(referenceDate);
  start.setDate(start.getDate() + periodIndex * 14);
  
  const end = new Date(start);
  end.setDate(end.getDate() + 13);
  
  return { start, end, periodIndex };
}

/**
 * Format a date range for display
 */
export function formatPayPeriod(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  };
  return `${start.toLocaleDateString('en-CA', options)} - ${end.toLocaleDateString('en-CA', options)}`;
}
