import { calculateProgress } from '@/lib/utils/progressUtils'
import { EntriesData, HourEntry, CECategory, DeliveryFormat } from '@/lib/types'

describe('progressUtils', () => {
  const mockCurrentDate = new Date('2024-01-15T10:00:00Z')
  
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(mockCurrentDate)
  })
  
  afterAll(() => {
    jest.useRealTimers()
  })

  const createMockEntry = (
    type: HourEntry['type'],
    subtype: string,
    hours: number,
    date = '2024-01-15',
    ceCategory?: CECategory,
    deliveryFormat?: DeliveryFormat
  ): HourEntry => ({
    type,
    subtype,
    hours,
    notes: 'Test entry',
    reviewedAudio: false,
    reviewedVideo: false,
    timestamp: `${date}T10:00:00Z`,
    ...(ceCategory && { ceCategory }),
    ...(deliveryFormat && { deliveryFormat }),
  })

  describe('calculateProgress', () => {
    it('should calculate progress correctly for empty entries', () => {
      const emptyEntries: EntriesData = {}
      const progress = calculateProgress(emptyEntries)
      
      // All values should be zero
      expect(progress.totalClinicalHours).toBe(0)
      expect(progress.directMftHours).toBe(0)
      expect(progress.relationalHours).toBe(0)
      expect(progress.totalSupervisionHours).toBe(0)
      expect(progress.ceCycleHours).toBe(0)
      expect(progress.clinicalProgress).toBe(0)
      expect(progress.supervisionProgress).toBe(0)
      expect(progress.ceProgress).toBe(0)
    })

    it('should calculate clinical hours correctly', () => {
      const entries: EntriesData = {
        '2024-01-15': [
          createMockEntry('session', 'individual', 2.5),
          createMockEntry('session', 'family', 1.5),
          createMockEntry('session', 'couple', 2.0),
        ]
      }
      
      const progress = calculateProgress(entries)
      
      expect(progress.totalClinicalHours).toBe(6.0)
      expect(progress.directMftHours).toBe(6.0) // All are psychotherapy types
      expect(progress.relationalHours).toBe(3.5) // Family + couple
      expect(progress.clinicalProgress).toBe(0.2) // 6/3000 * 100 = 0.2
      expect(progress.directMftProgress).toBe(0.6) // 6/1000 * 100 = 0.6
    })

    it('should calculate supervision hours correctly', () => {
      const entries: EntriesData = {
        '2024-01-15': [
          createMockEntry('supervision', 'individual', 1.0),
          createMockEntry('supervision', 'group', 1.5),
        ]
      }
      
      const progress = calculateProgress(entries)
      
      expect(progress.totalSupervisionHours).toBe(2.5)
      expect(progress.supervisionProgress).toBe(2.5) // 2.5/100 * 100 = 2.5
    })

    it('should calculate video/audio supervision correctly', () => {
      const entriesWithVideo: EntriesData = {
        '2024-01-15': [
          { ...createMockEntry('supervision', 'individual', 1.0), reviewedVideo: true },
          { ...createMockEntry('supervision', 'individual', 1.5), reviewedAudio: true },
          createMockEntry('supervision', 'individual', 2.0), // No video/audio
        ]
      }
      
      const progress = calculateProgress(entriesWithVideo)
      
      expect(progress.totalSupervisionHours).toBe(4.5)
      expect(progress.videoAudioSupervisionHours).toBe(2.5) // Only video + audio ones
      expect(progress.videoAudioSupervisionProgress).toBe(10.0) // 2.5/25 * 100 = 10
    })

    it('should calculate CE hours correctly within cycle', () => {
      const entries: EntriesData = {
        '2024-01-15': [
          createMockEntry('ce', 'workshop', 4.0, '2024-01-15', 'general', 'in-person'),
          createMockEntry('ce', 'webinar', 2.0, '2024-01-15', 'ethics-law-tech', 'online-interactive'),
          createMockEntry('ce', 'course', 1.0, '2024-01-15', 'suicide-prevention', 'online-non-interactive'),
        ]
      }
      
      const progress = calculateProgress(entries)
      
      expect(progress.ceCycleHours).toBe(7.0)
      expect(progress.ceProgress).toBe(17.5) // 7/40 * 100 = 17.5
      expect(progress.ethicsLawTechHours).toBe(2.0)
      expect(progress.suicidePreventionHours).toBe(1.0)
      expect(progress.generalCeHours).toBe(4.0)
      expect(progress.nonInteractiveHours).toBe(1.0)
    })

    it('should filter CE hours by current cycle dates', () => {
      const entries: EntriesData = {
        // Current cycle (should count)
        '2024-01-15': [
          createMockEntry('ce', 'workshop', 4.0, '2024-01-15', 'general', 'in-person'),
        ],
        // Previous cycle (should not count)
        '2022-01-15': [
          createMockEntry('ce', 'workshop', 6.0, '2022-01-15', 'general', 'in-person'),
        ]
      }
      
      const progress = calculateProgress(entries)
      
      expect(progress.ceCycleHours).toBe(4.0) // Only current cycle
    })

    it('should calculate time progress correctly', () => {
      const entries: EntriesData = {}
      const trainingStartDate = '2023-07-15' // 6 months ago
      
      const progress = calculateProgress(entries, trainingStartDate)
      
      expect(progress.timeProgress).toBeGreaterThan(0)
      expect(progress.timeProgress).toBeLessThan(100)
      expect(progress.timeRemaining).toBeGreaterThan(0)
    })

    it('should handle mixed entry types correctly', () => {
      const entries: EntriesData = {
        '2024-01-15': [
          createMockEntry('session', 'individual', 2.0),
          createMockEntry('supervision', 'individual', 1.0),
          createMockEntry('ce', 'workshop', 4.0, '2024-01-15', 'general', 'in-person'),
        ]
      }
      
      const progress = calculateProgress(entries)
      
      expect(progress.totalClinicalHours).toBe(2.0) // Only session hours
      expect(progress.totalSupervisionHours).toBe(1.0) // Only supervision hours
      expect(progress.ceCycleHours).toBe(4.0) // Only CE hours
    })

    it('should handle non-psychotherapy session types correctly', () => {
      const entries: EntriesData = {
        '2024-01-15': [
          createMockEntry('session', 'assessment', 1.0),
          createMockEntry('session', 'consultation', 0.5),
          createMockEntry('session', 'documentation', 2.0), // Documentation is not clinical
        ]
      }
      
      const progress = calculateProgress(entries)
      
      expect(progress.totalClinicalHours).toBe(1.5) // Only assessment and consultation
      expect(progress.directMftHours).toBe(0) // None are psychotherapy types
      expect(progress.relationalHours).toBe(0) // None are family/couple
    })

    it('should calculate progress percentages correctly', () => {
      const entries: EntriesData = {
        '2024-01-15': [
          // Exactly 10% of clinical requirement (300 hours)
          ...Array(120).fill(null).map((_, i) => 
            createMockEntry('session', 'individual', 2.5, `2024-01-${String(i % 30 + 1).padStart(2, '0')}`)
          )
        ]
      }
      
      const progress = calculateProgress(entries)
      
      expect(progress.totalClinicalHours).toBe(300) // 120 * 2.5 = 300
      expect(progress.clinicalProgress).toBe(10) // 300/3000 * 100 = 10
      expect(progress.directMftProgress).toBe(30) // 300/1000 * 100 = 30
    })

    it('should handle CE category calculations correctly', () => {
      const entries: EntriesData = {
        '2024-01-15': [
          createMockEntry('ce', 'workshop', 3.0, '2024-01-15', 'ethics-law-tech', 'in-person'),
          createMockEntry('ce', 'workshop', 1.0, '2024-01-15', 'suicide-prevention', 'in-person'),
          createMockEntry('ce', 'workshop', 8.0, '2024-01-15', 'mft-specific', 'in-person'),
          createMockEntry('ce', 'workshop', 5.0, '2024-01-15', 'general', 'online-non-interactive'),
        ]
      }
      
      const progress = calculateProgress(entries)
      
      expect(progress.ethicsLawTechHours).toBe(3.0)
      expect(progress.suicidePreventionHours).toBe(1.0)
      expect(progress.mftSpecificHours).toBe(8.0)
      expect(progress.generalCeHours).toBe(5.0)
      expect(progress.nonInteractiveHours).toBe(5.0)
      
      // Check progress percentages
      expect(progress.ethicsLawTechProgress).toBe(50) // 3/6 * 100
      expect(progress.suicidePreventionProgress).toBe(50) // 1/2 * 100
      expect(progress.mftSpecificProgress).toBeCloseTo(53.33, 1) // 8/15 * 100
    })

    it('should handle backward compatibility fields', () => {
      const entries: EntriesData = {
        '2024-01-15': [
          createMockEntry('session', 'individual', 10.0),
          createMockEntry('session', 'family', 5.0),
        ]
      }
      
      const progress = calculateProgress(entries)
      
      expect(progress.totalSessionHours).toBe(progress.totalClinicalHours)
      expect(progress.sessionProgress).toBe(progress.clinicalProgress)
      expect(progress.relationalProgress).toBe(progress.relationalHours / 500 * 100)
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle entries with zero hours', () => {
      const entries: EntriesData = {
        '2024-01-15': [
          createMockEntry('session', 'individual', 0),
        ]
      }
      
      const progress = calculateProgress(entries)
      
      expect(progress.totalClinicalHours).toBe(0)
    })

    it('should handle entries with negative hours gracefully', () => {
      const entries: EntriesData = {
        '2024-01-15': [
          createMockEntry('session', 'individual', -1),
        ]
      }
      
      const progress = calculateProgress(entries)
      
      // Should still process, but likely result in negative totals
      expect(progress.totalClinicalHours).toBe(-1)
    })

    it('should handle very large hour values', () => {
      const entries: EntriesData = {
        '2024-01-15': [
          createMockEntry('session', 'individual', 1000000),
        ]
      }
      
      const progress = calculateProgress(entries)
      
      expect(progress.totalClinicalHours).toBe(1000000)
      expect(progress.clinicalProgress).toBeCloseTo(33333.333333333336, 10) // Very high percentage
    })

    it('should handle malformed timestamps in entries', () => {
      const entries: EntriesData = {
        '2024-01-15': [
          { ...createMockEntry('session', 'individual', 2.0), timestamp: 'invalid-date' },
        ]
      }
      
      // Should not crash, but might not count the entry in some calculations
      expect(() => calculateProgress(entries)).not.toThrow()
    })

    it('should handle missing training start date', () => {
      const entries: EntriesData = {}
      
      const progress = calculateProgress(entries, undefined)
      
      expect(progress.timeProgress).toBe(0)
      expect(progress.timeRemaining).toBe(730) // 2 years in days when no start date
    })
  })
})