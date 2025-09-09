import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { EntriesData, FormData, HourEntry, ProgressStats } from '@/lib/types';
import { formatDateKey, isToday } from '@/lib/utils/dateUtils';
import { calculateProgress } from '@/lib/utils/progressUtils';
import { saveToClerkMetadata, loadFromClerkMetadata, UserAppData } from '@/lib/utils/clerkData';

const defaultFormData: FormData = {
  type: 'psychotherapy',
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
  const [supervisionData, setSupervisionData] = useState<UserAppData['supervisionHours']>();
  const [trainingStartDate, setTrainingStartDate] = useState<string | undefined>(undefined);
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
        setSupervisionData(userData.supervisionHours || { total: 0, videoAudio: 0, sessions: [] });
        setTrainingStartDate(userData.trainingStartDate);
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

  // Save data to Clerk metadata whenever entries, supervision data, or training start date change
  useEffect(() => {
    if (user && (Object.keys(entries).length > 0 || supervisionData || trainingStartDate)) {
      const saveData = async () => {
        try {
          await saveToClerkMetadata(user, { entries, supervisionHours: supervisionData, trainingStartDate });
        } catch (error) {
          console.error('Error saving data:', error);
        }
      };
      saveData();
    }
  }, [entries, supervisionData, trainingStartDate, user]);

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
      type: formData.type === 'psychotherapy' ? 'session' : formData.type,
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

    // Convert session entries with psychotherapy subtypes back to "psychotherapy" type for editing
    const psychotherapyTypes = ['individual', 'family', 'couple'];
    const displayType = entry.type === 'session' && psychotherapyTypes.includes(entry.subtype) 
      ? 'psychotherapy' 
      : entry.type;

    const editFormData: FormData = {
      type: displayType as FormData['type'],
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

  const addSupervisionHours = (hours: number, hasVideo: boolean, hasAudio: boolean, notes?: string) => {
    const newSession = {
      date: formatDateKey(new Date()),
      hours,
      hasVideo,
      hasAudio,
      notes,
      timestamp: new Date().toISOString()
    };

    setSupervisionData(prev => {
      const updated = prev || { total: 0, videoAudio: 0, sessions: [] };
      const newTotal = updated.total + hours;
      const newVideoAudio = updated.videoAudio + (hasVideo || hasAudio ? hours : 0);
      
      return {
        total: newTotal,
        videoAudio: newVideoAudio,
        sessions: [...updated.sessions, newSession]
      };
    });
  };

  const deleteSupervisionSession = (index: number) => {
    setSupervisionData(prev => {
      if (!prev) return prev;
      
      const sessionToDelete = prev.sessions[index];
      const newTotal = prev.total - sessionToDelete.hours;
      const newVideoAudio = prev.videoAudio - (sessionToDelete.hasVideo || sessionToDelete.hasAudio ? sessionToDelete.hours : 0);
      
      return {
        total: Math.max(0, newTotal),
        videoAudio: Math.max(0, newVideoAudio),
        sessions: prev.sessions.filter((_, i) => i !== index)
      };
    });
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
    deleteSupervisionSession,
    trainingStartDate,
    updateTrainingStartDate
  };
};