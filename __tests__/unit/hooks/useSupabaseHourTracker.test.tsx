import { renderHook, act, waitFor } from '@testing-library/react'
import { useSupabaseHourTracker } from '@/lib/hooks/useSupabaseHourTracker'
import { setupAuthState } from '../../__mocks__/clerk'
import { createMockSupabaseClient } from '../../__mocks__/supabase'
import { 
  mockPsychotherapyEntry,
  mockUserAppData,
  mockFormData,
} from '../../__fixtures__/testData'

// Mock the Supabase client hook
jest.mock('@/lib/hooks/useSupabaseClient', () => ({
  useSupabaseClient: () => createMockSupabaseClient(),
}))

// Mock the utilities that the hook uses
jest.mock('@/lib/utils/supabaseData', () => ({
  loadFromSupabase: jest.fn().mockResolvedValue(require('../../__fixtures__/testData').mockUserAppData),
  saveHourEntry: jest.fn().mockResolvedValue(undefined),
  updateHourEntry: jest.fn().mockResolvedValue(undefined),
  deleteHourEntry: jest.fn().mockResolvedValue(undefined),
  saveOutOfOfficeEntry: jest.fn().mockResolvedValue(undefined),
  deleteOutOfOfficeEntry: jest.fn().mockResolvedValue(undefined),
}))

