import { User } from '@clerk/nextjs/server';
import { EntriesData } from '@/lib/types';

export interface UserAppData {
  entries: EntriesData;
  preferences?: {
    selectedDate?: string;
    calendarView?: 'month' | 'week';
  };
}

export const saveToClerkMetadata = async (user: User, data: UserAppData): Promise<void> => {
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

export const loadFromClerkMetadata = (user: User): UserAppData => {
  try {
    const metadata = user.unsafeMetadata as { appData?: UserAppData };
    return metadata.appData || { entries: {} };
  } catch (error) {
    console.error('Error loading from Clerk metadata:', error);
    return { entries: {} };
  }
};

export const clearClerkMetadata = async (user: User): Promise<void> => {
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