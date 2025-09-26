import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { formatDateKey, parseDateString } from './dateUtils';

// Direct type definitions to avoid Database interface inference issues
export interface PersonalEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_type: 'birthday' | 'anniversary' | 'appointment' | 'reminder' | 'payday' | 'custom';
  recurrence_type: 'none' | 'weekly' | 'monthly' | 'yearly';
  recurrence_interval: number | null;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PersonalEventInsert {
  id?: string;
  user_id: string;
  title: string;
  description?: string | null;
  event_date: string;
  event_type?: 'birthday' | 'anniversary' | 'appointment' | 'reminder' | 'payday' | 'custom';
  recurrence_type?: 'none' | 'weekly' | 'monthly' | 'yearly';
  recurrence_interval?: number | null;
  color?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PersonalEventUpdate {
  id?: string;
  user_id?: string;
  title?: string;
  description?: string | null;
  event_date?: string;
  event_type?: 'birthday' | 'anniversary' | 'appointment' | 'reminder' | 'payday' | 'custom';
  recurrence_type?: 'none' | 'weekly' | 'monthly' | 'yearly';
  recurrence_interval?: number | null;
  color?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RecurringEventInstance {
  id: string;
  title: string;
  description: string | null;
  date: string;
  event_type: string;
  color: string;
  is_recurring: boolean;
  base_event_id: string;
}

export const eventColors = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' }
];

export const eventTypes = [
  { value: 'birthday', label: 'Birthday', icon: '🎂' },
  { value: 'anniversary', label: 'Anniversary', icon: '💝' },
  { value: 'appointment', label: 'Appointment', icon: '📅' },
  { value: 'reminder', label: 'Reminder', icon: '⏰' },
  { value: 'payday', label: 'Payday', icon: '💰' },
  { value: 'custom', label: 'Custom', icon: '⭐' }
];

export const recurrenceTypes = [
  { value: 'none', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' }
];

export async function createPersonalEvent(supabase: SupabaseClient, event: PersonalEventInsert): Promise<PersonalEvent | null> {
  // First, get the user's UUID from user_profiles using their Clerk ID
  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('clerk_user_id', event.user_id)
    .single() as { data: { id: string } | null, error: PostgrestError | null };

  if (profileError || !userProfile) {
    console.error('Error finding user profile:', profileError);
    return null;
  }

  const eventToInsert: PersonalEventInsert = {
    title: event.title,
    description: event.description,
    event_date: event.event_date,
    event_type: event.event_type,
    recurrence_type: event.recurrence_type,
    recurrence_interval: event.recurrence_interval,
    color: event.color,
    is_active: event.is_active,
    user_id: userProfile.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('personal_events')
    .insert(eventToInsert)
    .select()
    .single();

  if (error) {
    console.error('Error creating personal event:', error);
    return null;
  }

  return data;
}

export async function getPersonalEvents(supabase: SupabaseClient, userId: string): Promise<PersonalEvent[]> {
  // First, get the user's UUID from user_profiles using their Clerk ID
  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('clerk_user_id', userId)
    .single() as { data: { id: string } | null, error: PostgrestError | null };

  if (profileError || !userProfile) {
    console.error('Error finding user profile:', profileError);
    return [];
  }

  const { data, error } = await supabase
    .from('personal_events')
    .select('*')
    .eq('user_id', userProfile.id)
    .eq('is_active', true)
    .order('event_date', { ascending: true });

  if (error) {
    console.error('Error fetching personal events:', error);
    return [];
  }

  return data || [];
}

export async function updatePersonalEvent(supabase: SupabaseClient, id: string, updates: PersonalEventUpdate): Promise<PersonalEvent | null> {
  const updateData: PersonalEventUpdate = {
    title: updates.title,
    description: updates.description,
    event_date: updates.event_date,
    event_type: updates.event_type,
    recurrence_type: updates.recurrence_type,
    recurrence_interval: updates.recurrence_interval,
    color: updates.color,
    is_active: updates.is_active,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('personal_events')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating personal event:', error);
    return null;
  }

  return data;
}

export async function deletePersonalEvent(supabase: SupabaseClient, id: string): Promise<boolean> {
  const updateData: PersonalEventUpdate = { 
    is_active: false, 
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('personal_events')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error deleting personal event:', error);
    return false;
  }

  return true;
}

export function generateRecurringInstances(event: PersonalEvent, year: number): RecurringEventInstance[] {
  const baseDate = parseDateString(event.event_date);

  if (event.recurrence_type === 'none') {
    // Only return the event if it's in the requested year
    if (baseDate.getFullYear() === year) {
      return [{
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.event_date,
        event_type: event.event_type,
        color: event.color,
        is_recurring: false,
        base_event_id: event.id
      }];
    }
    return [];
  }

  const instances: RecurringEventInstance[] = [];
  const interval = event.recurrence_interval || 1;

  // Helper function to create instance object
  const createInstance = (date: Date, instanceId: string) => ({
    id: instanceId,
    title: event.title,
    description: event.description,
    date: formatDateKey(date),
    event_type: event.event_type,
    color: event.color,
    is_recurring: true,
    base_event_id: event.id
  });

  switch (event.recurrence_type) {
    case 'yearly': {
      const yearlyDate = new Date(year, baseDate.getMonth(), baseDate.getDate());
      if (yearlyDate.getFullYear() === year) {
        instances.push(createInstance(yearlyDate, `${event.id}_${year}`));
      }
      break;
    }

    case 'monthly': {
      for (let month = 0; month < 12; month++) {
        if (month % interval === baseDate.getMonth() % interval) {
          const monthlyDate = new Date(year, month, baseDate.getDate());
          if (monthlyDate.getFullYear() === year && monthlyDate.getMonth() === month) {
            instances.push(createInstance(monthlyDate, `${event.id}_${year}_${month}`));
          }
        }
      }
      break;
    }

    case 'weekly': {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);
      const currentDate = new Date(baseDate);

      // Find first occurrence in the year
      while (currentDate < startOfYear) {
        currentDate.setDate(currentDate.getDate() + (7 * interval));
      }

      while (currentDate <= endOfYear) {
        if (currentDate.getFullYear() === year) {
          instances.push(createInstance(new Date(currentDate), `${event.id}_${year}_${currentDate.getTime()}`));
        }
        currentDate.setDate(currentDate.getDate() + (7 * interval));
      }
      break;
    }
  }

  return instances;
}
