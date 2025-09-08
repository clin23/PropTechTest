'use client';
import { useContext } from 'react';
import { ThemeContext } from '../app/providers';
import { Switch } from './ui/switch';

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />;
}
