import { EntriesData, OutOfOfficeData } from '@/lib/types';
import { formatDateKey, isToday, isSameDay } from '@/lib/utils/dateUtils';
import { isFederalHoliday, getFederalHolidayName } from '@/lib/utils/federalHolidays';
import { PersonalEvent, generateRecurringInstances } from '@/lib/utils/personalEvents';

interface MonthCalendarProps {
  selectedDate: Date;
  entries: EntriesData;
  outOfOfficeData: OutOfOfficeData;
  personalEvents: PersonalEvent[];
  onDateSelect: (date: Date) => void;
}

export const MonthCalendar = ({ selectedDate, entries, outOfOfficeData, personalEvents, onDateSelect }: MonthCalendarProps) => {
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
    const isOutOfOffice = !!outOfOfficeData[dateKey];
    const totalHours = dayEntries.reduce((sum, e) => sum + e.hours, 0);
    const isSelected = isSameDay(date, selectedDate);
    const isCurrentDay = isToday(date);
    const isHoliday = isFederalHoliday(date);
    const holidayName = getFederalHolidayName(date);
    
    // Get personal events for this date
    const personalEventInstances = personalEvents.flatMap(event => 
      generateRecurringInstances(event, year)
    ).filter(instance => instance.date === formatDateKey(date));
    
    const hasPersonalEvents = personalEventInstances.length > 0;
    
    // Get primary personal event color (for styling)
    const primaryPersonalEventColor = hasPersonalEvents ? personalEventInstances[0].color : null;
    
    // Convert hex color to lighter background version
    const getEventBackgroundColor = (color: string, opacity = 0.1) => {
      // Convert hex to RGB and apply opacity
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };
    
    const getEventBorderColor = (color: string, opacity = 0.3) => {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    days.push(
      <div
        key={day}
        className={`h-24 border p-1 cursor-pointer transition-all relative overflow-hidden ${
          isOutOfOffice && (isHoliday || hasPersonalEvents)
            ? (isSelected ? 'border-gray-400 shadow-md' : 'border-gray-300')
            : isOutOfOffice 
            ? 'bg-gray-100 border-gray-300 hover:bg-gray-200' 
            : isHoliday
            ? 'bg-red-25 border-red-200 hover:bg-red-50'
            : hasPersonalEvents && primaryPersonalEventColor
            ? (isSelected ? 'shadow-md' : '')
            : 'border-pink-100 hover:bg-pink-50'
        } ${
          isSelected ? (
            isOutOfOffice && !isHoliday && !hasPersonalEvents ? 'bg-gray-200 border-gray-400' : 
            !isOutOfOffice && isHoliday ? 'bg-red-50 border-red-300' : 
            !isOutOfOffice && hasPersonalEvents && primaryPersonalEventColor ? '' :
            !isOutOfOffice && !isHoliday && !hasPersonalEvents ? 'bg-pink-100 border-pink-300' : ''
          ) : ''
        } ${isCurrentDay ? 'ring-2 ring-pink-400' : ''} ${isHoliday ? 'ring-1 ring-red-300' : hasPersonalEvents && primaryPersonalEventColor ? 'ring-1' : ''}`}
        style={hasPersonalEvents && primaryPersonalEventColor && !isOutOfOffice ? {
          backgroundColor: isSelected ? getEventBackgroundColor(primaryPersonalEventColor, 0.15) : getEventBackgroundColor(primaryPersonalEventColor, 0.08),
          borderColor: isSelected ? getEventBorderColor(primaryPersonalEventColor, 0.5) : getEventBorderColor(primaryPersonalEventColor, 0.3),
          '--tw-ring-color': getEventBorderColor(primaryPersonalEventColor, 0.5)
        } as React.CSSProperties : {}}
        onClick={() => onDateSelect(date)}
      >
        {/* Diagonal split background for special combinations */}
        {isOutOfOffice && (isHoliday || hasPersonalEvents) && (
          <>
            <div 
              className={`absolute inset-0 ${isHoliday ? 'bg-red-100' : ''}`}
              style={{ 
                clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
                backgroundColor: isHoliday ? undefined : (hasPersonalEvents && primaryPersonalEventColor ? getEventBackgroundColor(primaryPersonalEventColor, 0.2) : '#dbeafe')
              }}
            ></div>
            <div className="absolute inset-0 bg-gray-100" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
          </>
        )}
        
        <div className="flex items-center gap-1 relative z-10">
          <div className={`text-sm font-medium ${
            isCurrentDay ? 'text-pink-600' : 
            isOutOfOffice ? 'text-gray-600' : 
            isHoliday ? 'text-red-700' : 
            hasPersonalEvents && primaryPersonalEventColor ? primaryPersonalEventColor : 'text-gray-700'
          }`}>
            {day}
          </div>
          {isHoliday && (
            <div className="text-xs text-red-600 font-medium leading-tight">
              {holidayName}
            </div>
          )}
          {!isHoliday && hasPersonalEvents && personalEventInstances.length === 1 && (
            <div 
              className="text-xs font-medium leading-tight"
              style={{ color: primaryPersonalEventColor || '#2563eb' }}
            >
              {personalEventInstances[0].title}
            </div>
          )}
          {!isHoliday && personalEventInstances.length > 1 && (
            <div 
              className="text-xs font-medium leading-tight"
              style={{ color: primaryPersonalEventColor || '#2563eb' }}
            >
              {personalEventInstances.length} events
            </div>
          )}
        </div>
        
        {/* Show Out of Office text with Dancing Script font */}
        {isOutOfOffice && (
          <div className="text-lg text-gray-500 mt-1 font-[family-name:var(--font-dancing-script)] leading-tight relative z-10">
            Out of Office
          </div>
        )}
        
        {/* Show hours and entries if not out of office */}
        {!isOutOfOffice && totalHours > 0 && (
          <div className="text-xs text-pink-600 mt-1 relative z-10">
            {totalHours}h
          </div>
        )}
        {!isOutOfOffice && dayEntries.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 relative z-10">
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