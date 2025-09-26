import { 
  formatDateKey, 
  isToday, 
  isSameDay, 
  getCECycleInfo, 
  calculateTimeProgress 
} from '@/lib/utils/dateUtils'

describe('dateUtils', () => {
  // Mock current date for consistent testing
  const mockDate = new Date('2024-01-15T10:00:00Z')
  
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(mockDate)
  })
  
  afterAll(() => {
    jest.useRealTimers()
  })

  describe('formatDateKey', () => {
    it('should format date as YYYY-MM-DD string', () => {
      const date = new Date('2024-01-15T10:00:00Z')
      expect(formatDateKey(date)).toBe('2024-01-15')
    })

    it('should handle single digit months and days with zero padding', () => {
      const date = new Date('2024-03-05T10:00:00Z')
      expect(formatDateKey(date)).toBe('2024-03-05')
    })

    it('should handle end of year dates', () => {
      const date = new Date('2023-12-31T23:59:59Z')
      expect(formatDateKey(date)).toBe('2023-12-31')
    })

    it('should handle leap year dates', () => {
      const date = new Date('2024-02-29T10:00:00Z')
      expect(formatDateKey(date)).toBe('2024-02-29')
    })
  })

  describe('isToday', () => {
    it('should return true for today\'s date', () => {
      const today = new Date('2024-01-15T15:30:00Z') // Different time, same date
      expect(isToday(today)).toBe(true)
    })

    it('should return false for yesterday', () => {
      const yesterday = new Date('2024-01-14T10:00:00Z')
      expect(isToday(yesterday)).toBe(false)
    })

    it('should return false for tomorrow', () => {
      const tomorrow = new Date('2024-01-16T10:00:00Z')
      expect(isToday(tomorrow)).toBe(false)
    })

    it('should handle timezone differences correctly', () => {
      // Test with a date that might be "today" in a different timezone
      const dateWithTimezone = new Date('2024-01-15T23:59:59Z')
      expect(isToday(dateWithTimezone)).toBe(true)
    })
  })

  describe('isSameDay', () => {
    it('should return true for same dates with different times', () => {
      const date1 = new Date('2024-01-15T09:00:00Z')
      const date2 = new Date('2024-01-15T17:00:00Z')
      expect(isSameDay(date1, date2)).toBe(true)
    })

    it('should return false for different dates', () => {
      const date1 = new Date('2024-01-15T10:00:00Z')
      const date2 = new Date('2024-01-16T10:00:00Z')
      expect(isSameDay(date1, date2)).toBe(false)
    })

    it('should handle month boundary correctly', () => {
      const date1 = new Date(2024, 0, 31, 23, 59, 59) // Jan 31, 2024
      const date2 = new Date(2024, 1, 1, 0, 0, 0) // Feb 1, 2024
      expect(isSameDay(date1, date2)).toBe(false)
    })

    it('should handle year boundary correctly', () => {
      const date1 = new Date(2023, 11, 31, 23, 59, 59) // Dec 31, 2023
      const date2 = new Date(2024, 0, 1, 0, 0, 0) // Jan 1, 2024
      expect(isSameDay(date1, date2)).toBe(false)
    })
  })

  describe('getCECycleInfo', () => {
    it('should return current cycle when in January-September', () => {
      // Current mock date is January 15, 2024
      const cycleInfo = getCECycleInfo()
      
      expect(cycleInfo.start).toEqual(new Date(2023, 9, 1)) // Oct 1, 2023
      expect(cycleInfo.end).toEqual(new Date(2025, 8, 30)) // Sep 30, 2025
    })

    it('should return new cycle when in October-December', () => {
      // Mock date in October
      jest.setSystemTime(new Date(2024, 9, 15)) // Oct 15, 2024 in local time
      
      const cycleInfo = getCECycleInfo()
      
      expect(cycleInfo.start).toEqual(new Date(2024, 9, 1)) // Oct 1, 2024
      expect(cycleInfo.end).toEqual(new Date(2026, 8, 30)) // Sep 30, 2026
      
      // Reset to original mock date
      jest.setSystemTime(mockDate)
    })

    it('should handle edge case at cycle boundary (Sept 30)', () => {
      jest.setSystemTime(new Date(2024, 8, 30, 23, 59, 59)) // Sep 30, 2024 in local time
      
      const cycleInfo = getCECycleInfo()
      
      expect(cycleInfo.start).toEqual(new Date(2023, 9, 1)) // Oct 1, 2023
      expect(cycleInfo.end).toEqual(new Date(2025, 8, 30)) // Sep 30, 2025
      
      jest.setSystemTime(mockDate)
    })

    it('should handle edge case at cycle boundary (Oct 1)', () => {
      jest.setSystemTime(new Date(2024, 9, 1)) // Oct 1, 2024 in local time
      
      const cycleInfo = getCECycleInfo()
      
      // October 1st is month 9 (0-based), so currentMonth < 9 is false
      // This should go to the else branch: start = currentYear (2024), end = currentYear + 2 (2026)
      expect(cycleInfo.start).toEqual(new Date(2024, 9, 1)) // Oct 1, 2024
      expect(cycleInfo.end).toEqual(new Date(2026, 8, 30)) // Sep 30, 2026
      
      jest.setSystemTime(mockDate)
    })
  })

  describe('calculateTimeProgress', () => {
    it('should return zero progress for null start date', () => {
      const result = calculateTimeProgress(null)
      
      expect(result.timeProgress).toBe(0)
      expect(result.timeRemaining).toBe(730)
    })

    it('should calculate progress correctly for valid start date', () => {
      // Start date 6 months ago (approximately 25% through 2 years)
      const startDate = '2023-07-15' // Exactly 6 months before mock current date
      const result = calculateTimeProgress(startDate)
      
      expect(result.timeProgress).toBeGreaterThan(0)
      expect(result.timeProgress).toBeLessThan(100)
      expect(result.timeRemaining).toBeGreaterThan(0)
      expect(result.timeRemaining).toBeLessThan(730) // Less than 2 years in days
    })

    it('should return 100% progress for dates more than 2 years ago', () => {
      const startDate = '2021-01-01' // More than 2 years ago
      const result = calculateTimeProgress(startDate)
      
      expect(result.timeProgress).toBe(100)
      expect(result.timeRemaining).toBe(0)
    })

    it('should handle future start dates', () => {
      const futureStartDate = '2024-06-01' // Future date
      const result = calculateTimeProgress(futureStartDate)
      
      expect(result.timeProgress).toBeGreaterThanOrEqual(0)
      expect(result.timeRemaining).toBeGreaterThanOrEqual(0)
    })

    it('should handle start date exactly today', () => {
      const todayStartDate = '2024-01-15' // Same as mock current date
      const result = calculateTimeProgress(todayStartDate)
      
      expect(result.timeProgress).toBeGreaterThanOrEqual(0)
      expect(result.timeRemaining).toBeGreaterThanOrEqual(0)
    })

    it('should handle leap year calculations', () => {
      // Test with leap year affecting the calculation
      const startDate = '2023-02-28'
      const result = calculateTimeProgress(startDate)
      
      expect(result.timeProgress).toBeGreaterThan(0)
      expect(result.timeRemaining).toBeGreaterThan(0)
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle invalid dates gracefully', () => {
      const invalidDate = new Date('invalid-date')
      
      // formatDateKey should still work with Date objects, even invalid ones
      expect(() => formatDateKey(invalidDate)).not.toThrow()
      
      // isToday and isSameDay should handle invalid dates
      expect(() => isToday(invalidDate)).not.toThrow()
      expect(() => isSameDay(invalidDate, new Date())).not.toThrow()
    })

    it('should handle very old dates', () => {
      const oldDate = new Date('1900-01-01')
      expect(() => formatDateKey(oldDate)).not.toThrow()
      expect(isToday(oldDate)).toBe(false)
    })

    it('should handle very future dates', () => {
      const futureDate = new Date('2100-12-31')
      expect(() => formatDateKey(futureDate)).not.toThrow()
      expect(isToday(futureDate)).toBe(false)
    })
  })
})