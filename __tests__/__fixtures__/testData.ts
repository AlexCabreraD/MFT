import { 
  HourEntry, 
  FormData, 
  EntriesData, 
  OutOfOfficeData, 
  OutOfOfficeEntry, 
  ProgressStats,
  UserSupervisionData,
  UserAppData,
  CECategory,
  DeliveryFormat
} from '@/lib/types'

// Sample hour entries for testing
export const mockPsychotherapyEntry: HourEntry = {
  type: 'session',
  subtype: 'individual',
  hours: 2.5,
  notes: 'Individual therapy session with anxiety management',
  reviewedAudio: false,
  reviewedVideo: false,
  timestamp: '2024-01-15T10:00:00Z',
}

export const mockSupervisionEntry: HourEntry = {
  type: 'supervision',
  subtype: 'individual',
  hours: 1.0,
  notes: 'Weekly supervision with video review',
  reviewedAudio: false,
  reviewedVideo: true,
  timestamp: '2024-01-15T15:00:00Z',
}

export const mockCEEntry: HourEntry = {
  type: 'ce',
  subtype: 'workshop',
  hours: 6.0,
  notes: 'Ethics and Law workshop for therapists',
  reviewedAudio: false,
  reviewedVideo: false,
  timestamp: '2024-01-20T09:00:00Z',
  ceCategory: 'ethics-law-tech' as CECategory,
  deliveryFormat: 'in-person' as DeliveryFormat,
}

export const mockFormData: FormData = {
  type: 'psychotherapy',
  subtype: 'individual',
  hours: '2.0',
  notes: 'Test session notes',
  reviewedAudio: false,
  reviewedVideo: false,
}

export const mockCEFormData: FormData = {
  type: 'ce',
  subtype: 'workshop',
  hours: '4.0',
  notes: 'CE workshop on family therapy',
  reviewedAudio: false,
  reviewedVideo: false,
  ceCategory: 'mft-specific' as CECategory,
  deliveryFormat: 'online-interactive' as DeliveryFormat,
}

export const mockEntriesData: EntriesData = {
  '2024-01-15': [mockPsychotherapyEntry, mockSupervisionEntry],
  '2024-01-20': [mockCEEntry],
  '2024-01-22': [
    {
      type: 'session',
      subtype: 'family',
      hours: 1.5,
      notes: 'Family therapy session',
      reviewedAudio: false,
      reviewedVideo: false,
      timestamp: '2024-01-22T14:00:00Z',
    }
  ],
}

export const mockOutOfOfficeEntry: OutOfOfficeEntry = {
  id: 1,
  user_id: 'test-user-123',
  date: '2024-01-25',
  reason: 'OoO',
  notes: 'Vacation day',
  created_at: '2024-01-24T12:00:00Z',
  updated_at: '2024-01-24T12:00:00Z',
}

export const mockOutOfOfficeData: OutOfOfficeData = {
  '2024-01-25': mockOutOfOfficeEntry,
  '2024-01-26': {
    id: 2,
    user_id: 'test-user-123',
    date: '2024-01-26',
    reason: 'OoO',
    notes: 'Sick leave',
    created_at: '2024-01-25T12:00:00Z',
    updated_at: '2024-01-25T12:00:00Z',
  }
}

export const mockSupervisionData: UserSupervisionData = {
  total: 25.5,
  videoAudio: 10.0,
  sessions: [
    {
      date: '2024-01-15',
      hours: 1.0,
      hasVideo: true,
      hasAudio: false,
      notes: 'Video supervision session',
      timestamp: '2024-01-15T15:00:00Z',
    },
    {
      date: '2024-01-08',
      hours: 1.5,
      hasVideo: false,
      hasAudio: true,
      notes: 'Audio review session',
      timestamp: '2024-01-08T15:00:00Z',
    }
  ]
}

export const mockProgressStats: ProgressStats = {
  // Clinical Hours
  totalClinicalHours: 500.5,
  directMftHours: 300.0,
  relationalHours: 150.5,
  clinicalProgress: 16.68, // 500.5 / 3000 * 100
  endorsementProgress: 12.51, // 500.5 / 4000 * 100
  directMftProgress: 30.0, // 300 / 1000 * 100
  
  // Backward compatibility
  totalSessionHours: 500.5,
  sessionProgress: 16.68,
  relationalProgress: 15.05, // 150.5 / 1000 * 100
  
  // CE Hours
  ceCycleHours: 20.0,
  ceProgress: 50.0, // 20 / 40 * 100
  ethicsLawTechHours: 3.0,
  ethicsLawTechMftHours: 2.0,
  suicidePreventionHours: 1.0,
  mftSpecificHours: 8.0,
  generalCeHours: 8.0,
  nonInteractiveHours: 5.0,
  ethicsLawTechProgress: 50.0, // 3 / 6 * 100
  suicidePreventionProgress: 50.0, // 1 / 2 * 100
  mftSpecificProgress: 53.33, // 8 / 15 * 100
  generalCeProgress: 47.06, // 8 / 17 * 100
  nonInteractiveProgress: 33.33, // 5 / 15 * 100
  
  // Supervision Hours
  totalSupervisionHours: 25.5,
  videoAudioSupervisionHours: 10.0,
  supervisionProgress: 25.5, // 25.5 / 100 * 100
  videoAudioSupervisionProgress: 40.0, // 10 / 25 * 100
  
  // Time-based Progress
  timeProgress: 25.0, // 6 months of 24 months
  timeRemaining: 548, // days remaining
}

export const mockUserAppData: UserAppData = {
  entries: mockEntriesData,
  outOfOfficeData: mockOutOfOfficeData,
  preferences: {
    selectedDate: '2024-01-15',
    calendarView: 'month',
  },
  supervisionHours: mockSupervisionData,
}

// Test user data
export const mockUser = {
  id: 'test-user-123',
  firstName: 'John',
  lastName: 'Doe',
  emailAddresses: [{ emailAddress: 'john.doe@example.com' }],
  unsafeMetadata: {
    trainingStartDate: '2023-07-01',
  },
  update: jest.fn(),
}

// Date fixtures for consistent testing
export const testDates = {
  today: new Date('2024-01-15T10:00:00Z'),
  yesterday: new Date('2024-01-14T10:00:00Z'),
  tomorrow: new Date('2024-01-16T10:00:00Z'),
  lastWeek: new Date('2024-01-08T10:00:00Z'),
  nextWeek: new Date('2024-01-22T10:00:00Z'),
  monthStart: new Date('2024-01-01T10:00:00Z'),
  monthEnd: new Date('2024-01-31T10:00:00Z'),
}

// Error scenarios for testing
export const mockErrors = {
  networkError: new Error('Network connection failed'),
  validationError: new Error('Validation failed: Hours must be greater than 0'),
  authError: new Error('Authentication required'),
  conflictError: new Error('Cannot add hours to a day marked as out of office'),
}

// Database response mocks
export const mockDatabaseResponses = {
  successfulInsert: { data: { id: 'new-entry-123' }, error: null },
  successfulUpdate: { data: { id: 'updated-entry-123' }, error: null },
  successfulDelete: { data: null, error: null },
  successfulSelect: { 
    data: [
      {
        id: 'entry-123',
        user_id: 'test-user-123',
        entry_date: '2024-01-15',
        type: 'session',
        subtype: 'individual',
        hours: 2.0,
        notes: 'Test entry',
        reviewed_audio: false,
        reviewed_video: false,
        timestamp: '2024-01-15T10:00:00Z',
      }
    ], 
    error: null 
  },
  emptyResult: { data: [], error: null },
  databaseError: { data: null, error: new Error('Database connection failed') },
}