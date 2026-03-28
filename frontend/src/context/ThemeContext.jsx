import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('attendify_theme');
      if (savedTheme) return savedTheme;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('attendify_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // ⚡ ULTRA-SMOOTH OVERLAY REVEAL
    const reveal = document.createElement('div');
    reveal.className = `fixed inset-0 z-[9999] pointer-events-none theme-reveal-ring ${newTheme === 'dark' ? 'bg-[#020617]' : 'bg-slate-100'}`;
    document.body.appendChild(reveal);

    setTimeout(() => {
      setTheme(newTheme);
      setTimeout(() => {
        reveal.remove();
      }, 800);
    }, 50);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
