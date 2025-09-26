export interface FederalHoliday {
  name: string;
  date: string; // YYYY-MM-DD format
}

export interface AllEvents {
  federal: FederalHoliday[];
  personal: Array<{
    id: string;
    name: string;
    date: string;
    color: string;
    is_recurring: boolean;
  }>;
}

export function getFederalHolidays(year: number): FederalHoliday[] {
  const holidays: FederalHoliday[] = [];

  // New Year's Day - January 1
  holidays.push({
    name: "New Year's Day",
    date: `${year}-01-01`
  });

  // Martin Luther King Jr. Day - 3rd Monday in January
  const mlkDay = getNthWeekdayOfMonth(year, 0, 1, 3); // January (0), Monday (1), 3rd
  holidays.push({
    name: "Martin Luther King Jr. Day",
    date: formatDateToString(mlkDay)
  });

  // Presidents' Day - 3rd Monday in February
  const presidentsDay = getNthWeekdayOfMonth(year, 1, 1, 3); // February (1), Monday (1), 3rd
  holidays.push({
    name: "Presidents' Day",
    date: formatDateToString(presidentsDay)
  });

  // Memorial Day - Last Monday in May
  const memorialDay = getLastWeekdayOfMonth(year, 4, 1); // May (4), Monday (1)
  holidays.push({
    name: "Memorial Day",
    date: formatDateToString(memorialDay)
  });

  // Juneteenth National Independence Day - June 19
  holidays.push({
    name: "Juneteenth",
    date: `${year}-06-19`
  });

  // Independence Day - July 4
  holidays.push({
    name: "Independence Day",
    date: `${year}-07-04`
  });

  // Labor Day - 1st Monday in September
  const laborDay = getNthWeekdayOfMonth(year, 8, 1, 1); // September (8), Monday (1), 1st
  holidays.push({
    name: "Labor Day",
    date: formatDateToString(laborDay)
  });

  // Columbus Day - 2nd Monday in October
  const columbusDay = getNthWeekdayOfMonth(year, 9, 1, 2); // October (9), Monday (1), 2nd
  holidays.push({
    name: "Columbus Day",
    date: formatDateToString(columbusDay)
  });

  // Veterans Day - November 11
  holidays.push({
    name: "Veterans Day",
    date: `${year}-11-11`
  });

  // Thanksgiving - 4th Thursday in November
  const thanksgiving = getNthWeekdayOfMonth(year, 10, 4, 4); // November (10), Thursday (4), 4th
  holidays.push({
    name: "Thanksgiving Day",
    date: formatDateToString(thanksgiving)
  });

  // Christmas Day - December 25
  holidays.push({
    name: "Christmas Day",
    date: `${year}-12-25`
  });

  return holidays;
}

function getNthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  let targetDate = 1 + (weekday - firstWeekday + 7) % 7;
  targetDate += (n - 1) * 7;
  return new Date(year, month, targetDate);
}

function getLastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  const lastDay = new Date(year, month + 1, 0);
  const lastWeekday = lastDay.getDay();
  const daysBack = (lastWeekday - weekday + 7) % 7;
  return new Date(year, month, lastDay.getDate() - daysBack);
}

function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isFederalHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const dateString = formatDateToString(date);
  const holidays = getFederalHolidays(year);
  return holidays.some(holiday => holiday.date === dateString);
}

export function getFederalHolidayName(date: Date): string | null {
  const year = date.getFullYear();
  const dateString = formatDateToString(date);
  const holidays = getFederalHolidays(year);
  const holiday = holidays.find(holiday => holiday.date === dateString);
  return holiday ? holiday.name : null;
}

export function getEventsForDate(date: Date, personalEvents: Array<{
  id: string;
  name: string;
  date: string;
  color: string;
  is_recurring: boolean;
}> = []): AllEvents {
  const year = date.getFullYear();
  const dateString = formatDateToString(date);
  
  const federal = getFederalHolidays(year).filter(holiday => holiday.date === dateString);
  const personal = personalEvents.filter(event => event.date === dateString);
  
  return { federal, personal };
}

export function hasAnyEvent(date: Date, personalEvents: Array<{
  id: string;
  name: string;
  date: string;
  color: string;
  is_recurring: boolean;
}> = []): boolean {
  const events = getEventsForDate(date, personalEvents);
  return events.federal.length > 0 || events.personal.length > 0;
}