import { useState } from 'react';
import { Plus, Users, Target } from 'lucide-react';
import { SupervisionHourForm } from '@/components/forms/SupervisionHourForm';
import { SupervisionCard } from '@/components/ui/SupervisionCard';
import { UserAppData } from '@/lib/utils/clerkData';
import { ProgressStats } from '@/lib/types';

interface SupervisionViewProps {
  supervisionData?: UserAppData['supervisionHours'];
  progress: ProgressStats;
  onAddSupervisionHours: (hours: number, hasVideo: boolean, hasAudio: boolean, notes?: string) => void;
  onDeleteSupervisionSession: (index: number) => void;
}

export const SupervisionView = ({ 
  supervisionData, 
  progress, 
  onAddSupervisionHours, 
  onDeleteSupervisionSession 
}: SupervisionViewProps) => {
  const [showForm, setShowForm] = useState(false);

  const handleSave = (hours: number, hasVideo: boolean, hasAudio: boolean, notes?: string) => {
    onAddSupervisionHours(hours, hasVideo, hasAudio, notes);
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const sessions = supervisionData?.sessions || [];
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-emerald-600" />
        <h2 className="text-xl font-semibold text-gray-900">Supervision Hours</h2>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-800">Total Supervision</h3>
          </div>
          <div className="text-3xl font-bold text-emerald-700 mb-2">
            {progress.totalSupervisionHours.toFixed(1)} / 100
          </div>
          <div className="w-full bg-emerald-200 rounded-full h-3 mb-2">
            <div 
              className="bg-emerald-600 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(100, progress.supervisionProgress)}%` }}
            ></div>
          </div>
          <div className="text-sm text-emerald-600">
            {Math.max(0, 100 - progress.totalSupervisionHours).toFixed(1)} hours remaining
          </div>
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-teal-600" />
            <h3 className="text-lg font-semibold text-teal-800">Video/Audio Review</h3>
          </div>
          <div className="text-3xl font-bold text-teal-700 mb-2">
            {progress.videoAudioSupervisionHours.toFixed(1)} / 25
          </div>
          <div className="w-full bg-teal-200 rounded-full h-3 mb-2">
            <div 
              className="bg-teal-600 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(100, progress.videoAudioSupervisionProgress)}%` }}
            ></div>
          </div>
          <div className="text-sm text-teal-600">
            {Math.max(0, 25 - progress.videoAudioSupervisionHours).toFixed(1)} hours remaining
          </div>
        </div>
      </div>

      {/* Requirements Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Supervision Requirements</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Total of 100 hours of supervision required</li>
          <li>• 25 of those hours must include video or audio review of your therapy sessions</li>
          <li>• Any supervision hour counts toward the 100-hour total</li>
          <li>• Only video/audio review sessions count toward the 25-hour specialized requirement</li>
        </ul>
      </div>

      {/* Add Hours Section */}
      <div className="bg-white rounded-lg shadow-sm border border-emerald-100">
        <div className="p-4 border-b border-emerald-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Log Supervision Hours</h3>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Hours
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          {showForm ? (
            <SupervisionHourForm onSave={handleSave} onCancel={handleCancel} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              Click &quot;Add Hours&quot; to log a new supervision session
            </div>
          )}
        </div>
      </div>

      {/* Sessions History */}
      {sortedSessions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-emerald-100">
          <div className="p-4 border-b border-emerald-100">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Sessions ({sortedSessions.length})
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {sortedSessions.map((session, displayIndex) => {
              const originalIndex = sessions.findIndex(s => s.timestamp === session.timestamp);
              return (
                <SupervisionCard
                  key={displayIndex}
                  session={session}
                  onDelete={() => onDeleteSupervisionSession(originalIndex)}
                />
              );
            })}
          </div>
        </div>
      )}

      {sessions.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No supervision hours logged yet</h3>
          <p className="text-sm">Start tracking your supervision hours by clicking &quot;Add Hours&quot; above.</p>
        </div>
      )}
    </div>
  );
};