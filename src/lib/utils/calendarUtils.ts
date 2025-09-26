import { PersonalEvent, generateRecurringInstances } from './personalEvents';
import { formatDateKey } from './dateUtils';

export function getPersonalEventsForDate(personalEvents: PersonalEvent[], date: Date) {
  const year = date.getFullYear();
  const dateString = formatDateKey(date);

  return personalEvents.flatMap(event =>
    generateRecurringInstances(event, year)
  ).filter(instance => instance.date === dateString);
}

// Optimized version that generates instances for all events at once for a given year
// Use this when you need events for multiple dates in the same year
export function getAllPersonalEventInstancesForYear(personalEvents: PersonalEvent[], year: number) {
  return personalEvents.flatMap(event =>
    generateRecurringInstances(event, year)
  );
}