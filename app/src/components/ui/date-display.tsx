import { formatUTC, UTCString } from "@/lib/timezone";

interface DateDisplayProps {
  /** UTC ISO string to display */
  utcDate: UTCString | string;
  /** Format pattern (default: 'dd/MM/yyyy HH:mm') */
  format?: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Component để hiển thị UTC date được convert sang timezone local
 * Tự động handle timezone conversion để hiển thị đúng cho user
 */
export function DateDisplay({
  utcDate,
  format = "dd/MM/yyyy HH:mm",
  className,
}: DateDisplayProps) {
  return (
    <span className={className} title={`UTC: ${utcDate}`}>
      {formatUTC(utcDate, format)}
    </span>
  );
}

interface RelativeDateDisplayProps {
  /** UTC ISO string to display */
  utcDate: UTCString | string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Component để hiển thị relative time (e.g., "2 hours ago") từ UTC date
 */
export function RelativeDateDisplay({
  utcDate,
  className,
}: RelativeDateDisplayProps) {
  const localDate = new Date(utcDate);
  const now = new Date();
  const diffMs = now.getTime() - localDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  let relativeText = "";
  if (diffDays > 0) {
    relativeText = `${diffDays} ngày trước`;
  } else if (diffHours > 0) {
    relativeText = `${diffHours} giờ trước`;
  } else if (diffMinutes > 0) {
    relativeText = `${diffMinutes} phút trước`;
  } else {
    relativeText = "Vừa xong";
  }

  return (
    <span
      className={className}
      title={formatUTC(utcDate, "dd/MM/yyyy HH:mm:ss")}
    >
      {relativeText}
    </span>
  );
}

export interface DatePickerValue {
  /** Date value for form inputs - handles UTC conversion internally */
  value?: string;
  /** Callback when date changes - receives local date string */
  onChange?: (date: string) => void;
  /** Additional props */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Helper để wrap date input và handle UTC conversion
 * Input sẽ hiển thị local time nhưng value sẽ được convert sang UTC
 */
export function useDatePickerValue(utcValue?: UTCString | string): {
  displayValue: string;
  onDisplayChange: (localDateString: string) => UTCString;
} {
  const displayValue = utcValue
    ? formatUTC(utcValue, "yyyy-MM-dd'T'HH:mm")
    : "";

  const onDisplayChange = (localDateString: string): UTCString => {
    // Convert user input (local timezone) to UTC
    const localDate = new Date(localDateString);
    return localDate.toISOString() as UTCString;
  };

  return { displayValue, onDisplayChange };
}
