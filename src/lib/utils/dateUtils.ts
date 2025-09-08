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
  const isEvenYear = currentYear % 2 === 0;
  const cycleStartYear = isEvenYear ? currentYear : currentYear - 1;
  
  if (now.getMonth() < 9) { // Before October
    const actualStartYear = cycleStartYear - 2;
    return {
      start: new Date(actualStartYear, 9, 1), // Oct 1
      end: new Date(cycleStartYear, 8, 30)    // Sep 30
    };
  } else {
    return {
      start: new Date(cycleStartYear, 9, 1),     // Oct 1
      end: new Date(cycleStartYear + 2, 8, 30)  // Sep 30 two years later
    };
  }
};