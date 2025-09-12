import { Trash2, Video, Volume2, Clock } from 'lucide-react';
import { UserAppData } from '@/lib/types';

interface SupervisionCardProps {
  session: NonNullable<UserAppData['supervisionHours']>['sessions'][0];
  onDelete: () => void;
}

export const SupervisionCard = ({ session, onDelete }: SupervisionCardProps) => {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this supervision session?')) {
      onDelete();
    }
  };

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span className="font-medium text-emerald-800">{session.hours} hours</span>
          <span className="text-sm text-emerald-600">
            {new Date(session.date).toLocaleDateString()}
          </span>
        </div>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 transition-colors"
          title="Delete supervision session"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center gap-3 mb-2">
        {session.hasVideo && (
          <div className="flex items-center gap-1 text-teal-600">
            <Video className="w-3 h-3" />
            <span className="text-xs">Video</span>
          </div>
        )}
        {session.hasAudio && (
          <div className="flex items-center gap-1 text-teal-600">
            <Volume2 className="w-3 h-3" />
            <span className="text-xs">Audio</span>
          </div>
        )}
        {(session.hasVideo || session.hasAudio) && (
          <span className="text-xs text-teal-600 font-medium">
            (Counts toward video/audio requirement)
          </span>
        )}
      </div>
      
      {session.notes && (
        <p className="text-sm text-emerald-700 mt-2 italic">{session.notes}</p>
      )}
    </div>
  );
};