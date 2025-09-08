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

export interface FormData {
  type: 'session' | 'supervision' | 'ce';
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
  totalSessionHours: number;
  relationalHours: number;
  ceCycleHours: number;
  sessionProgress: number;
  relationalProgress: number;
  ceProgress: number;
  ethicsLawTechHours: number;
  suicidePreventionHours: number;
  mftSpecificHours: number;
  generalCeHours: number;
  ethicsLawTechProgress: number;
  suicidePreventionProgress: number;
  mftSpecificProgress: number;
  generalCeProgress: number;
}

export interface CECycleInfo {
  start: Date;
  end: Date;
}

export type ViewType = 'calendar' | 'analytics';
export type CalendarViewType = 'month' | 'week';

export interface SubtypeOption {
  value: string;
  label: string;
}

export type CECategory = 'general' | 'ethics-law-tech' | 'suicide-prevention' | 'mft-specific';

export type DeliveryFormat = 'in-person' | 'online';

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