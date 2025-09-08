import { X, Edit2 } from 'lucide-react';
import { HourEntry } from '@/lib/types';
import { ceCategoryOptions } from '@/lib/constants/formOptions';

interface EntryCardProps {
  entry: HourEntry;
  onDelete: () => void;
  onEdit: () => void;
}

export const EntryCard = ({ entry, onDelete, onEdit }: EntryCardProps) => {
  const getEntryColor = (type: string, ceCategory?: string) => {
    if (type === 'ce' && ceCategory) {
      const categoryOption = ceCategoryOptions.find(opt => opt.value === ceCategory);
      if (categoryOption) {
        switch (categoryOption.color) {
          case 'green': return 'bg-green-400';
          case 'orange': return 'bg-orange-400';
          case 'indigo': return 'bg-indigo-400';
          case 'blue': return 'bg-blue-400';
          default: return 'bg-blue-400';
        }
      }
    }
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

  const getCECategoryLabel = (ceCategory?: string) => {
    if (!ceCategory) return '';
    const categoryOption = ceCategoryOptions.find(opt => opt.value === ceCategory);
    return categoryOption ? categoryOption.label : ceCategory;
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-3 h-3 rounded-full ${getEntryColor(entry.type, entry.ceCategory)}`} />
            <span className="font-medium text-gray-900 capitalize">
              {entry.type === 'ce' ? 
                `Continuing Education${entry.ceCategory ? ` - ${getCECategoryLabel(entry.ceCategory)}` : ''}` :
                `${entry.type} - ${entry.subtype}`
              }
            </span>
            <span className="text-pink-600 font-medium">{entry.hours}h</span>
          </div>
          {entry.type === 'ce' && entry.deliveryFormat && (
            <div className="text-xs text-gray-600 mt-1">
              Delivery: {entry.deliveryFormat === 'in-person' ? 'In-Person' : 'Online'}
            </div>
          )}
          {(entry.reviewedAudio || entry.reviewedVideo) && (
            <div className="text-xs text-gray-600 mt-1">
              {entry.reviewedAudio && 'Audio Reviewed'} 
              {entry.reviewedAudio && entry.reviewedVideo && ' • '}
              {entry.reviewedVideo && 'Video Reviewed'}
            </div>
          )}
          {entry.notes && (
            <div className="text-sm text-gray-600 mt-1">{entry.notes}</div>
          )}
        </div>
        <div className="flex gap-1 ml-2">
          <button
            onClick={onEdit}
            className="text-blue-400 hover:text-blue-600"
            title="Edit entry"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-400 hover:text-red-600"
            title="Delete entry"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};