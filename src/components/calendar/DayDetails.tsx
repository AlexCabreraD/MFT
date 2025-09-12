import { Plus, Home } from 'lucide-react';
import { EntriesData, FormData, OutOfOfficeEntry } from '@/lib/types';
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
  onSetOutOfOffice: (dateKey: string, reason: string, notes?: string) => void;
  onRemoveOutOfOffice: (dateKey: string) => void;
  isOutOfOffice: (dateKey: string) => boolean;
  getOutOfOfficeEntry: (dateKey: string) => OutOfOfficeEntry | null;
  hasHoursLogged: (dateKey: string) => boolean;
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
  onDeleteEntry,
  onSetOutOfOffice,
  onRemoveOutOfOffice,
  isOutOfOffice,
  getOutOfOfficeEntry,
  hasHoursLogged
}: DayDetailsProps) => {
  const dateKey = formatDateKey(selectedDate);
  const dayEntries = entries[dateKey] || [];
  const isEditMode = editingDate === dateKey;
  const canEdit = !editingDate || editingDate === dateKey;
  const isDayOutOfOffice = isOutOfOffice(dateKey);
  const outOfOfficeEntry = getOutOfOfficeEntry(dateKey);
  const hasHours = hasHoursLogged(dateKey);

  const handleAddHours = () => {
    onEditingDateChange(dateKey);
  };

  const handleCancel = () => {
    onEditingDateChange(null);
  };

  const handleSetOutOfOffice = () => {
    // Close the editing form if it's open
    if (isEditMode) {
      onEditingDateChange(null);
    }
    // Set with default reason (handled in the hook)
    onSetOutOfOffice(dateKey, 'OoO');
  };

  const handleRemoveOutOfOffice = () => {
    onRemoveOutOfOffice(dateKey);
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
        {canEdit && (
          <div className="flex flex-col gap-2">
            {/* Show Add Hours button only if not out of office and not editing */}
            {!isDayOutOfOffice && !isEditMode && (
              <button
                onClick={handleAddHours}
                className="bg-pink-500 text-white px-3 py-1 rounded-md hover:bg-pink-600 transition-colors flex items-center gap-2 cursor-pointer flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Hours
              </button>
            )}
            
            {/* Show Out of Office toggle button if no hours exist and not out of office */}
            {!hasHours && !isDayOutOfOffice && (
              <button
                onClick={handleSetOutOfOffice}
                className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2 cursor-pointer flex-shrink-0"
              >
                <Home className="w-4 h-4" />
                Out of Office
              </button>
            )}
            
            {/* Show Back to Office button when out of office */}
            {isDayOutOfOffice && (
              <button
                onClick={handleRemoveOutOfOffice}
                className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2 cursor-pointer flex-shrink-0"
              >
                <Home className="w-4 h-4" />
                Back to Office
              </button>
            )}
          </div>
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

      {/* Show regular hour entries */}
      {hasHours && (
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

      {/* Out of Office Display */}
      {isDayOutOfOffice && outOfOfficeEntry && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-2">Out of Office</h4>
          <div className="text-sm text-gray-600">
            <p>This day is marked as out of office.</p>
            {outOfOfficeEntry.notes && (
              <p className="mt-1"><strong>Notes:</strong> {outOfOfficeEntry.notes}</p>
            )}
          </div>
        </div>
      )}

      {!hasHours && !isEditMode && !isDayOutOfOffice && (
        <div className="text-center py-8 text-gray-500">
          No hours logged for this day
        </div>
      )}
    </div>
  );
};