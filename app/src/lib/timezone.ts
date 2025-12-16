import { toZonedTime, fromZonedTime, formatInTimeZone } from "date-fns-tz";
import { parseISO, addMonths } from "date-fns";

// Vietnam timezone
export const VN_TIMEZONE = "Asia/Ho_Chi_Minh";

// Branded type for UTC strings to prevent confusion
export type UTCString = string & { readonly brand: unique symbol };

/**
 * Convert any date to UTC ISO string
 * @param date - Date object, string, or undefined (uses current time)
 * @param sourceTimezone - Source timezone (default: Vietnam)
 * @returns UTC ISO string
 */
export function toUTC(
  date?: Date | string,
  sourceTimezone: string = VN_TIMEZONE
): UTCString {
  const sourceDate = date
    ? typeof date === "string"
      ? parseISO(date)
      : date
    : new Date();

  // If date is a string and already in UTC format, return as is
  if (typeof date === "string" && isValidUTCString(date)) {
    return date as UTCString;
  }

  // If date is a Date object and already in UTC, return its ISO string
  if (date instanceof Date && isDateInUTC(date)) {
    return date.toISOString() as UTCString;
  }

  // If the date is already in local timezone, convert to UTC
  const utcDate = fromZonedTime(sourceDate, sourceTimezone);

  return utcDate.toISOString() as UTCString;
}

/**
 * Convert UTC string to local Date object
 * @param utcString - UTC ISO string
 * @param targetTimezone - Target timezone (default: Vietnam)
 * @returns Date object in target timezone
 */
export function fromUTC(
  utcString: UTCString | string,
  targetTimezone: string = VN_TIMEZONE
): Date {
  const utcDate = parseISO(utcString);
  return toZonedTime(utcDate, targetTimezone);
}

/**
 * Format UTC string for display in local timezone
 * @param utcString - UTC ISO string
 * @param formatString - Format pattern (default: 'dd/MM/yyyy HH:mm')
 * @param targetTimezone - Target timezone (default: Vietnam)
 * @returns Formatted date string
 */
export function formatUTC(
  utcString: UTCString | string,
  formatString: string = "dd/MM/yyyy HH:mm",
  targetTimezone: string = VN_TIMEZONE
): string {
  const utcDate = parseISO(utcString);
  return formatInTimeZone(utcDate, targetTimezone, formatString);
}

/**
 * Get current time in UTC
 * @returns Current UTC ISO string
 */
export function nowUTC(): UTCString {
  return new Date().toISOString() as UTCString;
}

/**
 * Get month boundaries in UTC for a given month/year in a timezone
 * @param month - Month (1-12)
 * @param year - Year
 * @param sourceTimezone - Source timezone (default: Vietnam)
 * @returns Object with start and end UTC dates
 */
export function getMonthBoundsUTC(
  month: number,
  year: number,
  sourceTimezone: string = VN_TIMEZONE
): { start: UTCString; end: UTCString } {
  // Create the first day of the month in the source timezone
  const monthStart = new Date(year, month - 1, 1);

  // Convert to UTC considering the source timezone
  const startUTC = fromZonedTime(monthStart, sourceTimezone);

  // Get the first day of the next month and convert to UTC
  const nextMonth = addMonths(monthStart, 1);
  const endUTC = fromZonedTime(nextMonth, sourceTimezone);

  return {
    start: startUTC.toISOString() as UTCString,
    end: endUTC.toISOString() as UTCString,
  };
}

/**
 * Get today's date boundaries in UTC (start of day to start of next day)
 * @param sourceTimezone - Source timezone (default: Vietnam)
 * @returns Object with start and end UTC dates for today
 */
export function getTodayBoundsUTC(sourceTimezone: string = VN_TIMEZONE): {
  start: UTCString;
  end: UTCString;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );

  return {
    start: fromZonedTime(today, sourceTimezone).toISOString() as UTCString,
    end: fromZonedTime(tomorrow, sourceTimezone).toISOString() as UTCString,
  };
}

/**
 * Parse user input date and convert to UTC
 * Assumes input is in Vietnam timezone unless already UTC
 * @param dateInput - Date string or Date object from user input
 * @returns UTC ISO string
 */
export function parseUserDateToUTC(dateInput: string | Date): UTCString {
  if (typeof dateInput === "string") {
    // Already UTC -> return as-is
    if (isValidUTCString(dateInput)) {
      return dateInput as UTCString;
    }

    const parsed = parseISO(dateInput);
    const hasOffset = /[zZ]|[+-]\d{2}:?\d{2}$/.test(dateInput);

    // If the string carries an explicit offset, parseISO already produced UTC
    if (hasOffset) {
      return parsed.toISOString() as UTCString;
    }

    // No offset -> treat as Vietnam local time and convert to UTC
    return fromZonedTime(parsed, VN_TIMEZONE).toISOString() as UTCString;
  }

  // Date objects: convert based on Vietnam local time unless already UTC
  if (isDateInUTC(dateInput)) {
    return dateInput.toISOString() as UTCString;
  }

  return fromZonedTime(dateInput, VN_TIMEZONE).toISOString() as UTCString;
}

