'use client';

import { useState } from 'react';
import { Sparkles, Palette, Eye } from 'lucide-react';
import { useAppearancePreferences } from '@/contexts/AppearanceContext';
import { confettiColorSchemes, ConfettiStyle } from '@/lib/types/appearance';
import { useConfetti } from '@/hooks/useConfetti';

export function AppearanceSettings() {
  const { preferences, updatePreferences, loading } = useAppearancePreferences();
  const { triggerHourSubmission } = useConfetti();
  const [previewingConfetti, setPreviewingConfetti] = useState<ConfettiStyle | null>(null);

  const handleConfettiStyleChange = async (style: ConfettiStyle) => {
    try {
      await updatePreferences({
        confetti: { style }
      });
    } catch (error) {
      console.error('Failed to update confetti style:', error);
    }
  };

  const previewConfetti = () => {
    if (previewingConfetti) return;

    setPreviewingConfetti(preferences.confetti.style);
    triggerHourSubmission();

    setTimeout(() => setPreviewingConfetti(null), 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Appearance Settings</h2>
        <p className="text-sm text-gray-600 mt-1">
          Customize the visual experience of your MFT tracker
        </p>
      </div>

      {/* Confetti Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Celebration Confetti</h3>
            <p className="text-sm text-gray-600">Choose your confetti style for hour submissions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(confettiColorSchemes).map(([key, scheme]) => {
            const isSelected = preferences.confetti.style === key;
            const style = key as ConfettiStyle;

            return (
              <div
                key={key}
                className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-pink-300'
                }`}
                onClick={() => void handleConfettiStyleChange(style)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={isSelected}
                    onChange={() => void handleConfettiStyleChange(style)}
                    className="mt-1 text-pink-600 focus:ring-pink-500"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{scheme.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{scheme.description}</p>

                    {/* Color Preview */}
                    <div className="flex gap-1 mb-3">
                      {scheme.colors.slice(0, 8).map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                      {scheme.colors.length > 8 && (
                        <div className="w-4 h-4 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center">
                          <span className="text-xs text-gray-500">+</span>
                        </div>
                      )}
                    </div>

                    {/* Preview Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        previewConfetti();
                      }}
                      disabled={!!previewingConfetti}
                      className={`inline-flex items-center gap-2 px-3 py-1 text-sm rounded-md transition-colors ${
                        previewingConfetti
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      {previewingConfetti ? 'Previewing...' : 'Preview'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Future Settings Placeholder */}
      <div className="border-t pt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Palette className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">More Customization</h3>
            <p className="text-sm text-gray-600">Additional appearance options coming soon</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Themes', description: 'Light, dark, and auto modes', icon: '🌓' },
            { name: 'Colors', description: 'Custom accent colors', icon: '🎨' },
            { name: 'Fonts', description: 'Typography preferences', icon: '📝' }
          ].map((feature) => (
            <div
              key={feature.name}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="text-2xl mb-2">{feature.icon}</div>
              <h4 className="font-medium text-gray-700 mb-1">{feature.name}</h4>
              <p className="text-sm text-gray-500">{feature.description}</p>
              <div className="mt-3">
                <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                  Coming Soon
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}