import { useState } from 'react';
import { Save, X, Video, Volume2 } from 'lucide-react';

interface SupervisionHourFormProps {
  onSave: (hours: number, hasVideo: boolean, hasAudio: boolean, notes?: string) => void;
  onCancel: () => void;
}

export const SupervisionHourForm = ({ onSave, onCancel }: SupervisionHourFormProps) => {
  const [hours, setHours] = useState('');
  const [reviewedSession, setReviewedSession] = useState(false);
  const [reviewType, setReviewType] = useState<'video' | 'audio' | ''>('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hours || parseFloat(hours) <= 0) {
      alert('Please enter valid hours');
      return;
    }

    if (parseFloat(hours) > 8) {
      if (!confirm('You entered more than 8 hours of supervision in one session. Is this correct?')) {
        return;
      }
    }

    const hasVideo = reviewType === 'video';
    const hasAudio = reviewType === 'audio';
    
    onSave(parseFloat(hours), hasVideo, hasAudio, notes || undefined);
    
    // Reset form
    setHours('');
    setReviewedSession(false);
    setReviewType('');
    setNotes('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-4">
      <h4 className="font-medium text-emerald-800">Add Supervision Hours</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="hours" className="block text-sm font-medium text-emerald-700 mb-1">
            Hours*
          </label>
          <input
            type="number"
            id="hours"
            min="0.5"
            max="24"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full px-3 py-2 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="e.g., 1.0"
            required
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={reviewedSession}
            onChange={(e) => {
              setReviewedSession(e.target.checked);
              if (!e.target.checked) {
                setReviewType('');
              }
            }}
            className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-sm font-medium text-emerald-700">Reviewed a session?</span>
        </label>
        
        {reviewedSession && (
          <div className="ml-6 space-y-2">
            <p className="text-sm font-medium text-emerald-700">Review Type</p>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="reviewType"
                  value="video"
                  checked={reviewType === 'video'}
                  onChange={(e) => setReviewType(e.target.value as 'video')}
                  className="border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                />
                <Video className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-emerald-700">Video review</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="reviewType"
                  value="audio"
                  checked={reviewType === 'audio'}
                  onChange={(e) => setReviewType(e.target.value as 'audio')}
                  className="border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                />
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-emerald-700">Audio review</span>
              </label>
            </div>
            <p className="text-xs text-emerald-600">
              This session will count toward your 25-hour video/audio review requirement.
            </p>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-emerald-700 mb-1">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="Additional notes about this supervision session..."
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </form>
  );
};