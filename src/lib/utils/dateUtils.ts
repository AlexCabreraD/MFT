export const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
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