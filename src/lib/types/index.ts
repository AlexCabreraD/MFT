export interface HourEntry {
  type: 'session' | 'supervision' | 'ce';
  subtype: string;
  hours: number;
  notes: string;
  reviewedAudio: boolean;
  reviewedVideo: boolean;
  timestamp: string;
  ceCategory?: CECategory;
  deliveryFormat?: DeliveryFormat;
}

export interface OutOfOfficeEntry {
  id?: number;
  user_id?: string;
  date: string; // YYYY-MM-DD format
  reason: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OutOfOfficeData {
  [dateKey: string]: OutOfOfficeEntry;
}

export interface FormData {
  type: 'session' | 'supervision' | 'ce' | 'psychotherapy';
  subtype: string;
  hours: string;
  notes: string;
  reviewedAudio: boolean;
  reviewedVideo: boolean;
  ceCategory?: CECategory;
  deliveryFormat?: DeliveryFormat;
}

export interface EntriesData {
  [dateKey: string]: HourEntry[];
}

export interface ProgressStats {
  // Clinical Hours (for MFT licensure)
  totalClinicalHours: number;
  directMftHours: number; // Direct face-to-face MFT client contact
  relationalHours: number; // Family/couple therapy (subset of direct MFT)
  clinicalProgress: number; // Progress toward 3,000 hours (initial licensure)
  endorsementProgress: number; // Progress toward 4,000 hours (licensure by endorsement)
  directMftProgress: number; // Progress toward 1,000 direct MFT hours
  
  // Backward compatibility
  totalSessionHours: number;
  sessionProgress: number;
  relationalProgress: number;
  
  // CE Hours (for license renewal)
  ceCycleHours: number;
  ceProgress: number;
  ethicsLawTechHours: number;
  ethicsLawTechMftHours: number; // MFT-specific within ethics/law/tech
  suicidePreventionHours: number;
  mftSpecificHours: number;
  generalCeHours: number;
  nonInteractiveHours: number;
  ethicsLawTechProgress: number;
  suicidePreventionProgress: number;
  mftSpecificProgress: number;
  generalCeProgress: number;
  nonInteractiveProgress: number;
  
  // Supervision Hours
  totalSupervisionHours: number;
  videoAudioSupervisionHours: number;
  supervisionProgress: number;
  videoAudioSupervisionProgress: number;
  
  // Time-based Progress
  timeProgress: number; // Progress toward 2-year minimum requirement
  timeRemaining: number; // Days remaining until 2-year minimum is met
}

export interface CECycleInfo {
  start: Date;
  end: Date;
}

export type ViewType = 'calendar' | 'analytics' | 'supervision' | 'requirements';
export type CalendarViewType = 'month' | 'week';

export interface SubtypeOption {
  value: string;
  label: string;
}

export type CECategory = 'general' | 'ethics-law-tech' | 'suicide-prevention' | 'mft-specific';

export type DeliveryFormat = 'in-person' | 'online-interactive' | 'online-non-interactive';

export interface CECategoryOption {
  value: CECategory;
  label: string;
  description: string;
  required: number;
  color: string;
  isSpecialty?: boolean;
}

export interface DeliveryFormatOption {
  value: DeliveryFormat;
  label: string;
}