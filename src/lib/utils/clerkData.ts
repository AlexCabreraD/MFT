import { UserResource } from '@clerk/types';
import { EntriesData } from '@/lib/types';

export interface UserAppData {
  entries: EntriesData;
  preferences?: {
    selectedDate?: string;
    calendarView?: 'month' | 'week';
  };
  supervisionHours?: {
    total: number;
    videoAudio: number;
    sessions: Array<{
      date: string;
      hours: number;
      hasVideo: boolean;
      hasAudio: boolean;
      notes?: string;
      timestamp: string;
    }>;
  };
  trainingStartDate?: string; // ISO date string for when supervised training began
}

export const saveToClerkMetadata = async (user: UserResource, data: UserAppData): Promise<void> => {
  try {
    await user.update({
      unsafeMetadata: {
        ...user.unsafeMetadata,
        appData: data
      }
    });
  } catch (error) {
    console.error('Error saving to Clerk metadata:', error);
    throw error;
  }
};

export const loadFromClerkMetadata = (user: UserResource): UserAppData => {
  try {
    const metadata = user.unsafeMetadata as { appData?: UserAppData };
    return metadata.appData || { entries: {} };
  } catch (error) {
    console.error('Error loading from Clerk metadata:', error);
    return { entries: {} };
  }
};

export const clearClerkMetadata = async (user: UserResource): Promise<void> => {
  try {
    await user.update({
      unsafeMetadata: {
        ...user.unsafeMetadata,
        appData: undefined
      }
    });
  } catch (error) {
    console.error('Error clearing Clerk metadata:', error);
    throw error;
  }
};