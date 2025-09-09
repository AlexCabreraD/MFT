import { EntriesData, HourEntry } from '@/lib/types';

interface RecentActivityProps {
  entries: EntriesData;
}

interface ActivityEntry extends HourEntry {
  date: string;
}

export const RecentActivity = ({ entries }: RecentActivityProps) => {
  const getEntryColor = (type: string) => {
    switch (type) {
      case 'session':
        return 'bg-pink-400';
      case 'supervision':
        return 'bg-purple-400';
      case 'ce':
        return 'bg-blue-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getSessionDisplayLabel = (type: string, subtype: string) => {
    if (type !== 'session') return `${type} - ${subtype}`;
    
    // Psychotherapy sessions
    const psychotherapyTypes = ['individual', 'family', 'couple'];
    if (psychotherapyTypes.includes(subtype)) {
      const subtypeLabels = {
        individual: 'Individual',
        family: 'Family', 
        couple: 'Couple/Marriage'
      };
      return `psychotherapy - ${subtypeLabels[subtype as keyof typeof subtypeLabels]}`;
    }
    
    // Other session types remain as "session - {type}"
    return `session - ${subtype}`;
  };

  const recentEntries: ActivityEntry[] = Object.entries(entries)
    .flatMap(([date, dayEntries]) => 
      dayEntries.map(entry => ({ ...entry, date }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="font-medium text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {recentEntries.map((entry, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${getEntryColor(entry.type)}`} />
              <div>
                <div className="font-medium text-gray-900 capitalize">
                  {getSessionDisplayLabel(entry.type, entry.subtype)}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(entry.date).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">{entry.hours}h</div>
            </div>
          </div>
        ))}
        {recentEntries.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
};