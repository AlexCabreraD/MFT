import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { EntriesData, FormData, HourEntry, ProgressStats } from '@/lib/types';
import { formatDateKey, isToday } from '@/lib/utils/dateUtils';
import { calculateProgress } from '@/lib/utils/progressUtils';
import { saveToClerkMetadata, loadFromClerkMetadata } from '@/lib/utils/clerkData';

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

export const useHourTracker = () => {
  const { user } = useUser();
  const [entries, setEntries] = useState<EntriesData>({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);

  // Load data from Clerk metadata when user changes
  useEffect(() => {
    if (user) {
      try {
        const userData = loadFromClerkMetadata(user);
        setEntries(userData.entries || {});
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to localStorage for migration
        const storageKey = `mft-entries-${user.id}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsedEntries = JSON.parse(saved);
          setEntries(parsedEntries);
          // Migrate to Clerk metadata
          saveToClerkMetadata(user, { entries: parsedEntries }).catch(console.error);
          localStorage.removeItem(storageKey);
        }
      }
    }
  }, [user]);

  // Save data to Clerk metadata whenever entries change
  useEffect(() => {
    if (user && Object.keys(entries).length > 0) {
      const saveData = async () => {
        try {
          await saveToClerkMetadata(user, { entries });
        } catch (error) {
          console.error('Error saving data:', error);
        }
      };
      saveData();
    }
  }, [entries, user]);

  // Initialize editing for today by default when today is selected
  useEffect(() => {
    const currentDateKey = formatDateKey(selectedDate);
    const todayKey = formatDateKey(new Date());
    
    if (isToday(selectedDate) && !editingDate) {
      setEditingDate(currentDateKey);
    } else if (!isToday(selectedDate) && editingDate === todayKey) {
      // Clear editing mode when switching away from today to avoid blocking other days
      setEditingDate(null);
    }
  }, [selectedDate, editingDate]);

  const saveEntry = (): boolean => {
    if (!formData.hours || parseFloat(formData.hours) <= 0) {
      alert('Please enter valid hours');
      return false;
    }

    if (parseFloat(formData.hours) > 16) {
      if (!confirm('You entered more than 16 hours in a day. Is this correct?')) {
        return false;
      }
    }

    if (!editingDate) return false;

    const entry: HourEntry = {
      ...formData,
      hours: parseFloat(formData.hours),
      timestamp: new Date().toISOString()
    };

    setEntries(prev => {
      const newEntries = { ...prev };
      
      if (editingIndex !== null) {
        // Editing existing entry
        if (newEntries[editingDate]) {
          newEntries[editingDate] = [...newEntries[editingDate]];
          newEntries[editingDate][editingIndex] = entry;
        }
      } else {
        // Adding new entry
        newEntries[editingDate] = [...(newEntries[editingDate] || []), entry];
      }
      
      return newEntries;
    });

    // Reset form
    setFormData(defaultFormData);
    setEditingDate(null);
    setEditingIndex(null);
    return true;
  };

  const deleteEntry = (dateKey: string, index: number) => {
    setEntries(prev => {
      const newEntries = { ...prev };
      newEntries[dateKey] = newEntries[dateKey].filter((_, i) => i !== index);
      if (newEntries[dateKey].length === 0) {
        delete newEntries[dateKey];
      }
      return newEntries;
    });
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

  const progress: ProgressStats = calculateProgress(entries);

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
    progress
  };
};