/**
 * Check if a UTC date falls within a specific month/year
 * @param utcString - UTC ISO string to check
 * @param month - Month (1-12)
 * @param year - Year
 * @param timezone - Timezone to check against (default: Vietnam)
 * @returns Boolean indicating if date falls within the month
 */
export function isDateInMonth(
  utcString: UTCString | string,
  month: number,
  year: number,
  timezone: string = VN_TIMEZONE
): boolean {
  const { start, end } = getMonthBoundsUTC(month, year, timezone);
  return utcString >= start && utcString < end;
}

/**
 * Utility to validate if a string is a valid UTC ISO string
 * @param dateString - String to validate
 * @returns Boolean indicating if valid UTC ISO string
 */
export function isValidUTCString(dateString: string): dateString is UTCString {
  try {
    const date = parseISO(dateString);
    return date.toISOString() === dateString;
  } catch {
    return false;
  }
}

/**
 * Check if a Date object is already in UTC (has timezone offset of 0)
 * @param date - Date object to check
 * @returns Boolean indicating if date is in UTC
 */
export function isDateInUTC(date: Date): boolean {
  return date.getTimezoneOffset() === 0;
}

/**
 * Get today's date as YYYY-MM-DD string in local timezone
 * @returns Date string in YYYY-MM-DD format
 */
export function getTodayLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

/**
 * Format a local date as YYYY-MM-DD string without timezone conversion
 * @param year - Year
 * @param month - Month (1-12 or 0-11 depending on zeroIndexed parameter)
 * @param day - Day of month
 * @param zeroIndexed - Whether month is 0-indexed (default: false, meaning 1-12)
 * @returns Date string in YYYY-MM-DD format
 */
export function formatLocalDate(
  year: number,
  month: number,
  day: number,
  zeroIndexed: boolean = false
): string {
  const actualMonth = zeroIndexed ? month + 1 : month;
  return `${year}-${String(actualMonth).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;
}

/**
 * Format UTC date for display in user's timezone (date only)
 * Reusable utility for components - use useUserTimezone hook instead when in React components
 * @param utcDateString - UTC ISO string from database
 * @param timezone - User's timezone (from user_profiles.timezone)
 * @returns Formatted date string: 'dd/MM/yyyy'
 * @example formatDateForDisplay('2025-01-15T10:30:00Z', 'America/New_York') -> '15/01/2025'
 */
export function formatDateForDisplay(
  utcDateString: string,
  timezone: string = VN_TIMEZONE
): string {
  try {
    const utcDate = parseISO(utcDateString);
    return formatInTimeZone(utcDate, timezone, "dd/MM/yyyy");
  } catch (error) {
    console.error("Failed to format date for display:", error);
    return "Invalid date";
  }
}

/**
 * Format UTC datetime for display in user's timezone (date + time)
 * Reusable utility for components - use useUserTimezone hook instead when in React components
 * @param utcDateString - UTC ISO string from database
 * @param timezone - User's timezone (from user_profiles.timezone)
 * @returns Formatted datetime string: 'dd/MM/yyyy HH:mm'
 * @example formatDateTimeForDisplay('2025-01-15T10:30:00Z', 'America/New_York') -> '15/01/2025 05:30'
 */
export function formatDateTimeForDisplay(
  utcDateString: string,
  timezone: string = VN_TIMEZONE
): string {
  try {
    const utcDate = parseISO(utcDateString);
    return formatInTimeZone(utcDate, timezone, "dd/MM/yyyy HH:mm");
  } catch (error) {
    console.error("Failed to format datetime for display:", error);
    return "Invalid datetime";
  }
}

/**
 * Convert user input to UTC ISO string
 * Reusable utility - use useUserTimezone hook's parseUserInput method when in React components
 * @param dateInput - User input (date string, e.g., '2025-01-15' or '2025-01-15 14:30')
 * @param timezone - User's timezone (from user_profiles.timezone)
 * @returns UTC ISO string for storage in database
 * @example toDateTimeUTC('2025-01-15 14:30', 'America/New_York') -> '2025-01-15T19:30:00.000Z'
 */
export function toDateTimeUTC(
  dateInput: string,
  timezone: string = VN_TIMEZONE
): UTCString {
  try {
    // If already UTC, return as-is
    if (isValidUTCString(dateInput)) {
      return dateInput as UTCString;
    }

    // Check if input has explicit timezone offset
    const hasOffset = /[zZ]|[+-]\d{2}:?\d{2}$/.test(dateInput);
    if (hasOffset) {
      // parseISO will handle the offset correctly
      return parseISO(dateInput).toISOString() as UTCString;
    }

    // Parse input as local time in user's timezone and convert to UTC
    const parsed = parseISO(dateInput);
    const utcDate = fromZonedTime(parsed, timezone);
    return utcDate.toISOString() as UTCString;
  } catch (error) {
    console.error("Failed to convert date to UTC:", error);
    return new Date().toISOString() as UTCString;
  }
}
