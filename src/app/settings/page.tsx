'use client';

import { useState } from 'react';
import { ArrowLeft, User, Calendar, Palette, Settings as SettingsIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PersonalEvents } from '@/components/settings/PersonalEvents';

type SettingsTab = 'personal-events' | 'appearance' | 'preferences' | 'account';

const settingsTabs = [
  {
    id: 'personal-events' as SettingsTab,
    label: 'Personal Events',
    icon: Calendar,
    description: 'Manage birthdays, anniversaries, and special occasions'
  },
  {
    id: 'appearance' as SettingsTab,
    label: 'Appearance',
    icon: Palette,
    description: 'Customize themes, colors, and fonts',
    disabled: true
  },
  {
    id: 'preferences' as SettingsTab,
    label: 'Preferences',
    icon: SettingsIcon,
    description: 'Time formats, notifications, and general settings',
    disabled: true
  },
  {
    id: 'account' as SettingsTab,
    label: 'Account',
    icon: User,
    description: 'Profile, subscription, and data management',
    disabled: true
  }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('personal-events');
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal-events':
        return <PersonalEvents />;
      case 'appearance':
        return (
          <div className="text-center py-12">
            <Palette className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Appearance Settings</h3>
            <p className="text-gray-500">Coming soon! Customize themes, colors, and fonts.</p>
          </div>
        );
      case 'preferences':
        return (
          <div className="text-center py-12">
            <SettingsIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Preferences</h3>
            <p className="text-gray-500">Coming soon! Configure time formats and notifications.</p>
          </div>
        );
      case 'account':
        return (
          <div className="text-center py-12">
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Account Settings</h3>
            <p className="text-gray-500">Coming soon! Manage your profile and subscription.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600">Customize your MFT tracking experience</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => !tab.disabled && setActiveTab(tab.id)}
                    disabled={tab.disabled}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-pink-50 border-pink-200 text-pink-900'
                        : tab.disabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    } ${activeTab === tab.id ? 'border' : 'border border-transparent'}`}
                  >
                    <Icon className={`w-5 h-5 mt-0.5 ${
                      activeTab === tab.id ? 'text-pink-600' : tab.disabled ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <div>
                      <div className={`font-medium ${tab.disabled ? 'text-gray-400' : ''}`}>
                        {tab.label}
                        {tab.disabled && <span className="ml-2 text-xs">(Coming Soon)</span>}
                      </div>
                      <div className={`text-sm mt-1 ${
                        activeTab === tab.id ? 'text-pink-700' : 'text-gray-500'
                      }`}>
                        {tab.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}