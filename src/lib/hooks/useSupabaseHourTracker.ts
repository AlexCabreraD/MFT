import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { EntriesData, FormData, HourEntry, ProgressStats } from '@/lib/types';
import { formatDateKey, isToday } from '@/lib/utils/dateUtils';
import { calculateProgress } from '@/lib/utils/progressUtils';
import { useSupabaseClient } from '@/lib/hooks/useSupabaseClient';
import { loadFromClerkMetadata, saveToClerkMetadata } from '@/lib/utils/clerkData';
import {
  loadFromSupabase,
  saveHourEntry,
  updateHourEntry,
  deleteHourEntry,
  UserSupervisionData
} from '@/lib/utils/supabaseData';

const defaultFormData: FormData = {
  type: 'session',
  subtype: '',
  hours: '',
  notes: '',
  reviewedAudio: false,
  reviewedVideo: false,
  ceCategory: undefined,
  deliveryFormat: undefined
};

export const useSupabaseHourTracker = () => {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [entries, setEntries] = useState<EntriesData>({});
  const [supervisionData, setSupervisionData] = useState<UserSupervisionData>();
  const [trainingStartDate, setTrainingStartDate] = useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from Supabase when user changes
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        try {
          setLoading(true);
          setError(null);
          const userData = await loadFromSupabase(supabase, user.id);
          setEntries(userData.entries || {});
          setSupervisionData(userData.supervisionHours || { total: 0, videoAudio: 0, sessions: [] });
          
          // Load training start date from Clerk metadata
          const clerkData = loadFromClerkMetadata(user);
          setTrainingStartDate(clerkData.trainingStartDate);
        } catch (err) {
          console.error('Error loading data from Supabase:', err);
          setError('Failed to load data from database');
        } finally {
          setLoading(false);
        }
      };
      loadData();
    } else {
      setLoading(false);
    }
  }, [user, supabase]);

  // Save training start date to Clerk metadata when it changes
  useEffect(() => {
    if (user && trainingStartDate !== undefined) {
      const saveData = async () => {
        try {
          const clerkData = loadFromClerkMetadata(user);
          await saveToClerkMetadata(user, { 
            ...clerkData, 
            trainingStartDate 
          });
        } catch (error) {
          console.error('Error saving training start date to Clerk metadata:', error);
        }
      };
      saveData();
    }
  }, [trainingStartDate, user]);

  // Initialize editing for today by default when today is selected
  useEffect(() => {
    const currentDateKey = formatDateKey(selectedDate);
    const todayKey = formatDateKey(new Date());
    
    if (isToday(selectedDate) && !editingDate) {
      setEditingDate(currentDateKey);
    } else if (!isToday(selectedDate) && editingDate === todayKey) {
      setEditingDate(null);
    }
  }, [selectedDate, editingDate]);

  const saveEntry = async (): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    if (!formData.hours || parseFloat(formData.hours) <= 0) {
      alert('Please enter valid hours');
      return false;
    }

    if (parseFloat(formData.hours) > 16) {
      if (!confirm('You entered more than 16 hours in a day. Is this correct?')) {
        return false;
      }
    }

    // Additional validation for CE entries
    if (formData.type === 'ce') {
      if (!formData.subtype) {
        alert('Please select a CE type');
        return false;
      }
      if (!formData.ceCategory) {
        alert('Please select a CE category');
        return false;
      }
      if (!formData.deliveryFormat) {
        alert('Please select a delivery format');
        return false;
      }
    }

    // Validation for non-CE entries
    if (formData.type !== 'ce' && !formData.subtype) {
      alert('Please select a subtype');
      return false;
    }

    if (!editingDate) return false;

    try {
      setError(null);
      const entry: HourEntry = {
        ...formData,
        hours: parseFloat(formData.hours),
        timestamp: new Date().toISOString()
      };

      if (editingIndex !== null) {
        // Editing existing entry
        const oldEntry = entries[editingDate]?.[editingIndex];
        if (oldEntry) {
          await updateHourEntry(supabase, user.id, editingDate, oldEntry, entry);
        }
      } else {
        // Adding new entry
        await saveHourEntry(supabase, user.id, editingDate, entry);
      }

      // Update local state
      setEntries(prev => {
        const newEntries = { ...prev };
        
        if (editingIndex !== null) {
          if (newEntries[editingDate]) {
            newEntries[editingDate] = [...newEntries[editingDate]];
            newEntries[editingDate][editingIndex] = entry;
          }
        } else {
          newEntries[editingDate] = [...(newEntries[editingDate] || []), entry];
        }
        
        return newEntries;
      });

      // Reset form
      setFormData(defaultFormData);
      setEditingDate(null);
      setEditingIndex(null);
      return true;
    } catch (err) {
      console.error('Error saving entry:', err);
      setError('Failed to save entry to database');
      return false;
    }
  };

  const deleteEntry = async (dateKey: string, index: number) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);
      const entry = entries[dateKey]?.[index];
      if (entry) {
        await deleteHourEntry(supabase, user.id, dateKey, entry);
        
        // Update local state
        setEntries(prev => {
          const newEntries = { ...prev };
          newEntries[dateKey] = newEntries[dateKey].filter((_, i) => i !== index);
          if (newEntries[dateKey].length === 0) {
            delete newEntries[dateKey];
          }
          return newEntries;
        });
      }
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError('Failed to delete entry from database');
    }
  };

  const editEntry = (dateKey: string, index: number) => {
    const entry = entries[dateKey]?.[index];
    if (!entry) return;

    const editFormData: FormData = {
      type: entry.type,
      subtype: entry.subtype,
      hours: entry.hours.toString(),
      notes: entry.notes,
      reviewedAudio: entry.reviewedAudio,
      reviewedVideo: entry.reviewedVideo,
      ceCategory: entry.ceCategory,
      deliveryFormat: entry.deliveryFormat
    };

    setFormData(editFormData);
    setEditingDate(dateKey);
    setEditingIndex(index);
  };

  const cancelEdit = () => {
    setFormData(defaultFormData);
    setEditingDate(null);
    setEditingIndex(null);
  };

  const addSupervisionHours = async (hours: number, hasVideo: boolean, hasAudio: boolean, notes?: string) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);
      const entry: HourEntry = {
        type: 'supervision',
        subtype: 'individual', // Default subtype, could be made configurable
        hours,
        notes: notes || '',
        reviewedAudio: hasAudio,
        reviewedVideo: hasVideo,
        timestamp: new Date().toISOString()
      };

      const dateKey = formatDateKey(new Date());
      await saveHourEntry(supabase, user.id, dateKey, entry);

      // Update local state for entries
      setEntries(prev => {
        const newEntries = { ...prev };
        newEntries[dateKey] = [...(newEntries[dateKey] || []), entry];
        return newEntries;
      });

      // Update supervision data for backward compatibility
      setSupervisionData(prev => {
        const updated = prev || { total: 0, videoAudio: 0, sessions: [] };
        const newTotal = updated.total + hours;
        const newVideoAudio = updated.videoAudio + (hasVideo || hasAudio ? hours : 0);
        const newSession = {
          date: dateKey,
          hours,
          hasVideo,
          hasAudio,
          notes,
          timestamp: entry.timestamp
        };
        
        return {
          total: newTotal,
          videoAudio: newVideoAudio,
          sessions: [...updated.sessions, newSession]
        };
      });
    } catch (err) {
      console.error('Error adding supervision hours:', err);
      setError('Failed to save supervision session to database');
    }
  };

  const deleteSupervisionSessionLocal = async (index: number) => {
    if (!user || !supervisionData) {
      setError('User not authenticated or no supervision data');
      return;
    }

    try {
      setError(null);
      const sessionToDelete = supervisionData.sessions[index];
      
      // Find the corresponding entry in the entries data
      const dateKey = sessionToDelete.date;
      const entryIndex = entries[dateKey]?.findIndex(entry => 
        entry.type === 'supervision' && 
        entry.timestamp === sessionToDelete.timestamp
      );
      
      if (entryIndex !== undefined && entryIndex >= 0 && entries[dateKey]) {
        const entryToDelete = entries[dateKey][entryIndex];
        await deleteHourEntry(supabase, user.id, dateKey, entryToDelete);
        
        // Update entries state
        setEntries(prev => {
          const newEntries = { ...prev };
          newEntries[dateKey] = newEntries[dateKey].filter((_, i) => i !== entryIndex);
          if (newEntries[dateKey].length === 0) {
            delete newEntries[dateKey];
          }
          return newEntries;
        });
      }

      // Update supervision data for backward compatibility
      setSupervisionData(prev => {
        if (!prev) return prev;
        
        const newTotal = prev.total - sessionToDelete.hours;
        const newVideoAudio = prev.videoAudio - (sessionToDelete.hasVideo || sessionToDelete.hasAudio ? sessionToDelete.hours : 0);
        
        return {
          total: Math.max(0, newTotal),
          videoAudio: Math.max(0, newVideoAudio),
          sessions: prev.sessions.filter((_, i) => i !== index)
        };
      });
    } catch (err) {
      console.error('Error deleting supervision session:', err);
      setError('Failed to delete supervision session from database');
    }
  };

  const updateTrainingStartDate = (dateString: string) => {
    setTrainingStartDate(dateString);
  };

  const progress: ProgressStats = calculateProgress(entries, trainingStartDate);

  return {
    entries,
    selectedDate,
    setSelectedDate,
    editingDate,
    setEditingDate,
    editingIndex,
    formData,
    setFormData,
    saveEntry,
    editEntry,
    deleteEntry,
    cancelEdit,
    progress,
    supervisionData,
    addSupervisionHours,
    deleteSupervisionSession: deleteSupervisionSessionLocal,
    trainingStartDate,
    updateTrainingStartDate,
    loading,
    error
  };
};