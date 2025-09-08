import { EntriesData } from '@/lib/types';
import { formatDateKey, isToday, isSameDay } from '@/lib/utils/dateUtils';
import { Clock, TrendingUp, Target, AlertCircle } from 'lucide-react';

interface WeekCalendarProps {
  selectedDate: Date;
  entries: EntriesData;
  onDateSelect: (date: Date) => void;
}

export const WeekCalendar = ({ selectedDate, entries, onDateSelect }: WeekCalendarProps) => {
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
        const totalHours = dayEntries.reduce((sum, e) => sum + e.hours, 0);
        const isSelected = isSameDay(date, selectedDate);
        const isCurrentDay = isToday(date);

        return (
          <div
            key={dateKey}
            className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
              isSelected ? 'bg-pink-50 border-pink-300 shadow-md' : 'border-pink-100'
            } ${isCurrentDay ? 'ring-2 ring-pink-400' : ''}`}
            onClick={() => onDateSelect(date)}
          >
            <div className={`font-medium ${isCurrentDay ? 'text-pink-600' : 'text-gray-700'}`}>
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className={`text-lg ${isCurrentDay ? 'text-pink-600' : 'text-gray-900'}`}>
              {date.getDate()}
            </div>
            {totalHours > 0 && (
              <div className="text-sm text-pink-600 mt-1 font-medium">
                {totalHours}h
              </div>
            )}
            <div className="mt-2 space-y-1">
              {dayEntries.slice(0, 3).map((entry, idx) => (
                <div
                  key={idx}
                  className={`text-xs px-2 py-1 rounded ${
                    entry.type === 'session' ? 'bg-pink-100 text-pink-700' :
                    entry.type === 'supervision' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {entry.type} - {entry.hours}h
                </div>
              ))}
              {dayEntries.length > 3 && (
                <div className="text-xs text-gray-500">+{dayEntries.length - 3} more</div>
              )}
            </div>
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