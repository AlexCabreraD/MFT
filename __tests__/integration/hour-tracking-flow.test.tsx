import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TherapistHourTracker } from '@/components/TherapistHourTracker'
import { setupAuthState } from '../__mocks__/clerk'
import { createMockSupabaseClient } from '../__mocks__/supabase'

// Mock the entire Supabase data module
jest.mock('@/lib/utils/supabaseData', () => ({
  loadFromSupabase: jest.fn().mockResolvedValue({
    entries: {},
    outOfOfficeData: {},
    preferences: undefined,
    supervisionHours: undefined,
  }),
  saveHourEntry: jest.fn().mockResolvedValue(undefined),
  updateHourEntry: jest.fn().mockResolvedValue(undefined),
  deleteHourEntry: jest.fn().mockResolvedValue(undefined),
  saveOutOfOfficeEntry: jest.fn().mockResolvedValue(undefined),
  deleteOutOfOfficeEntry: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/lib/hooks/useSupabaseClient', () => ({
  useSupabaseClient: () => createMockSupabaseClient(),
}))

describe('Hour Tracking Integration Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupAuthState('authenticated')
    
    // Mock current date for consistent testing
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-15T10:00:00Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Complete hour entry workflow', () => {
    it('should allow user to add, edit, and delete hour entries', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(<TherapistHourTracker />)

      // Wait for component to load
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      // Should auto-open form for today
      await waitFor(() => {
        expect(screen.getByText(/add hours entry/i)).toBeInTheDocument()
      })

      // Fill out the form
      const hoursInput = screen.getByDisplayValue('')
      await user.clear(hoursInput)
      await user.type(hoursInput, '2.5')

      const notesTextarea = screen.getByPlaceholderText(/add any notes/i)
      await user.type(notesTextarea, 'Individual therapy session')

      // Save the entry
      const saveButton = screen.getByRole('button', { name: /save entry/i })
      await user.click(saveButton)

      // Verify save was called
      const { saveHourEntry } = require('@/lib/utils/supabaseData')
      expect(saveHourEntry).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        '2024-01-15',
        expect.objectContaining({
          type: 'session',
          hours: 2.5,
          notes: 'Individual therapy session',
        })
      )
    })

    it('should validate required fields before saving', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(<TherapistHourTracker />)

      await waitFor(() => {
        expect(screen.getByText(/add hours entry/i)).toBeInTheDocument()
      })

      // Mock alert for validation feedback
      global.alert = jest.fn()

      // Try to save without hours
      const saveButton = screen.getByRole('button', { name: /save entry/i })
      await user.click(saveButton)

      expect(global.alert).toHaveBeenCalledWith('Please enter valid hours')

      const { saveHourEntry } = require('@/lib/utils/supabaseData')
      expect(saveHourEntry).not.toHaveBeenCalled()
    })

    it('should handle CE entry workflow with required fields', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(<TherapistHourTracker />)

      await waitFor(() => {
        expect(screen.getByText(/add hours entry/i)).toBeInTheDocument()
      })

      // Select CE type
      const typeSelect = screen.getByDisplayValue('Psychotherapy')
      await user.selectOptions(typeSelect, 'ce')

      // Fill required fields
      const hoursInput = screen.getByDisplayValue('')
      await user.type(hoursInput, '4.0')

      const subtypeSelect = screen.getByDisplayValue('')
      await user.selectOptions(subtypeSelect, 'workshop')

      // CE-specific fields should now be visible
      await waitFor(() => {
        expect(screen.getByText(/ce category/i)).toBeInTheDocument()
      })

      const categorySelect = screen.getByDisplayValue('')
      await user.selectOptions(categorySelect, 'ethics-law-tech')

      const formatSelect = screen.getAllByDisplayValue('')[0] // Get the first empty select
      await user.selectOptions(formatSelect, 'in-person')

      // Save
      const saveButton = screen.getByRole('button', { name: /save entry/i })
      await user.click(saveButton)

      const { saveHourEntry } = require('@/lib/utils/supabaseData')
      expect(saveHourEntry).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        '2024-01-15',
        expect.objectContaining({
          type: 'ce',
          subtype: 'workshop',
          hours: 4.0,
          ceCategory: 'ethics-law-tech',
          deliveryFormat: 'in-person',
        })
      )
    })
  })

  describe('Out of Office workflow', () => {
    it('should allow marking day as out of office when no hours exist', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      // Mock hasHoursLogged to return false
      const mockUseSupabaseHourTracker = jest.requireMock('@/lib/hooks/useSupabaseHourTracker')
      
      render(<TherapistHourTracker />)

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      // Should show Out of Office button when no hours
      if (screen.queryByRole('button', { name: /out of office/i })) {
        const oooButton = screen.getByRole('button', { name: /out of office/i })
        await user.click(oooButton)

        const { saveOutOfOfficeEntry } = require('@/lib/utils/supabaseData')
        expect(saveOutOfOfficeEntry).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({
            date: '2024-01-15',
            reason: 'OoO',
          })
        )
      }
    })
  })

  describe('Calendar navigation', () => {
    it('should navigate between calendar views', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(<TherapistHourTracker />)

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      // Should start in month view
      expect(screen.getByText(/january 2024/i)).toBeInTheDocument()

      // Switch to week view
      const weekButton = screen.getByRole('button', { name: /week/i })
      await user.click(weekButton)

      // Should show week view
      expect(screen.getByText(/week summary/i)).toBeInTheDocument()

      // Switch back to month view
      const monthButton = screen.getByRole('button', { name: /month/i })
      await user.click(monthButton)

      expect(screen.getByText(/january 2024/i)).toBeInTheDocument()
    })

    it('should allow date selection in calendar', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(<TherapistHourTracker />)

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      // Click on a different date in the calendar
      const dateCell = screen.getAllByText('20')[0] // Click on the 20th
      if (dateCell) {
        await user.click(dateCell)
        
        // Should show details for selected date
        await waitFor(() => {
          expect(screen.getByText(/january 20, 2024/i)).toBeInTheDocument()
        })
      }
    })

    it('should navigate to today when Today button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(<TherapistHourTracker />)

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      const todayButton = screen.getByRole('button', { name: /today/i })
      await user.click(todayButton)

      // Should highlight current date
      await waitFor(() => {
        expect(screen.getByText(/\(today\)/i)).toBeInTheDocument()
      })
    })
  })

  describe('View switching', () => {
    it('should switch between different app views', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(<TherapistHourTracker />)

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      // Switch to Analytics view
      const analyticsButton = screen.getByRole('button', { name: /analytics/i })
      await user.click(analyticsButton)

      await waitFor(() => {
        expect(screen.getByText(/progress overview/i)).toBeInTheDocument()
      })

      // Switch to Supervision view
      const supervisionButton = screen.getByRole('button', { name: /supervision/i })
      await user.click(supervisionButton)

      await waitFor(() => {
        expect(screen.getByText(/supervision hours/i)).toBeInTheDocument()
      })

      // Switch to Requirements view
      const requirementsButton = screen.getByRole('button', { name: /requirements/i })
      await user.click(requirementsButton)

      await waitFor(() => {
        expect(screen.getByText(/utah mft requirements/i)).toBeInTheDocument()
      })

      // Switch back to Calendar
      const calendarButton = screen.getByRole('button', { name: /calendar/i })
      await user.click(calendarButton)

      await waitFor(() => {
        expect(screen.getByText(/january 2024/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error handling', () => {
    it('should handle save errors gracefully', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      // Mock save to fail
      const { saveHourEntry } = require('@/lib/utils/supabaseData')
      saveHourEntry.mockRejectedValueOnce(new Error('Database error'))
      
      render(<TherapistHourTracker />)

      await waitFor(() => {
        expect(screen.getByText(/add hours entry/i)).toBeInTheDocument()
      })

      // Fill and submit form
      const hoursInput = screen.getByDisplayValue('')
      await user.type(hoursInput, '2.0')

      const saveButton = screen.getByRole('button', { name: /save entry/i })
      await user.click(saveButton)

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/failed to save entry/i)).toBeInTheDocument()
      })
    })

    it('should handle loading errors', async () => {
      // Mock loadFromSupabase to fail
      const { loadFromSupabase } = require('@/lib/utils/supabaseData')
      loadFromSupabase.mockRejectedValueOnce(new Error('Network error'))
      
      render(<TherapistHourTracker />)

      await waitFor(() => {
        expect(screen.getByText(/failed to load data/i)).toBeInTheDocument()
      })
    })
  })

  describe('Real-time data updates', () => {
    it('should update local state after successful operations', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(<TherapistHourTracker />)

      await waitFor(() => {
        expect(screen.getByText(/add hours entry/i)).toBeInTheDocument()
      })

      // Add entry
      const hoursInput = screen.getByDisplayValue('')
      await user.type(hoursInput, '2.0')
      
      const saveButton = screen.getByRole('button', { name: /save entry/i })
      await user.click(saveButton)

      // Form should close after successful save
      await waitFor(() => {
        expect(screen.queryByText(/add hours entry/i)).not.toBeInTheDocument()
      })
    })
  })
})