import { useState, useEffect } from 'react';
import { Save, X, Video, Volume2 } from 'lucide-react';
import { FormData } from '@/lib/types';
import { getSubtypeOptions, getSubtypeLabel, ceCategoryOptions, deliveryFormatOptions } from '@/lib/constants/formOptions';

interface HourEntryFormProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const HourEntryForm = ({ 
  formData, 
  onFormDataChange, 
  onSave, 
  onCancel 
}: HourEntryFormProps) => {
  const [reviewedSession, setReviewedSession] = useState(false);
  const [reviewType, setReviewType] = useState<'video' | 'audio' | ''>('');

  // Initialize local state from formData
  useEffect(() => {
    const hasReview = formData.reviewedAudio || formData.reviewedVideo;
    setReviewedSession(hasReview);
    if (formData.reviewedVideo) {
      setReviewType('video');
    } else if (formData.reviewedAudio) {
      setReviewType('audio');
    } else {
      setReviewType('');
    }
  }, [formData.reviewedAudio, formData.reviewedVideo]);

  const updateFormData = (updates: Partial<FormData>) => {
    onFormDataChange({ ...formData, ...updates });
  };

  const handleReviewedSessionChange = (checked: boolean) => {
    setReviewedSession(checked);
    if (!checked) {
      setReviewType('');
      updateFormData({ reviewedAudio: false, reviewedVideo: false });
    }
  };

  const handleReviewTypeChange = (type: 'video' | 'audio') => {
    setReviewType(type);
    updateFormData({
      reviewedVideo: type === 'video',
      reviewedAudio: type === 'audio'
    });
  };

  return (
    <div className="bg-white border border-pink-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Add Hours Entry</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hour Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => {
              const newType = e.target.value as FormData['type'];
              updateFormData({ 
                type: newType, 
                subtype: '' 
              });
            }}
            className="w-full border border-pink-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            <option value="psychotherapy">Psychotherapy</option>
            <option value="session">Session</option>
            <option value="supervision">Supervision</option>
            <option value="ce">Continuing Education</option>
          </select>
        </div>

        {formData.type !== 'ce' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getSubtypeLabel(formData.type)}
            </label>
            <select
              value={formData.subtype}
              onChange={(e) => updateFormData({ subtype: e.target.value })}
              className="w-full border border-pink-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
              required
            >
              <option value="">Select type...</option>
              {getSubtypeOptions(formData.type).map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {formData.type === 'ce' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getSubtypeLabel(formData.type)}
              </label>
              <select
                value={formData.subtype}
                onChange={(e) => updateFormData({ subtype: e.target.value })}
                className="w-full border border-pink-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              >
                <option value="">Select type...</option>
                {getSubtypeOptions(formData.type).map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CE Category
              </label>
              <select
                value={formData.ceCategory || ''}
                onChange={(e) => updateFormData({ ceCategory: e.target.value as FormData['ceCategory'] })}
                className="w-full border border-pink-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              >
                <option value="">Select category...</option>
                {ceCategoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Format
              </label>
              <select
                value={formData.deliveryFormat || ''}
                onChange={(e) => updateFormData({ deliveryFormat: e.target.value as FormData['deliveryFormat'] })}
                className="w-full border border-pink-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              >
                <option value="">Select format...</option>
                {deliveryFormatOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {formData.type === 'supervision' && formData.subtype === 'individual' && (
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={reviewedSession}
                onChange={(e) => handleReviewedSessionChange(e.target.checked)}
                className="rounded border-pink-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm font-medium text-gray-700">Reviewed a session?</span>
            </label>
            
            {reviewedSession && (
              <div className="ml-6 space-y-2">
                <p className="text-sm font-medium text-gray-700">Review Type</p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="reviewType"
                      value="video"
                      checked={reviewType === 'video'}
                      onChange={(e) => handleReviewTypeChange(e.target.value as 'video')}
                      className="border-pink-300 text-pink-600 focus:ring-pink-500"
                    />
                    <Video className="w-4 h-4 text-pink-600" />
                    <span className="text-sm text-gray-700">Video review</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="reviewType"
                      value="audio"
                      checked={reviewType === 'audio'}
                      onChange={(e) => handleReviewTypeChange(e.target.value as 'audio')}
                      className="border-pink-300 text-pink-600 focus:ring-pink-500"
                    />
                    <Volume2 className="w-4 h-4 text-pink-600" />
                    <span className="text-sm text-gray-700">Audio review</span>
                  </label>
                </div>
                <p className="text-xs text-pink-600">
                  This session will count toward your 25-hour video/audio review requirement.
                </p>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hours
          </label>
          <input
            type="number"
            step="0.25"
            min="0"
            max="16"
            value={formData.hours}
            onChange={(e) => updateFormData({ hours: e.target.value })}
            onWheel={(e) => e.currentTarget.blur()}
            className="w-full border border-pink-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => updateFormData({ notes: e.target.value })}
            className="w-full border border-pink-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
            rows={2}
            placeholder="Add any notes..."
          />
        </div>

        <button
          onClick={onSave}
          className="w-full bg-pink-500 text-white py-2 px-4 rounded-md hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Entry
        </button>
      </div>
    </div>
  );
};