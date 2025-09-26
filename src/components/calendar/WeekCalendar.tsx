import { EntriesData, OutOfOfficeData } from '@/lib/types';
import { formatDateKey, isToday, isSameDay } from '@/lib/utils/dateUtils';
import { isFederalHoliday, getFederalHolidayName } from '@/lib/utils/federalHolidays';
import { PersonalEvent } from '@/lib/utils/personalEvents';
import { getEventBackgroundColor, getEventBorderColor } from '@/lib/utils/colorUtils';
import { getPersonalEventsForDate } from '@/lib/utils/calendarUtils';
import { Clock, TrendingUp, Target, AlertCircle } from 'lucide-react';

interface WeekCalendarProps {
  selectedDate: Date;
  entries: EntriesData;
  outOfOfficeData: OutOfOfficeData;
  personalEvents: PersonalEvent[];
  onDateSelect: (date: Date) => void;
}

export const WeekCalendar = ({ selectedDate, entries, outOfOfficeData, personalEvents, onDateSelect }: WeekCalendarProps) => {
  const getSessionDisplayLabel = (type: string, subtype: string) => {
    if (type !== 'session') return type;
    
    // Psychotherapy sessions
    const psychotherapyTypes = ['individual', 'family', 'couple'];
    if (psychotherapyTypes.includes(subtype)) {
      return 'psychotherapy';
    }
    
    // Other session types remain as "session"
    return 'session';
  };
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    weekDays.push(date);
  }

  // Calculate week statistics
  const weekStats = weekDays.reduce((stats, date) => {
    const dateKey = formatDateKey(date);
    const dayEntries = entries[dateKey] || [];
    const dayTotal = dayEntries.reduce((sum, e) => sum + e.hours, 0);
    
    return {
      totalHours: stats.totalHours + dayTotal,
      sessionHours: stats.sessionHours + dayEntries.filter(e => e.type === 'session').reduce((sum, e) => sum + e.hours, 0),
      supervisionHours: stats.supervisionHours + dayEntries.filter(e => e.type === 'supervision').reduce((sum, e) => sum + e.hours, 0),
      ceHours: stats.ceHours + dayEntries.filter(e => e.type === 'ce').reduce((sum, e) => sum + e.hours, 0),
      activeDays: dayTotal > 0 ? stats.activeDays + 1 : stats.activeDays
    };
  }, { totalHours: 0, sessionHours: 0, supervisionHours: 0, ceHours: 0, activeDays: 0 });

  const weekGoal = 20; // MFT training weekly goal
  const progressPercentage = Math.min((weekStats.totalHours / weekGoal) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Week Summary Stats */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-100">
        <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-pink-600" />
          Week Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600">{weekStats.totalHours}</div>
            <div className="text-xs text-gray-600">Total Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{weekStats.sessionHours}</div>
            <div className="text-xs text-gray-600">Session Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{weekStats.supervisionHours}</div>
            <div className="text-xs text-gray-600">Supervision</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{weekStats.activeDays}</div>
            <div className="text-xs text-gray-600">Active Days</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Weekly Progress</span>
            <span className="text-sm font-medium text-gray-800">{weekStats.totalHours}h / {weekGoal}h</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Week Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
      {weekDays.map(date => {
        const dateKey = formatDateKey(date);
        const dayEntries = entries[dateKey] || [];
        const isOutOfOffice = !!outOfOfficeData[dateKey];
        const totalHours = dayEntries.reduce((sum, e) => sum + e.hours, 0);
        const isSelected = isSameDay(date, selectedDate);
        const isCurrentDay = isToday(date);
        const isHoliday = isFederalHoliday(date);
        const holidayName = getFederalHolidayName(date);
        
        // Get personal events for this date
        const personalEventInstances = getPersonalEventsForDate(personalEvents, date);
        
        const hasPersonalEvents = personalEventInstances.length > 0;
        
        // Get primary personal event color (for styling)
        const primaryPersonalEventColor = hasPersonalEvents ? personalEventInstances[0].color : null;

        return (
          <div
            key={dateKey}
            className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md relative overflow-hidden ${
              isOutOfOffice && (isHoliday || hasPersonalEvents)
                ? (isSelected ? 'border-gray-400 shadow-md' : 'border-gray-300')
                : isOutOfOffice 
                ? (isSelected ? 'bg-gray-100 border-gray-400' : 'bg-gray-50 border-gray-300')
                : isHoliday
                ? (isSelected ? 'bg-red-50 border-red-300 shadow-md' : 'bg-red-25 border-red-200')
                : hasPersonalEvents && primaryPersonalEventColor
                ? (isSelected ? 'shadow-md' : '')
                : (isSelected ? 'bg-pink-50 border-pink-300 shadow-md' : 'border-pink-100')
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
            
            <div className={`font-medium relative z-10 ${
              isCurrentDay ? 'text-pink-600' : 
              isHoliday ? 'text-red-700' : 
              hasPersonalEvents && primaryPersonalEventColor ? primaryPersonalEventColor : 'text-gray-700'
            }`}>
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <div className={`text-lg ${
                isCurrentDay ? 'text-pink-600' : 
                isOutOfOffice ? 'text-gray-600' : 
                isHoliday ? 'text-red-700' : 
                hasPersonalEvents && primaryPersonalEventColor ? primaryPersonalEventColor : 'text-gray-900'
              }`}>
                {date.getDate()}
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
            
            {isOutOfOffice && (
              <div className="text-sm text-gray-500 mt-1 font-[family-name:var(--font-dancing-script)] relative z-10">
                Out of Office
              </div>
            )}
            
            {!isOutOfOffice && (
              <>
                {totalHours > 0 && (
                  <div className="text-sm text-pink-600 mt-1 font-medium relative z-10">
                    {totalHours}h
                  </div>
                )}
                <div className="mt-2 space-y-1 relative z-10">
                  {dayEntries.slice(0, 3).map((entry, idx) => (
                    <div
                      key={idx}
                      className={`text-xs px-2 py-1 rounded ${
                        entry.type === 'session' ? 'bg-pink-100 text-pink-700' :
                        entry.type === 'supervision' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {getSessionDisplayLabel(entry.type, entry.subtype)} - {entry.hours}h
                    </div>
                  ))}
                  {dayEntries.length > 3 && (
                    <div className="text-xs text-gray-500">+{dayEntries.length - 3} more</div>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
      </div>

      {/* Weekly Insights & Tips */}
      <div className="bg-white rounded-lg p-4 border border-pink-100">
        <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
          <Target className="w-4 h-4 mr-2 text-pink-600" />
          Weekly Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-2 text-blue-500" />
              <span className="text-gray-600">Avg hours/day: </span>
              <span className="font-medium ml-1">
                {weekStats.activeDays > 0 ? (weekStats.totalHours / weekStats.activeDays).toFixed(1) : '0'}h
              </span>
            </div>
            {weekStats.totalHours < weekGoal && (
              <div className="flex items-start text-sm">
                <AlertCircle className="w-4 h-4 mr-2 text-amber-500 mt-0.5" />
                <span className="text-amber-700">
                  {(weekGoal - weekStats.totalHours).toFixed(1)}h remaining to reach weekly goal
                </span>
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            <div className="mb-2 font-medium text-gray-800">Quick Tips:</div>
            <ul className="space-y-1 text-xs">
              <li>• Log hours daily for better tracking</li>
              <li>• Review supervision notes weekly</li>
              <li>• Schedule CE credits in advance</li>
              {weekStats.activeDays < 5 && <li>• Consider consistent daily logging</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};