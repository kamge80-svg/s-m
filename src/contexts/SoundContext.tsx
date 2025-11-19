import { createContext, useContext, useState, useEffect } from 'react';

interface SoundContextType {
  isSoundEnabled: boolean;
  enableSound: () => void;
  toggleSound: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Détecter la première interaction utilisateur
    const handleInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        setIsSoundEnabled(true);
        console.log('User interacted - sound enabled globally');
      }
    };

    // Écouter tous les types d'interactions
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [hasInteracted]);

  const enableSound = () => {
    setIsSoundEnabled(true);
    setHasInteracted(true);
  };

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
  };

  return (
    <SoundContext.Provider value={{ isSoundEnabled, enableSound, toggleSound }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}
