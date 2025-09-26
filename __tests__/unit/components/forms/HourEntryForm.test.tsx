import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HourEntryForm } from '@/components/forms/HourEntryForm'
import { mockFormData, mockCEFormData } from '../../../__fixtures__/testData'

describe('HourEntryForm', () => {
  const mockProps = {
    formData: mockFormData,
    onFormDataChange: jest.fn(),
    onSave: jest.fn(),
    onCancel: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render all form fields', () => {
      render(<HourEntryForm {...mockProps} />)

      expect(screen.getByText(/hour type/i)).toBeInTheDocument()
      expect(screen.getByText(/hours/i)).toBeInTheDocument()
      expect(screen.getByText(/notes/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.getByDisplayValue('2.0')).toBeInTheDocument() // Hours input value
    })

    it('should display psychotherapy subtypes for psychotherapy entries', () => {
      const psychoFormData = { ...mockFormData, type: 'psychotherapy' as const }
      render(<HourEntryForm {...mockProps} formData={psychoFormData} />)

      fireEvent.change(screen.getByLabelText(/type/i), { target: { value: 'psychotherapy' } })
      
      expect(screen.getByText(/therapy type/i)).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /individual therapy/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /family therapy/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /couple\/marriage therapy/i })).toBeInTheDocument()
    })

    it('should display CE-specific fields for CE entries', () => {
      render(<HourEntryForm {...mockProps} formData={mockCEFormData} />)

      expect(screen.getByLabelText(/ce category/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/delivery format/i)).toBeInTheDocument()
    })

    it('should show supervision review options for supervision entries', () => {
      const supervisionFormData = { 
        ...mockFormData, 
        type: 'supervision' as const,
        subtype: 'individual',
        reviewedVideo: true
      }
      render(<HourEntryForm {...mockProps} formData={supervisionFormData} />)

      expect(screen.getByLabelText(/reviewed this session/i)).toBeInTheDocument()
    })
  })

  describe('form interactions', () => {
    it('should call onFormDataChange when type changes', async () => {
      const user = userEvent.setup()
      render(<HourEntryForm {...mockProps} />)

      const typeSelect = screen.getByLabelText(/type/i)
      await user.selectOptions(typeSelect, 'supervision')

      expect(mockProps.onFormDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'supervision',
          subtype: '', // Should reset subtype when type changes
        })
      )
    })

    it('should call onFormDataChange when hours change', async () => {
      const user = userEvent.setup()
      render(<HourEntryForm {...mockProps} />)

      const hoursInput = screen.getByLabelText(/hours/i)
      await user.clear(hoursInput)
      await user.type(hoursInput, '3.5')

      expect(mockProps.onFormDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          hours: '3.5',
        })
      )
    })

    it('should call onFormDataChange when notes change', async () => {
      const user = userEvent.setup()
      render(<HourEntryForm {...mockProps} />)

      const notesTextarea = screen.getByLabelText(/notes/i)
      await user.clear(notesTextarea)
      await user.type(notesTextarea, 'Updated session notes')

      expect(mockProps.onFormDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: 'Updated session notes',
        })
      )
    })

    it('should handle subtype changes correctly', async () => {
      const user = userEvent.setup()
      const psychoFormData = { ...mockFormData, type: 'psychotherapy' as const }
      render(<HourEntryForm {...mockProps} formData={psychoFormData} />)

      const subtypeSelect = screen.getByLabelText(/therapy type/i)
      await user.selectOptions(subtypeSelect, 'family')

      expect(mockProps.onFormDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          subtype: 'family',
        })
      )
    })
  })

  describe('CE form functionality', () => {
    it('should handle CE category selection', async () => {
      const user = userEvent.setup()
      render(<HourEntryForm {...mockProps} formData={mockCEFormData} />)

      const categorySelect = screen.getByLabelText(/ce category/i)
      await user.selectOptions(categorySelect, 'ethics-law-tech')

      expect(mockProps.onFormDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          ceCategory: 'ethics-law-tech',
        })
      )
    })

    it('should handle delivery format selection', async () => {
      const user = userEvent.setup()
      render(<HourEntryForm {...mockProps} formData={mockCEFormData} />)

      const formatSelect = screen.getByLabelText(/delivery format/i)
      await user.selectOptions(formatSelect, 'online-interactive')

      expect(mockProps.onFormDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          deliveryFormat: 'online-interactive',
        })
      )
    })

    it('should display CE category descriptions', () => {
      render(<HourEntryForm {...mockProps} formData={mockCEFormData} />)

      expect(screen.getByText(/general continuing education hours/i)).toBeInTheDocument()
      expect(screen.getByText(/ethics, law, or technology/i)).toBeInTheDocument()
      expect(screen.getByText(/suicide prevention/i)).toBeInTheDocument()
      expect(screen.getByText(/mft-specific/i)).toBeInTheDocument()
    })
  })

  describe('supervision review functionality', () => {
    const supervisionFormData = {
      ...mockFormData,
      type: 'supervision' as const,
      subtype: 'individual',
    }

    it('should enable review options when reviewed checkbox is checked', async () => {
      const user = userEvent.setup()
      render(<HourEntryForm {...mockProps} formData={supervisionFormData} />)

      const reviewedCheckbox = screen.getByLabelText(/reviewed this session/i)
      await user.click(reviewedCheckbox)

      expect(screen.getByRole('radio', { name: /video/i })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /audio/i })).toBeInTheDocument()
    })

    it('should handle video review selection', async () => {
      const user = userEvent.setup()
      const reviewFormData = { ...supervisionFormData, reviewedVideo: true }
      render(<HourEntryForm {...mockProps} formData={reviewFormData} />)

      // The checkbox should be checked initially due to reviewedVideo: true
      const videoRadio = screen.getByRole('radio', { name: /video/i })
      await user.click(videoRadio)

      expect(mockProps.onFormDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          reviewedVideo: true,
          reviewedAudio: false,
        })
      )
    })

    it('should handle audio review selection', async () => {
      const user = userEvent.setup()
      const reviewFormData = { ...supervisionFormData, reviewedAudio: true }
      render(<HourEntryForm {...mockProps} formData={reviewFormData} />)

      const audioRadio = screen.getByRole('radio', { name: /audio/i })
      await user.click(audioRadio)

      expect(mockProps.onFormDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          reviewedVideo: false,
          reviewedAudio: true,
        })
      )
    })

    it('should clear review options when unchecking reviewed checkbox', async () => {
      const user = userEvent.setup()
      const reviewFormData = { ...supervisionFormData, reviewedVideo: true }
      render(<HourEntryForm {...mockProps} formData={reviewFormData} />)

      const reviewedCheckbox = screen.getByLabelText(/reviewed this session/i)
      await user.click(reviewedCheckbox) // Uncheck

      expect(mockProps.onFormDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          reviewedVideo: false,
          reviewedAudio: false,
        })
      )
    })
  })

  describe('form actions', () => {
    it('should call onSave when save button is clicked', async () => {
      const user = userEvent.setup()
      render(<HourEntryForm {...mockProps} />)

      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      expect(mockProps.onSave).toHaveBeenCalled()
    })

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<HourEntryForm {...mockProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(mockProps.onCancel).toHaveBeenCalled()
    })
  })

  describe('form validation display', () => {
    it('should show validation styling for required fields', () => {
      const emptyFormData = {
        type: 'psychotherapy' as const,
        subtype: '',
        hours: '',
        notes: '',
        reviewedAudio: false,
        reviewedVideo: false,
      }
      render(<HourEntryForm {...mockProps} formData={emptyFormData} />)

      const hoursInput = screen.getByLabelText(/hours/i)
      expect(hoursInput).toHaveAttribute('required')
    })

    it('should handle decimal hours input correctly', async () => {
      const user = userEvent.setup()
      render(<HourEntryForm {...mockProps} />)

      const hoursInput = screen.getByLabelText(/hours/i)
      await user.clear(hoursInput)
      await user.type(hoursInput, '2.75')

      expect(mockProps.onFormDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          hours: '2.75',
        })
      )
    })
  })

  describe('accessibility', () => {
    it('should have proper labels for all form fields', () => {
      render(<HourEntryForm {...mockProps} formData={mockCEFormData} />)

      expect(screen.getByLabelText(/type/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/ce type/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/hours/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/ce category/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/delivery format/i)).toBeInTheDocument()
    })

    it('should have proper button roles and text', () => {
      render(<HourEntryForm {...mockProps} />)

      const saveButton = screen.getByRole('button', { name: /save/i })
      const cancelButton = screen.getByRole('button', { name: /cancel/i })

      expect(saveButton).toBeInTheDocument()
      expect(cancelButton).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle rapid form changes without errors', async () => {
      const user = userEvent.setup()
      render(<HourEntryForm {...mockProps} />)

      const typeSelect = screen.getByLabelText(/type/i)
      const hoursInput = screen.getByLabelText(/hours/i)

      // Rapid changes
      await user.selectOptions(typeSelect, 'supervision')
      await user.selectOptions(typeSelect, 'ce')
      await user.selectOptions(typeSelect, 'psychotherapy')
      
      await user.clear(hoursInput)
      await user.type(hoursInput, '1')
      await user.clear(hoursInput)
      await user.type(hoursInput, '2.5')

      expect(mockProps.onFormDataChange).toHaveBeenCalledTimes(7) // 3 type changes + 4 hours changes
    })

    it('should handle form reset correctly', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<HourEntryForm {...mockProps} />)

      // Make some changes
      const hoursInput = screen.getByLabelText(/hours/i)
      await user.clear(hoursInput)
      await user.type(hoursInput, '5.0')

      // Reset form data
      const resetFormData = {
        type: 'psychotherapy' as const,
        subtype: '',
        hours: '',
        notes: '',
        reviewedAudio: false,
        reviewedVideo: false,
      }

      rerender(<HourEntryForm {...mockProps} formData={resetFormData} />)

      expect(screen.getByLabelText(/hours/i)).toHaveValue('')
    })
  })
})