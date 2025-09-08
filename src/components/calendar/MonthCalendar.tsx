import { EntriesData } from '@/lib/types';
import { formatDateKey, isToday, isSameDay } from '@/lib/utils/dateUtils';

interface MonthCalendarProps {
  selectedDate: Date;
  entries: EntriesData;
  onDateSelect: (date: Date) => void;
}

export const MonthCalendar = ({ selectedDate, entries, onDateSelect }: MonthCalendarProps) => {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="h-24" />);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = formatDateKey(date);
    const dayEntries = entries[dateKey] || [];
    const totalHours = dayEntries.reduce((sum, e) => sum + e.hours, 0);
    const isSelected = isSameDay(date, selectedDate);
    const isCurrentDay = isToday(date);

    days.push(
      <div
        key={day}
        className={`h-24 border border-pink-100 p-1 cursor-pointer transition-all hover:bg-pink-50 ${
          isSelected ? 'bg-pink-100 border-pink-300' : ''
        } ${isCurrentDay ? 'ring-2 ring-pink-400' : ''}`}
        onClick={() => onDateSelect(date)}
      >
        <div className={`text-sm font-medium ${isCurrentDay ? 'text-pink-600' : 'text-gray-700'}`}>
          {day}
        </div>
        {totalHours > 0 && (
          <div className="text-xs text-pink-600 mt-1">
            {totalHours}h
          </div>
        )}
        {dayEntries.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {dayEntries.slice(0, 2).map((entry, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  entry.type === 'session' ? 'bg-pink-400' :
                  entry.type === 'supervision' ? 'bg-purple-400' : 'bg-blue-400'
                }`}
              />
            ))}
            {dayEntries.length > 2 && (
              <div className="text-xs text-gray-500">+{dayEntries.length - 2}</div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-7 gap-0">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="h-10 bg-pink-50 border border-pink-200 flex items-center justify-center font-medium text-pink-700">
          {day}
        </div>
      ))}
      {days}
    </div>
  );
};