describe('useSupabaseHourTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupAuthState('authenticated')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default values when no user', async () => {
      setupAuthState('unauthenticated')

      const { result } = renderHook(() => useSupabaseHourTracker())

      expect(result.current.loading).toBe(false)
      expect(result.current.entries).toEqual({})
      expect(result.current.selectedDate).toBeInstanceOf(Date)
    })

    it('should load data when user is authenticated', async () => {
      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.entries).toEqual(mockUserAppData.entries)
      expect(result.current.outOfOfficeData).toEqual(mockUserAppData.outOfOfficeData)
    })

    it('should handle loading errors gracefully', async () => {
      const mockLoadFromSupabase = require('@/lib/utils/supabaseData').loadFromSupabase
      mockLoadFromSupabase.mockRejectedValueOnce(new Error('Database error'))

      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Failed to load data from database')
    })
  })

  describe('date selection', () => {
    it('should update selected date', async () => {
      const { result } = renderHook(() => useSupabaseHourTracker())

      const newDate = new Date('2024-02-01')
      
      act(() => {
        result.current.setSelectedDate(newDate)
      })

      expect(result.current.selectedDate).toBe(newDate)
    })

    it('should auto-open form for current day on initial load', async () => {
      // Mock current date to be consistent
      const mockToday = new Date('2024-01-15')
      jest.useFakeTimers()
      jest.setSystemTime(mockToday)

      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should auto-open editing for today if not OOO
      expect(result.current.editingDate).toBeTruthy()
      expect(result.current.selectedDate.toDateString()).toBe(mockToday.toDateString())

      jest.useRealTimers()
    })
  })

  describe('form management', () => {
    it('should update form data', async () => {
      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const newFormData = { ...mockFormData, hours: '3.5' }

      act(() => {
        result.current.setFormData(newFormData)
      })

      expect(result.current.formData).toEqual(newFormData)
    })

    it('should set editing date', async () => {
      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const dateKey = '2024-01-20'

      act(() => {
        result.current.setEditingDate(dateKey)
      })

      expect(result.current.editingDate).toBe(dateKey)
    })
  })

  describe('hour entry operations', () => {
    beforeEach(async () => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-15'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should save new entry successfully', async () => {
      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set up form data
      act(() => {
        result.current.setFormData({
          ...mockFormData,
          type: 'psychotherapy',
          subtype: 'individual',
          hours: '2.5',
        })
        result.current.setEditingDate('2024-01-15')
      })

      // Save the entry
      let saveResult: boolean | undefined
      await act(async () => {
        saveResult = await result.current.saveEntry()
      })

      expect(saveResult).toBe(true)
      expect(require('@/lib/utils/supabaseData').saveHourEntry).toHaveBeenCalled()
    })

    it('should validate required fields before saving', async () => {
      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set invalid form data (no hours)
      act(() => {
        result.current.setFormData({
          ...mockFormData,
          hours: '',
        })
        result.current.setEditingDate('2024-01-15')
      })

      // Mock alert for validation
      global.alert = jest.fn()

      let saveResult: boolean | undefined
      await act(async () => {
        saveResult = await result.current.saveEntry()
      })

      expect(saveResult).toBe(false)
      expect(global.alert).toHaveBeenCalledWith('Please enter valid hours')
    })

    it('should warn for entries over 16 hours', async () => {
      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.setFormData({
          ...mockFormData,
          hours: '17',
        })
        result.current.setEditingDate('2024-01-15')
      })

      global.confirm = jest.fn().mockReturnValue(true)

      let saveResult: boolean | undefined
      await act(async () => {
        saveResult = await result.current.saveEntry()
      })

      expect(global.confirm).toHaveBeenCalledWith(
        'You entered more than 16 hours in a day. Is this correct?'
      )
      expect(saveResult).toBe(true)
    })

    it('should validate CE entries have required fields', async () => {
      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // CE entry without category
      act(() => {
        result.current.setFormData({
          type: 'ce',
          subtype: 'workshop',
          hours: '4',
          notes: 'CE workshop',
          reviewedAudio: false,
          reviewedVideo: false,
          // Missing ceCategory and deliveryFormat
        })
        result.current.setEditingDate('2024-01-15')
      })

      global.alert = jest.fn()

      let saveResult: boolean | undefined
      await act(async () => {
        saveResult = await result.current.saveEntry()
      })

      expect(saveResult).toBe(false)
      expect(global.alert).toHaveBeenCalledWith('Please select a CE category')
    })

    it('should edit existing entry', async () => {
      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const dateKey = '2024-01-15'
      const entryIndex = 0

      act(() => {
        result.current.editEntry(dateKey, entryIndex)
      })

      expect(result.current.editingDate).toBe(dateKey)
      expect(result.current.editingIndex).toBe(entryIndex)
      // Form should be populated with entry data
      expect(result.current.formData.type).toBeDefined()
    })

    it('should delete entry successfully', async () => {
      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const dateKey = '2024-01-15'
      const entryIndex = 0

      await act(async () => {
        result.current.deleteEntry(dateKey, entryIndex)
      })

      expect(require('@/lib/utils/supabaseData').deleteHourEntry).toHaveBeenCalled()
    })

    it('should cancel editing and reset form', async () => {
      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set up editing state
      act(() => {
        result.current.setFormData({ ...mockFormData, hours: '2.5' })
        result.current.setEditingDate('2024-01-15')
      })

      expect(result.current.editingDate).toBe('2024-01-15')

      // Cancel editing
      act(() => {
        result.current.cancelEdit()
      })

      expect(result.current.editingDate).toBe(null)
      expect(result.current.editingIndex).toBe(null)
      expect(result.current.formData).toEqual({
        type: 'psychotherapy',
        subtype: '',
        hours: '',
        notes: '',
        reviewedAudio: false,
        reviewedVideo: false,
        ceCategory: undefined,
        deliveryFormat: undefined,
      })
    })
  })

  describe('out of office operations', () => {
    it('should set out of office successfully', async () => {
      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const dateKey = '2024-01-20'

      await act(async () => {
        result.current.setOutOfOffice(dateKey, 'OoO', 'Vacation day')
      })

      expect(require('@/lib/utils/supabaseData').saveOutOfOfficeEntry).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          date: dateKey,
          reason: 'OoO',
          notes: 'Vacation day',
        })
      )
    })

    it('should remove out of office successfully', async () => {
      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const dateKey = '2024-01-25' // Date that's OOO in mock data

      await act(async () => {
        result.current.removeOutOfOffice(dateKey)
      })

      expect(require('@/lib/utils/supabaseData').deleteOutOfOfficeEntry).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        dateKey
      )
    })

    it('should check if date is out of office', async () => {
      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.isOutOfOffice('2024-01-25')).toBe(true) // In mock data
      expect(result.current.isOutOfOffice('2024-01-15')).toBe(false) // Not in mock data
    })

    it('should get out of office entry', async () => {
      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const oooEntry = result.current.getOutOfOfficeEntry('2024-01-25')
      expect(oooEntry).toBeTruthy()
      expect(oooEntry?.reason).toBe('OoO')

      const noEntry = result.current.getOutOfOfficeEntry('2024-01-15')
      expect(noEntry).toBe(null)
    })

    it('should check if hours are logged for a date', async () => {
      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.hasHoursLogged('2024-01-15')).toBe(true) // Has entries in mock data
      expect(result.current.hasHoursLogged('2024-01-30')).toBe(false) // No entries
    })
  })

  describe('supervision operations', () => {
    it('should add supervision hours successfully', async () => {
      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        result.current.addSupervisionHours(1.5, true, false, 'Video supervision session')
      })

      expect(require('@/lib/utils/supabaseData').saveHourEntry).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.any(String),
        expect.objectContaining({
          type: 'supervision',
          subtype: 'individual',
          hours: 1.5,
          notes: 'Video supervision session',
          reviewedVideo: true,
          reviewedAudio: false,
        })
      )
    })

    it('should delete supervision session successfully', async () => {
      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const sessionIndex = 0

      await act(async () => {
        result.current.deleteSupervisionSession(sessionIndex)
      })

      expect(require('@/lib/utils/supabaseData').deleteHourEntry).toHaveBeenCalled()
    })
  })

  describe('training start date operations', () => {
    it('should update training start date', async () => {
      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const newStartDate = '2023-09-01'

      act(() => {
        result.current.updateTrainingStartDate(newStartDate)
      })

      expect(result.current.trainingStartDate).toBe(newStartDate)
    })
  })

  describe('progress calculation', () => {
    it('should calculate progress stats correctly', async () => {
      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.progress).toBeDefined()
      expect(result.current.progress.totalClinicalHours).toBeGreaterThanOrEqual(0)
      expect(result.current.progress.clinicalProgress).toBeGreaterThanOrEqual(0)
    })
  })

  describe('error handling', () => {
    it('should handle save entry errors', async () => {
      const mockSaveHourEntry = require('@/lib/utils/supabaseData').saveHourEntry
      mockSaveHourEntry.mockRejectedValueOnce(new Error('Database error'))

      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.setFormData({
          ...mockFormData,
          type: 'psychotherapy',
          subtype: 'individual',
          hours: '2.5',
        })
        result.current.setEditingDate('2024-01-15')
      })

      let saveResult: boolean | undefined
      await act(async () => {
        saveResult = await result.current.saveEntry()
      })

      expect(saveResult).toBe(false)
      expect(result.current.error).toBe('Failed to save entry to database')
    })

    it('should handle delete entry errors', async () => {
      const mockDeleteHourEntry = require('@/lib/utils/supabaseData').deleteHourEntry
      mockDeleteHourEntry.mockRejectedValueOnce(new Error('Database error'))

      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        result.current.deleteEntry('2024-01-15', 0)
      })

      expect(result.current.error).toBe('Failed to delete entry from database')
    })

    it('should handle out of office errors', async () => {
      const mockSaveOutOfOfficeEntry = require('@/lib/utils/supabaseData').saveOutOfOfficeEntry
      mockSaveOutOfOfficeEntry.mockRejectedValueOnce(new Error('Database error'))

      const { result } = renderHook(() => useSupabaseHourTracker())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        result.current.setOutOfOffice('2024-01-20', 'OoO')
      })

      expect(result.current.error).toContain('Failed to set out of office')
    })
  })
})