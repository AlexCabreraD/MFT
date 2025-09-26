import { Database } from '@/lib/supabase';
import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';

export type PersonalEvent = Database['public']['Tables']['personal_events']['Row'];
export type PersonalEventInsert = Database['public']['Tables']['personal_events']['Insert'];
export type PersonalEventUpdate = Database['public']['Tables']['personal_events']['Update'];

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
  { value: 'custom', label: 'Custom', icon: '⭐' }
];

export const recurrenceTypes = [
  { value: 'none', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' }
];

export async function createPersonalEvent(supabase: SupabaseClient<Database>, event: PersonalEventInsert): Promise<PersonalEvent | null> {
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
    ...event,
    user_id: userProfile.id, // Use the UUID from user_profiles
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

export async function getPersonalEvents(supabase: SupabaseClient<Database>, userId: string): Promise<PersonalEvent[]> {
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

export async function updatePersonalEvent(supabase: SupabaseClient<Database>, id: string, updates: PersonalEventUpdate): Promise<PersonalEvent | null> {
  console.log('Updating personal event with ID:', id);
  console.log('Update data:', updates);
  
  const { data, error } = await supabase
    .from('personal_events')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    } as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating personal event:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return null;
  }

  console.log('Update successful:', data);
  return data;
}

export async function deletePersonalEvent(supabase: SupabaseClient<Database>, id: string): Promise<boolean> {
  const { error } = await supabase
    .from('personal_events')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error deleting personal event:', error);
    return false;
  }

  return true;
}

export function generateRecurringInstances(event: PersonalEvent, year: number): RecurringEventInstance[] {
  if (event.recurrence_type === 'none') {
    const eventYear = new Date(event.event_date).getFullYear();
    if (eventYear === year) {
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
  const baseDate = new Date(event.event_date);
  const interval = event.recurrence_interval || 1;

  switch (event.recurrence_type) {
    case 'yearly':
      const yearlyDate = new Date(year, baseDate.getMonth(), baseDate.getDate());
      if (yearlyDate.getFullYear() === year) {
        instances.push({
          id: `${event.id}_${year}`,
          title: event.title,
          description: event.description,
          date: formatDateToString(yearlyDate),
          event_type: event.event_type,
          color: event.color,
          is_recurring: true,
          base_event_id: event.id
        });
      }
      break;

    case 'monthly':
      for (let month = 0; month < 12; month++) {
        if (month % interval === baseDate.getMonth() % interval) {
          const monthlyDate = new Date(year, month, baseDate.getDate());
          if (monthlyDate.getFullYear() === year && monthlyDate.getMonth() === month) {
            instances.push({
              id: `${event.id}_${year}_${month}`,
              title: event.title,
              description: event.description,
              date: formatDateToString(monthlyDate),
              event_type: event.event_type,
              color: event.color,
              is_recurring: true,
              base_event_id: event.id
            });
          }
        }
      }
      break;

    case 'weekly':
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);
      let currentDate = new Date(baseDate);
      
      // Find first occurrence in the year
      while (currentDate < startOfYear) {
        currentDate.setDate(currentDate.getDate() + (7 * interval));
      }

      while (currentDate <= endOfYear) {
        if (currentDate.getFullYear() === year) {
          instances.push({
            id: `${event.id}_${year}_${currentDate.getTime()}`,
            title: event.title,
            description: event.description,
            date: formatDateToString(currentDate),
            event_type: event.event_type,
            color: event.color,
            is_recurring: true,
            base_event_id: event.id
          });
        }
        currentDate.setDate(currentDate.getDate() + (7 * interval));
      }
      break;

    case 'daily':
      // For daily events, limit to avoid performance issues
      const startDate = new Date(Math.max(baseDate.getTime(), new Date(year, 0, 1).getTime()));
      const endDate = new Date(year, 11, 31);
      currentDate = new Date(startDate);

      while (currentDate <= endDate && instances.length < 365) {
        instances.push({
          id: `${event.id}_${year}_${currentDate.getTime()}`,
          title: event.title,
          description: event.description,
          date: formatDateToString(currentDate),
          event_type: event.event_type,
          color: event.color,
          is_recurring: true,
          base_event_id: event.id
        });
        currentDate.setDate(currentDate.getDate() + interval);
      }
      break;
  }

  return instances;
}

export function getPersonalEventsForDate(events: PersonalEvent[], date: Date): RecurringEventInstance[] {
  const year = date.getFullYear();
  const dateString = formatDateToString(date);
  const allInstances: RecurringEventInstance[] = [];

  events.forEach(event => {
    const instances = generateRecurringInstances(event, year);
    const matchingInstances = instances.filter(instance => instance.date === dateString);
    allInstances.push(...matchingInstances);
  });

  return allInstances;
}

function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}