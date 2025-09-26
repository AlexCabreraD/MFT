import { PersonalEvent, generateRecurringInstances } from './personalEvents';

function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPersonalEventsForDate(personalEvents: PersonalEvent[], date: Date) {
  const year = date.getFullYear();
  const dateString = formatDateToString(date);
  return personalEvents.flatMap(event => 
    generateRecurringInstances(event, year)
  ).filter(instance => instance.date === dateString);
}