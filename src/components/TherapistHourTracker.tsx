'use client';

import { useState } from 'react';
import { Flower2 } from 'lucide-react';
import { ViewType, CalendarViewType } from '@/lib/types';
import { useSupabaseHourTracker } from '@/lib/hooks/useSupabaseHourTracker';
import { Header } from './layout/Header';
import { QuickStats } from './layout/QuickStats';
import { Footer } from './layout/Footer';
import { CalendarHeader } from './calendar/CalendarHeader';
import { MonthCalendar } from './calendar/MonthCalendar';
import { WeekCalendar } from './calendar/WeekCalendar';
import { DayDetails } from './calendar/DayDetails';
import { AnalyticsView } from './analytics/AnalyticsView';
import { SupervisionView } from './supervision/SupervisionView';
import { RequirementsView } from './requirements/RequirementsView';

export const TherapistHourTracker = () => {
  const [view, setView] = useState<ViewType>('calendar');
  const [calendarView, setCalendarView] = useState<CalendarViewType>('month');
  
  const {
    entries,
    outOfOfficeData,
    selectedDate,
    setSelectedDate,
    editingDate,
    setEditingDate,
    formData,
    setFormData,
    saveEntry,
    editEntry,
    deleteEntry,
    setOutOfOffice,
    removeOutOfOffice,
    isOutOfOffice,
    getOutOfOfficeEntry,
    hasHoursLogged,
    progress,
    supervisionData,
    addSupervisionHours,
    deleteSupervisionSession,
    trainingStartDate,
    updateTrainingStartDate
  } = useSupabaseHourTracker();

  const handleTodayClick = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Decorative Elements */}
      <div className="fixed top-4 right-4 text-pink-300 opacity-20">
        <Flower2 className="w-16 h-16" />
      </div>
      <div className="fixed bottom-4 left-4 text-pink-300 opacity-20">
        <Flower2 className="w-12 h-12" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Header view={view} onViewChange={setView} />

        {view === 'calendar' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-pink-100 overflow-hidden">
                <CalendarHeader
                  selectedDate={selectedDate}
                  calendarView={calendarView}
                  onDateChange={setSelectedDate}
                  onViewChange={setCalendarView}
                  onTodayClick={handleTodayClick}
                />

                {/* Calendar Grid */}
                <div className="p-4">
                  {calendarView === 'month' ? (
                    <MonthCalendar
                      selectedDate={selectedDate}
                      entries={entries}
                      outOfOfficeData={outOfOfficeData}
                      onDateSelect={setSelectedDate}
                    />
                  ) : (
                    <WeekCalendar
                      selectedDate={selectedDate}
                      entries={entries}
                      onDateSelect={setSelectedDate}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Day Details */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-pink-100 p-4">
                <DayDetails
                  selectedDate={selectedDate}
                  entries={entries}
                  editingDate={editingDate}
                  formData={formData}
                  onEditingDateChange={setEditingDate}
                  onFormDataChange={setFormData}
                  onSaveEntry={saveEntry}
                  onEditEntry={editEntry}
                  onDeleteEntry={deleteEntry}
                  onSetOutOfOffice={setOutOfOffice}
                  onRemoveOutOfOffice={removeOutOfOffice}
                  isOutOfOffice={isOutOfOffice}
                  getOutOfOfficeEntry={getOutOfOfficeEntry}
                  hasHoursLogged={hasHoursLogged}
                />
              </div>
            </div>
          </div>
        ) : view === 'supervision' ? (
          <SupervisionView 
            supervisionData={supervisionData}
            progress={progress}
            onAddSupervisionHours={addSupervisionHours}
            onDeleteSupervisionSession={deleteSupervisionSession}
          />
        ) : view === 'requirements' ? (
          <RequirementsView 
            progress={progress} 
            trainingStartDate={trainingStartDate}
            onUpdateTrainingStartDate={updateTrainingStartDate}
          />
        ) : (
          <AnalyticsView entries={entries} progress={progress} />
        )}

        <QuickStats progress={progress} />
        <Footer />
      </div>
    </div>
  );
};