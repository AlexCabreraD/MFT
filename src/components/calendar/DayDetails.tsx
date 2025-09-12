import { Plus } from 'lucide-react';
import { EntriesData, FormData } from '@/lib/types';
import { formatDateKey, isToday } from '@/lib/utils/dateUtils';
import { HourEntryForm } from '@/components/forms/HourEntryForm';
import { EntryCard } from '@/components/ui/EntryCard';

interface DayDetailsProps {
  selectedDate: Date;
  entries: EntriesData;
  editingDate: string | null;
  formData: FormData;
  onEditingDateChange: (dateKey: string | null) => void;
  onFormDataChange: (data: FormData) => void;
  onSaveEntry: () => void;
  onEditEntry: (dateKey: string, index: number) => void;
  onDeleteEntry: (dateKey: string, index: number) => void;
}

export const DayDetails = ({ 
  selectedDate, 
  entries, 
  editingDate, 
  formData,
  onEditingDateChange,
  onFormDataChange,
  onSaveEntry,
  onEditEntry,
  onDeleteEntry
}: DayDetailsProps) => {
  const dateKey = formatDateKey(selectedDate);
  const dayEntries = entries[dateKey] || [];
  const isEditMode = editingDate === dateKey;
  const canEdit = !editingDate || editingDate === dateKey;

  const handleAddHours = () => {
    onEditingDateChange(dateKey);
  };

  const handleCancel = () => {
    onEditingDateChange(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-medium text-gray-900 max-w-[calc(100%-7rem-16px)] flex-1 min-w-0">
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
          {isToday(selectedDate) && (
            <span className="ml-2 text-sm text-pink-600 font-normal">(Today)</span>
          )}
        </h3>
        {!isEditMode && canEdit && (
          <button
            onClick={handleAddHours}
            className="bg-pink-500 text-white px-3 py-1 rounded-md hover:bg-pink-600 transition-colors flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Hours
          </button>
        )}
      </div>

      {isEditMode && (
        <HourEntryForm
          formData={formData}
          onFormDataChange={onFormDataChange}
          onSave={onSaveEntry}
          onCancel={handleCancel}
        />
      )}

      {dayEntries.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Today&apos;s Entries</h4>
          <div className="max-h-64 overflow-y-auto space-y-2">
              {dayEntries.map((entry, index) => (
                <EntryCard
                  key={index}
                  entry={entry}
                  onEdit={() => onEditEntry(dateKey, index)}
                  onDelete={() => onDeleteEntry(dateKey, index)}
                />
              ))}
            </div>
          </div>
      )}

      {dayEntries.length === 0 && !isEditMode && (
        <div className="text-center py-8 text-gray-500">
          No hours logged for this day
        </div>
      )}
    </div>
  );
};