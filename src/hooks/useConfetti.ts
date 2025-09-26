import { useCallback } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  drift?: number;
  ticks?: number;
  colors?: string[];
  shapes?: ('square' | 'circle')[];
  scalar?: number;
}

export const useConfetti = () => {
  const triggerSuccess = useCallback((options: ConfettiOptions = {}) => {
    const defaults = {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'],
      ...options
    };

    confetti(defaults);
  }, []);

  const triggerCelebration = useCallback(() => {
    // Multiple bursts for a more celebratory effect similar to Canvas
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
      colors: ['#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16']
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Since particles fall down, start a bit higher and to the left and right
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  }, []);

  const triggerHourSubmission = useCallback(() => {
    // Canvas-style success animation with vibrant colorful theme
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#EC4899']
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    // Fire multiple bursts with different spreads and speeds
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    
    fire(0.2, {
      spread: 60,
    });
    
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, []);

  return {
    triggerSuccess,
    triggerCelebration,
    triggerHourSubmission
  };
};