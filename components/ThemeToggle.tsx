'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem('maintenance-theme');
    const initial = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDark(initial);
    document.documentElement.dataset.theme = initial ? 'dark' : 'light';
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    localStorage.setItem('maintenance-theme', next ? 'dark' : 'light');
  }
  return <button className="iconButton" onClick={toggle} aria-label={dark ? 'Aktifkan tema terang' : 'Aktifkan tema gelap'} title={dark ? 'Tema terang' : 'Tema gelap'}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>;
}
