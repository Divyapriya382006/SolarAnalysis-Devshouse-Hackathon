export interface CalendarEventProps {
  title: string;
  description: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  recurrenceRule?: string; // e.g., 'RRULE:FREQ=YEARLY;INTERVAL=1'
}

/**
 * Generates a Google Calendar event intent URL.
 */
export function generateGoogleCalendarUrl({
  title,
  description,
  location,
  startDate,
  endDate,
  recurrenceRule
}: CalendarEventProps): string {
  const formatDateTime = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: description,
    dates: `${formatDateTime(startDate)}/${formatDateTime(endDate)}`,
  });

  if (location) {
    params.append('location', location);
  }

  if (recurrenceRule) {
    params.append('recur', recurrenceRule);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
