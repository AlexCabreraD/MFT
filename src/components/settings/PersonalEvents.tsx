'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Calendar, Repeat } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/hooks/useSupabaseClient';
import {
  PersonalEvent,
  PersonalEventInsert,
  PersonalEventUpdate,
  getPersonalEvents,
  createPersonalEvent,
  updatePersonalEvent,
  deletePersonalEvent,
  eventTypes,
  recurrenceTypes,
  eventColors
} from '@/lib/utils/personalEvents';

interface PersonalEventFormData {
  title: string;
  description: string;
  event_date: string;
  event_type: 'birthday' | 'anniversary' | 'appointment' | 'reminder' | 'custom';
  recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrence_interval: number;
  color: string;
}

export function PersonalEvents() {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [events, setEvents] = useState<PersonalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PersonalEvent | null>(null);
  const [formData, setFormData] = useState<PersonalEventFormData>({
    title: '',
    description: '',
    event_date: '',
    event_type: 'birthday',
    recurrence_type: 'yearly',
    recurrence_interval: 1,
    color: eventColors[0].value
  });

  const loadEvents = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    const userEvents = await getPersonalEvents(supabase, user.id);
    setEvents(userEvents);
    setLoading(false);
  }, [user?.id, supabase]);

  useEffect(() => {
    if (user?.id) {
      loadEvents();
    }
  }, [user?.id, loadEvents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (editingEvent) {
      // For updates, don't include user_id since it shouldn't change
      const updateData: PersonalEventUpdate = {
        title: formData.title,
        description: formData.description || null,
        event_date: formData.event_date,
        event_type: formData.event_type,
        recurrence_type: formData.recurrence_type,
        recurrence_interval: formData.recurrence_type !== 'none' && formData.recurrence_type !== 'yearly' ? formData.recurrence_interval : null,
        color: formData.color,
        is_active: true
      };
      const updated = await updatePersonalEvent(supabase, editingEvent.id, updateData);
      if (updated) {
        setEvents(events.map(e => e.id === editingEvent.id ? updated : e));
      }
    } else {
      // For creates, include user_id
      const eventData: PersonalEventInsert = {
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        event_date: formData.event_date,
        event_type: formData.event_type,
        recurrence_type: formData.recurrence_type,
        recurrence_interval: formData.recurrence_type !== 'none' && formData.recurrence_type !== 'yearly' ? formData.recurrence_interval : null,
        color: formData.color,
        is_active: true
      };
      const created = await createPersonalEvent(supabase, eventData);
      if (created) {
        setEvents([...events, created]);
      }
    }

    resetForm();
  };

  const handleEdit = (event: PersonalEvent) => {
    setEditingEvent(event);
    const intervalValue = event.recurrence_interval || 1;
    setFormData({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
      event_type: event.event_type,
      recurrence_type: event.recurrence_type,
      recurrence_interval: intervalValue,
      color: event.color
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    const success = await deletePersonalEvent(supabase, eventId);
    if (success) {
      setEvents(events.filter(e => e.id !== eventId));
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      event_date: '',
      event_type: 'birthday',
      recurrence_type: 'yearly',
      recurrence_interval: 1,
      color: eventColors[0].value
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRecurrenceLabel = (event: PersonalEvent) => {
    if (event.recurrence_type === 'none') return 'One-time';
    const interval = event.recurrence_interval || 1;
    const type = recurrenceTypes.find(t => t.value === event.recurrence_type)?.label || '';
    return interval === 1 ? type : `Every ${interval} ${type.toLowerCase()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Personal Events</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage birthdays, anniversaries, and other special occasions
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingEvent ? 'Edit Event' : 'Add New Event'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value as PersonalEventFormData['event_type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex gap-2">
                  {eventColors.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color.value ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recurrence
                </label>
                <select
                  value={formData.recurrence_type}
                  onChange={(e) => setFormData({ ...formData, recurrence_type: e.target.value as PersonalEventFormData['recurrence_type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {recurrenceTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              {formData.recurrence_type !== 'none' && formData.recurrence_type !== 'yearly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interval
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.recurrence_interval}
                    onChange={(e) => {
                      const numValue = parseInt(e.target.value);
                      setFormData({ ...formData, recurrence_interval: !isNaN(numValue) && numValue > 0 ? numValue : 1 });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No personal events yet. Add your first event to get started!</p>
          </div>
        ) : (
          events.map(event => {
            const eventType = eventTypes.find(t => t.value === event.event_type);
            return (
              <div key={event.id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: event.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <span className="text-sm">{eventType?.icon}</span>
                    {event.recurrence_type !== 'none' && (
                      <Repeat className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(event.event_date)} • {getRecurrenceLabel(event)}
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}