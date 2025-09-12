import { SupabaseClient } from '@supabase/supabase-js'
import { EntriesData, HourEntry, OutOfOfficeData, OutOfOfficeEntry } from '@/lib/types'

export interface UserSupervisionData {
  total: number
  videoAudio: number
  sessions: Array<{
    date: string
    hours: number
    hasVideo: boolean
    hasAudio: boolean
    notes?: string
    timestamp: string
  }>
}

export interface UserAppData {
  entries: EntriesData
  outOfOfficeData: OutOfOfficeData
  preferences?: {
    selectedDate?: string
    calendarView?: 'month' | 'week'
  }
  supervisionHours?: UserSupervisionData
}

// Ensure user profile exists and return user_id
export const ensureUserProfile = async (
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<string> => {
  // Try to find existing profile
  const { data: profiles, error: selectError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .limit(1)

  if (selectError) {
    throw selectError
  }

  if (profiles && profiles.length > 0) {
    return (profiles[0] as { id: string }).id
  }

  // Create new profile
  const { data: newProfile, error: insertError } = await supabase
    .from('user_profiles')
    .insert({ clerk_user_id: clerkUserId } as Record<string, unknown>)
    .select('id')
    .single()

  if (insertError) {
    throw insertError
  }

  if (!newProfile) {
    throw new Error('Failed to create user profile')
  }

  return (newProfile as { id: string }).id
}

// Load all user data from Supabase
export const loadFromSupabase = async (
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<UserAppData> => {
  try {
    const userId = await ensureUserProfile(supabase, clerkUserId)

    // Get user preferences
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('preferences')
      .eq('id', userId)
      .single()

    // Get hour entries
    const { data: hourEntries, error: entriesError } = await supabase
      .from('hour_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })

    if (entriesError) throw entriesError

    // Convert hour entries to the expected format
    const entries: EntriesData = {}
    hourEntries?.forEach(entry => {
      const dateKey = entry.entry_date
      if (!entries[dateKey]) {
        entries[dateKey] = []
      }
      entries[dateKey].push({
        type: entry.type,
        subtype: entry.subtype,
        hours: entry.hours,
        notes: entry.notes,
        reviewedAudio: entry.reviewed_audio,
        reviewedVideo: entry.reviewed_video,
        timestamp: entry.timestamp,
        ceCategory: entry.ce_category || undefined,
        deliveryFormat: entry.delivery_format || undefined
      })
    })

    // Get supervision data from hour_entries
    const supervisionEntries = hourEntries?.filter(entry => entry.type === 'supervision') || []
    let supervisionHours: UserSupervisionData | undefined
    if (supervisionEntries.length > 0) {
      const sessions = supervisionEntries.map(entry => ({
        date: entry.entry_date,
        hours: parseFloat(entry.hours),
        hasVideo: entry.reviewed_video,
        hasAudio: entry.reviewed_audio,
        notes: entry.notes || undefined,
        timestamp: entry.timestamp
      }))

      const total = sessions.reduce((sum, session) => sum + session.hours, 0)
      const videoAudio = sessions.reduce((sum, session) => {
        return sum + (session.hasVideo || session.hasAudio ? session.hours : 0)
      }, 0)

      supervisionHours = {
        total,
        videoAudio,
        sessions
      }
    }

    // Load out of office data
    const outOfOfficeData = await loadOutOfOfficeData(supabase, clerkUserId)

    return {
      entries,
      outOfOfficeData,
      preferences: profile?.preferences,
      supervisionHours
    }
  } catch (error) {
    console.error('Error loading from Supabase:', error)
    return { 
      entries: {},
      outOfOfficeData: {}
    }
  }
}

// Save hour entry to Supabase
export const saveHourEntry = async (
  supabase: SupabaseClient,
  clerkUserId: string,
  dateKey: string,
  entry: HourEntry
): Promise<void> => {
  const userId = await ensureUserProfile(supabase, clerkUserId)

  // Check if date is marked as out of office
  const canAddHours = await canAddHoursToDate(supabase, clerkUserId, dateKey)
  if (!canAddHours) {
    throw new Error('Cannot add hours to a day marked as out of office')
  }

  const { error } = await supabase
    .from('hour_entries')
    .insert({
      user_id: userId,
      entry_date: dateKey,
      type: entry.type,
      subtype: entry.subtype,
      hours: entry.hours,
      notes: entry.notes,
      reviewed_audio: entry.reviewedAudio,
      reviewed_video: entry.reviewedVideo,
      ce_category: entry.ceCategory || null,
      delivery_format: entry.deliveryFormat || null,
      timestamp: entry.timestamp
    })

  if (error) {
    throw error
  }
}

// Update hour entry in Supabase
export const updateHourEntry = async (
  supabase: SupabaseClient,
  clerkUserId: string,
  dateKey: string,
  oldEntry: HourEntry,
  newEntry: HourEntry
): Promise<void> => {
  const userId = await ensureUserProfile(supabase, clerkUserId)

  // Find the entry to update by matching all fields
  const { data: existingEntries, error: selectError } = await supabase
    .from('hour_entries')
    .select('id')
    .eq('user_id', userId)
    .eq('entry_date', dateKey)
    .eq('type', oldEntry.type)
    .eq('subtype', oldEntry.subtype)
    .eq('hours', oldEntry.hours)
    .eq('timestamp', oldEntry.timestamp)

  if (selectError) throw selectError

  if (!existingEntries || existingEntries.length === 0) {
    throw new Error('Entry not found for update')
  }

  const { error: updateError } = await supabase
    .from('hour_entries')
    .update({
      type: newEntry.type,
      subtype: newEntry.subtype,
      hours: newEntry.hours,
      notes: newEntry.notes,
      reviewed_audio: newEntry.reviewedAudio,
      reviewed_video: newEntry.reviewedVideo,
      ce_category: newEntry.ceCategory || null,
      delivery_format: newEntry.deliveryFormat || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', existingEntries[0].id)

  if (updateError) {
    throw updateError
  }
}

// Delete hour entry from Supabase
export const deleteHourEntry = async (
  supabase: SupabaseClient,
  clerkUserId: string,
  dateKey: string,
  entry: HourEntry
): Promise<void> => {
  const userId = await ensureUserProfile(supabase, clerkUserId)

  const { error } = await supabase
    .from('hour_entries')
    .delete()
    .eq('user_id', userId)
    .eq('entry_date', dateKey)
    .eq('type', entry.type)
    .eq('subtype', entry.subtype)
    .eq('hours', entry.hours)
    .eq('timestamp', entry.timestamp)

  if (error) {
    throw error
  }
}

// Out of Office operations

// Save out of office entry
export const saveOutOfOfficeEntry = async (
  supabase: SupabaseClient,
  clerkUserId: string,
  entry: OutOfOfficeEntry
): Promise<void> => {
  const userId = await ensureUserProfile(supabase, clerkUserId)

  // First check if date has existing hour entries
  const { data: existingHours, error: hoursCheckError } = await supabase
    .from('hour_entries')
    .select('id')
    .eq('user_id', userId)
    .eq('entry_date', entry.date)
    .limit(1)

  if (hoursCheckError) {
    throw hoursCheckError
  }

  if (existingHours && existingHours.length > 0) {
    throw new Error('Cannot mark day as out of office when hours are already logged')
  }

  const { error } = await supabase
    .from('out_of_office')
    .insert({
      user_id: userId,
      date: entry.date,
      reason: entry.reason,
      notes: entry.notes || null
    })

  if (error) {
    throw error
  }
}

// Delete out of office entry
export const deleteOutOfOfficeEntry = async (
  supabase: SupabaseClient,
  clerkUserId: string,
  dateKey: string
): Promise<void> => {
  const userId = await ensureUserProfile(supabase, clerkUserId)

  const { error } = await supabase
    .from('out_of_office')
    .delete()
    .eq('user_id', userId)
    .eq('date', dateKey)

  if (error) {
    throw error
  }
}

// Load out of office data
export const loadOutOfOfficeData = async (
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<OutOfOfficeData> => {
  const userId = await ensureUserProfile(supabase, clerkUserId)

  const { data, error } = await supabase
    .from('out_of_office')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    throw error
  }

  const outOfOfficeData: OutOfOfficeData = {}
  if (data) {
    data.forEach((entry: any) => {
      outOfOfficeData[entry.date] = {
        id: entry.id,
        user_id: entry.user_id,
        date: entry.date,
        reason: entry.reason,
        notes: entry.notes,
        created_at: entry.created_at,
        updated_at: entry.updated_at
      }
    })
  }

  return outOfOfficeData
}

// Validation function to check if date can accept hour entries
export const canAddHoursToDate = async (
  supabase: SupabaseClient,
  clerkUserId: string,
  dateKey: string
): Promise<boolean> => {
  const userId = await ensureUserProfile(supabase, clerkUserId)

  const { data, error } = await supabase
    .from('out_of_office')
    .select('id')
    .eq('user_id', userId)
    .eq('date', dateKey)
    .limit(1)

  if (error) {
    throw error
  }

  return !data || data.length === 0
}

// Save user preferences to Supabase
export const saveUserPreferences = async (
  supabase: SupabaseClient,
  clerkUserId: string,
  preferences: Record<string, unknown>
): Promise<void> => {
  const userId = await ensureUserProfile(supabase, clerkUserId)

  const { error } = await supabase
    .from('user_profiles')
    .update({
      preferences,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    throw error
  }
}