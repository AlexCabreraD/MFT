import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DayDetails } from '@/components/calendar/DayDetails'
import { mockEntriesData, mockFormData, mockOutOfOfficeEntry } from '../../../__fixtures__/testData'

describe('DayDetails', () => {
  const mockProps = {
    selectedDate: new Date('2024-01-15T10:00:00Z'),
    entries: mockEntriesData,
    editingDate: null,
    formData: mockFormData,
    onEditingDateChange: jest.fn(),
    onFormDataChange: jest.fn(),
    onSaveEntry: jest.fn(),
    onEditEntry: jest.fn(),
    onDeleteEntry: jest.fn(),
    onSetOutOfOffice: jest.fn(),
    onRemoveOutOfOffice: jest.fn(),
    isOutOfOffice: jest.fn().mockReturnValue(false),
    getOutOfOfficeEntry: jest.fn().mockReturnValue(null),
    hasHoursLogged: jest.fn().mockReturnValue(true),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render date header correctly', () => {
      render(<DayDetails {...mockProps} />)

      expect(screen.getByText(/monday, january 15, 2024/i)).toBeInTheDocument()
    })

    it('should show "Today" indicator for current date', () => {
      // Mock current date to match selected date
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-15T10:00:00Z'))

      render(<DayDetails {...mockProps} />)

      expect(screen.getByText(/\(today\)/i)).toBeInTheDocument()

      jest.useRealTimers()
    })

    it('should show "Add Hours" button when not editing and not OOO', () => {
      render(<DayDetails {...mockProps} />)

      expect(screen.getByRole('button', { name: /add hours/i })).toBeInTheDocument()
    })

    it('should show "Out of Office" button when no hours logged', () => {
      const propsWithNoHours = {
        ...mockProps,
        hasHoursLogged: jest.fn().mockReturnValue(false),
      }
      render(<DayDetails {...propsWithNoHours} />)

      expect(screen.getByRole('button', { name: /out of office/i })).toBeInTheDocument()
    })

    it('should show "Back to Office" button when day is OOO', () => {
      const oooProps = {
        ...mockProps,
        isOutOfOffice: jest.fn().mockReturnValue(true),
        getOutOfOfficeEntry: jest.fn().mockReturnValue(mockOutOfOfficeEntry),
      }
      render(<DayDetails {...oooProps} />)

      expect(screen.getByRole('button', { name: /back to office/i })).toBeInTheDocument()
    })
  })

  describe('hour entries display', () => {
    it('should display hour entries for the selected date', () => {
      render(<DayDetails {...mockProps} />)

      expect(screen.getByText(/today's entries/i)).toBeInTheDocument()
      // Should show entries from mock data for 2024-01-15
      expect(screen.getByText(/individual therapy session with anxiety management/i)).toBeInTheDocument()
      expect(screen.getByText(/weekly supervision with video review/i)).toBeInTheDocument()
    })

    it('should show "No hours logged" when no entries exist', () => {
      const propsWithoutEntries = {
        ...mockProps,
        entries: {},
        hasHoursLogged: jest.fn().mockReturnValue(false),
      }
      render(<DayDetails {...propsWithoutEntries} />)

      expect(screen.getByText(/no hours logged for this day/i)).toBeInTheDocument()
    })

    it('should display entry cards with edit and delete functionality', () => {
      render(<DayDetails {...mockProps} />)

      // Should have edit and delete buttons for each entry
      const editButtons = screen.getAllByTitle(/edit entry/i)
      const deleteButtons = screen.getAllByTitle(/delete entry/i)

      expect(editButtons.length).toBeGreaterThan(0)
      expect(deleteButtons.length).toBeGreaterThan(0)
    })
  })

  describe('form editing', () => {
    it('should show form when editing date matches selected date', () => {
      const editingProps = {
        ...mockProps,
        editingDate: '2024-01-15',
      }
      render(<DayDetails {...editingProps} />)

      // Check for form elements instead of form role
      expect(screen.getByRole('button', { name: /save entry/i })).toBeInTheDocument()
      expect(screen.getByText(/hour type/i)).toBeInTheDocument()
      expect(screen.getByText(/add hours entry/i)).toBeInTheDocument()
    })

    it('should not show form when editing different date', () => {
      const editingProps = {
        ...mockProps,
        editingDate: '2024-01-16',
      }
      render(<DayDetails {...editingProps} />)

      expect(screen.queryByRole('form')).not.toBeInTheDocument()
    })

    it('should call onEditingDateChange when Add Hours button is clicked', async () => {
      const user = userEvent.setup()
      render(<DayDetails {...mockProps} />)

      const addHoursButton = screen.getByRole('button', { name: /add hours/i })
      await user.click(addHoursButton)

      expect(mockProps.onEditingDateChange).toHaveBeenCalledWith('2024-01-15')
    })
  })

  describe('out of office functionality', () => {
    it('should display OOO information when day is marked as OOO', () => {
      const oooProps = {
        ...mockProps,
        isOutOfOffice: jest.fn().mockReturnValue(true),
        getOutOfOfficeEntry: jest.fn().mockReturnValue({
          ...mockOutOfOfficeEntry,
          notes: 'Vacation day',
        }),
      }
      render(<DayDetails {...oooProps} />)

      expect(screen.getByText(/this day is marked as out of office/i)).toBeInTheDocument()
      expect(screen.getByText(/vacation day/i)).toBeInTheDocument()
    })

    it('should call onSetOutOfOffice when Out of Office button is clicked', async () => {
      const user = userEvent.setup()
      const propsWithNoHours = {
        ...mockProps,
        hasHoursLogged: jest.fn().mockReturnValue(false),
      }
      render(<DayDetails {...propsWithNoHours} />)

      const oooButton = screen.getByRole('button', { name: /out of office/i })
      await user.click(oooButton)

      expect(mockProps.onSetOutOfOffice).toHaveBeenCalledWith('2024-01-15', 'OoO')
    })

    it('should call onRemoveOutOfOffice when Back to Office button is clicked', async () => {
      const user = userEvent.setup()
      const oooProps = {
        ...mockProps,
        isOutOfOffice: jest.fn().mockReturnValue(true),
        getOutOfOfficeEntry: jest.fn().mockReturnValue(mockOutOfOfficeEntry),
      }
      render(<DayDetails {...oooProps} />)

      const backToOfficeButton = screen.getByRole('button', { name: /back to office/i })
      await user.click(backToOfficeButton)

      expect(mockProps.onRemoveOutOfOffice).toHaveBeenCalledWith('2024-01-15')
    })

    it('should close form when setting OOO while editing', async () => {
      const user = userEvent.setup()
      const editingAndOOOProps = {
        ...mockProps,
        editingDate: '2024-01-15',
        hasHoursLogged: jest.fn().mockReturnValue(false),
      }
      render(<DayDetails {...editingAndOOOProps} />)

      const oooButton = screen.getByRole('button', { name: /out of office/i })
      await user.click(oooButton)

      expect(mockProps.onEditingDateChange).toHaveBeenCalledWith(null)
      expect(mockProps.onSetOutOfOffice).toHaveBeenCalledWith('2024-01-15', 'OoO')
    })
  })

  describe('entry interactions', () => {
    it('should call onEditEntry when edit button is clicked', async () => {
      const user = userEvent.setup()
      render(<DayDetails {...mockProps} />)

      const editButton = screen.getAllByTitle(/edit entry/i)[0]
      await user.click(editButton)

      expect(mockProps.onEditEntry).toHaveBeenCalledWith('2024-01-15', 0)
    })

    it('should call onDeleteEntry when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(<DayDetails {...mockProps} />)

      const deleteButton = screen.getAllByTitle(/delete entry/i)[0]
      await user.click(deleteButton)

      expect(mockProps.onDeleteEntry).toHaveBeenCalledWith('2024-01-15', 0)
    })
  })

  describe('conditional rendering', () => {
    it('should not show Add Hours button when editing', () => {
      const editingProps = {
        ...mockProps,
        editingDate: '2024-01-15',
      }
      render(<DayDetails {...editingProps} />)

      expect(screen.queryByRole('button', { name: /add hours/i })).not.toBeInTheDocument()
    })

    it('should not show Add Hours button when day is OOO', () => {
      const oooProps = {
        ...mockProps,
        isOutOfOffice: jest.fn().mockReturnValue(true),
        getOutOfOfficeEntry: jest.fn().mockReturnValue(mockOutOfOfficeEntry),
      }
      render(<DayDetails {...oooProps} />)

      expect(screen.queryByRole('button', { name: /add hours/i })).not.toBeInTheDocument()
    })

    it('should not show Out of Office button when hours exist', () => {
      const propsWithHours = {
        ...mockProps,
        hasHoursLogged: jest.fn().mockReturnValue(true),
      }
      render(<DayDetails {...propsWithHours} />)

      expect(screen.queryByRole('button', { name: /out of office/i })).not.toBeInTheDocument()
    })

    it('should not show Out of Office button when day is already OOO', () => {
      const oooProps = {
        ...mockProps,
        isOutOfOffice: jest.fn().mockReturnValue(true),
        hasHoursLogged: jest.fn().mockReturnValue(false),
      }
      render(<DayDetails {...oooProps} />)

      expect(screen.queryByRole('button', { name: /out of office/i })).not.toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle missing OOO entry gracefully', () => {
      const oooProps = {
        ...mockProps,
        isOutOfOffice: jest.fn().mockReturnValue(true),
        getOutOfOfficeEntry: jest.fn().mockReturnValue(null),
      }

      expect(() => render(<DayDetails {...oooProps} />)).not.toThrow()
    })

    it('should handle empty entries for selected date', () => {
      const emptyEntriesProps = {
        ...mockProps,
        entries: { '2024-01-20': [] },
        hasHoursLogged: jest.fn().mockReturnValue(false),
      }
      render(<DayDetails {...emptyEntriesProps} />)

      expect(screen.getByText(/no hours logged for this day/i)).toBeInTheDocument()
    })

    it('should handle future dates correctly', () => {
      const futureDate = new Date('2024-12-31T10:00:00Z')
      const futureProps = {
        ...mockProps,
        selectedDate: futureDate,
        entries: {},
        hasHoursLogged: jest.fn().mockReturnValue(false),
      }
      render(<DayDetails {...futureProps} />)

      expect(screen.getByText(/december 31, 2024/i)).toBeInTheDocument()
      expect(screen.queryByText(/\(today\)/i)).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper heading structure', () => {
      render(<DayDetails {...mockProps} />)

      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument()
    })

    it('should have accessible button labels', () => {
      render(<DayDetails {...mockProps} />)

      const addHoursButton = screen.getByRole('button', { name: /add hours/i })
      expect(addHoursButton).toBeInTheDocument()
      expect(addHoursButton).toBeEnabled()
    })

    it('should have proper ARIA labels for entry actions', () => {
      render(<DayDetails {...mockProps} />)

      expect(screen.getAllByTitle(/edit entry/i)).toHaveLength(2)
      expect(screen.getAllByTitle(/delete entry/i)).toHaveLength(2)
    })
  })
})