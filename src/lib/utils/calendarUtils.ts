import { PersonalEvent, generateRecurringInstances } from './personalEvents';
import { formatDateKey } from './dateUtils';

export function getPersonalEventsForDate(personalEvents: PersonalEvent[], date: Date) {
  const year = date.getFullYear();
  return personalEvents.flatMap(event => 
    generateRecurringInstances(event, year)
  ).filter(instance => instance.date === formatDateKey(date));
}