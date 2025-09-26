export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Parse a date string (YYYY-MM-DD) as local timezone to avoid timezone shifts
export const parseDateString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
};

export const isToday = (date: Date): boolean => {
  return formatDateKey(date) === formatDateKey(new Date());
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDateKey(date1) === formatDateKey(date2);
};

export const getCECycleInfo = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based (0 = January, 9 = October)
  
  // CE cycles run from Oct 1 to Sep 30 (2-year cycles)
  // Determine which cycle we're currently in
  if (currentMonth < 9) { // Jan-Sep: we're in a cycle that started last October
    const cycleStartYear = currentYear - 1;
    return {
      start: new Date(cycleStartYear, 9, 1), // Oct 1 of previous year
      end: new Date(currentYear + 1, 8, 30)  // Sep 30 of next year
    };
  } else { // Oct-Dec: we're starting a new cycle
    return {
      start: new Date(currentYear, 9, 1),     // Oct 1 of current year
      end: new Date(currentYear + 2, 8, 30)  // Sep 30 two years later
    };
  }
};

export const calculateTimeProgress = (startDate: string | null) => {
  if (!startDate) {
    return {
      timeProgress: 0,
      timeRemaining: 730 // 2 years in days
    };
  }

  // Use start of day for consistent calendar day calculations
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const twoYearsLater = new Date(start);
  twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2);

  const totalDays = 730; // 2 years in days
  const elapsedDays = Math.max(0, Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const remainingDays = Math.max(0, Math.floor((twoYearsLater.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    timeProgress: Math.min(100, (elapsedDays / totalDays) * 100),
    timeRemaining: remainingDays
  };
};