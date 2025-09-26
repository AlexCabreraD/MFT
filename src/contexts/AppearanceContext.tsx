'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { AppearancePreferences, defaultAppearancePreferences, ConfettiStyle } from '@/lib/types/appearance';

interface ClerkMetadata {
  trainingStartDate?: string;
  confettiStyle?: ConfettiStyle;
  [key: string]: unknown;
}

interface AppearanceContextType {
  preferences: AppearancePreferences;
  updatePreferences: (updates: Partial<AppearancePreferences>) => Promise<void>;
  loading: boolean;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

interface AppearanceProviderProps {
  children: ReactNode;
}

export function AppearanceProvider({ children }: AppearanceProviderProps) {
  const { user, isLoaded } = useUser();
  const [preferences, setPreferences] = useState<AppearancePreferences>(defaultAppearancePreferences);
  const [loading, setLoading] = useState(true);

  // Load preferences from Clerk user metadata (following trainingStartDate pattern)
  useEffect(() => {
    if (!isLoaded) return;

    if (user) {
      try {
        const clerkMetadata = user.unsafeMetadata as ClerkMetadata;
        setPreferences({
          confetti: {
            style: clerkMetadata?.confettiStyle || defaultAppearancePreferences.confetti.style
          }
        });
      } catch (error) {
        console.error('Failed to load appearance preferences from Clerk:', error);
      }
    }

    setLoading(false);
  }, [user, isLoaded]);

  const updatePreferences = async (updates: Partial<AppearancePreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);

    // Save to Clerk user metadata (following trainingStartDate pattern)
    if (user) {
      try {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            confettiStyle: newPreferences.confetti.style
          }
        });
      } catch (error) {
        console.error('Failed to save appearance preferences to Clerk:', error);
        // Revert local state if save fails
        setPreferences(preferences);
      }
    }
  };

  return (
    <AppearanceContext.Provider value={{ preferences, updatePreferences, loading }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearancePreferences() {
  const context = useContext(AppearanceContext);
  if (context === undefined) {
    throw new Error('useAppearancePreferences must be used within an AppearanceProvider');
  }
  return context;
}