// Appearance preferences types

export type ConfettiStyle = 'colorful' | 'pink';

export interface AppearancePreferences {
  confetti: {
    style: ConfettiStyle;
  };
  // Future: theme, animations, fonts, etc.
}

export const defaultAppearancePreferences: AppearancePreferences = {
  confetti: {
    style: 'colorful'
  }
};

// Confetti color schemes
export const confettiColorSchemes = {
  colorful: {
    name: 'Colorful',
    description: 'Rainbow colors for celebrations',
    colors: ['#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16', '#F97316'] as string[]
  },
  pink: {
    name: 'Pink Theme',
    description: 'Classic pink theme colors',
    colors: ['#EC4899', '#BE185D', '#F472B6', '#F9A8D4', '#FDF2F8'] as string[]
  }
} as const;

