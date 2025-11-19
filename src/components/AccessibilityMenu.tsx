import { useState } from 'react';
import { Accessibility, X, Type, ZoomIn, ZoomOut } from 'lucide-react';

export default function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 10, 150);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 10, 80);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    document.documentElement.classList.toggle('high-contrast');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 w-12 h-12 rounded-full gradient-primary shadow-glow flex items-center justify-center z-50"
        aria-label="Open accessibility menu"
      >
        <Accessibility className="w-6 h-6 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 glass-effect rounded-2xl p-4 z-50 w-64 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Accessibility className="w-5 h-5" />
          Accessibility
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-white/20 rounded-lg transition"
          aria-label="Close accessibility menu"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-white/70 text-sm mb-2 block flex items-center gap-2">
            <Type className="w-4 h-4" />
            Font Size: {fontSize}%
          </label>
          <div className="flex gap-2">
            <button
              onClick={decreaseFontSize}
              className="flex-1 py-2 glass-effect rounded-lg hover:bg-white/20 transition flex items-center justify-center gap-1 text-white"
              aria-label="Decrease font size"
            >
              <ZoomOut className="w-4 h-4" />
              <span className="text-sm">Smaller</span>
            </button>
            <button
              onClick={increaseFontSize}
              className="flex-1 py-2 glass-effect rounded-lg hover:bg-white/20 transition flex items-center justify-center gap-1 text-white"
              aria-label="Increase font size"
            >
              <ZoomIn className="w-4 h-4" />
              <span className="text-sm">Larger</span>
            </button>
          </div>
        </div>

        <button
          onClick={toggleHighContrast}
          className={`w-full py-3 rounded-lg transition ${
            highContrast
              ? 'gradient-primary text-white'
              : 'glass-effect text-white hover:bg-white/20'
          }`}
          aria-label="Toggle high contrast mode"
        >
          {highContrast ? 'Disable' : 'Enable'} High Contrast
        </button>
      </div>
    </div>
  );
}
