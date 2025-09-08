'use client';

import { Clock, Calendar, BarChart3 } from 'lucide-react';
import { ViewType } from '@/lib/types';
import { UserButton, useUser } from '@clerk/nextjs';

interface HeaderProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Header = ({ view, onViewChange }: HeaderProps) => {
  const { user } = useUser();

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="bg-pink-500 p-3 rounded-lg shadow-lg">
          <Clock className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Therapist Hour Tracker</h1>
          <p className="text-gray-600">Utah Mental Health Professional Licensing</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
        <button
          onClick={() => onViewChange('calendar')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            view === 'calendar' 
              ? 'bg-pink-500 text-white shadow-md' 
              : 'bg-white text-gray-700 border border-pink-200 hover:bg-pink-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Calendar
        </button>
        <button
          onClick={() => onViewChange('analytics')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            view === 'analytics' 
              ? 'bg-pink-500 text-white shadow-md' 
              : 'bg-white text-gray-700 border border-pink-200 hover:bg-pink-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Analytics
        </button>
        </div>

        {/* User Section */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-gray-600">
                {user.emailAddresses[0]?.emailAddress}
              </div>
            </div>
          )}
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};