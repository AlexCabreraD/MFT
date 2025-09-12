import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarViewType } from '@/lib/types';

interface CalendarHeaderProps {
  selectedDate: Date;
  calendarView: CalendarViewType;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarViewType) => void;
  onTodayClick: () => void;
}

export const CalendarHeader = ({ 
  selectedDate, 
  calendarView, 
  onDateChange, 
  onViewChange, 
  onTodayClick 
}: CalendarHeaderProps) => {
  const handlePrevious = () => {
    const newDate = new Date(selectedDate);
    if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    onDateChange(newDate);
  };

  const getHeaderTitle = () => {
    if (calendarView === 'month') {
      return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
      return `Week of ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  };

  return (
    <div className="bg-pink-50 border-b border-pink-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <button
            onClick={handlePrevious}
            className="p-1 hover:bg-pink-100 rounded"
          >
            <ChevronLeft className="w-5 h-5 text-pink-600" />
          </button>
          
          <h2 
            className="text-lg font-semibold text-pink-900 font-[family-name:var(--font-dancing-script)] whitespace-nowrap overflow-hidden text-ellipsis min-w-0 max-w-xs"
            title={getHeaderTitle()}
          >
            {getHeaderTitle()}
          </h2>
          
          <button
            onClick={handleNext}
            className="p-1 hover:bg-pink-100 rounded"
          >
            <ChevronRight className="w-5 h-5 text-pink-600" />
          </button>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onViewChange('month')}
            className={`px-3 py-1 rounded text-sm transition-colors cursor-pointer ${
              calendarView === 'month' 
                ? 'bg-pink-200 text-pink-800' 
                : 'text-pink-600 hover:bg-pink-100'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => onViewChange('week')}
            className={`px-3 py-1 rounded text-sm transition-colors cursor-pointer ${
              calendarView === 'week' 
                ? 'bg-pink-200 text-pink-800' 
                : 'text-pink-600 hover:bg-pink-100'
            }`}
          >
            Week
          </button>
          <button
            onClick={onTodayClick}
            className="px-3 py-1 rounded text-sm bg-pink-500 text-white hover:bg-pink-600 transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>
      </div>
    </div>
  );
};