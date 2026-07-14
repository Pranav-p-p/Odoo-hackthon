import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn-icon-circular"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Sun
          className={`absolute h-5 w-5 transition-opacity duration-fast ease-standard ${
            theme === 'light' ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <Moon
          className={`absolute h-5 w-5 transition-opacity duration-fast ease-standard ${
            theme === 'dark' ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
    </button>
  );
}
