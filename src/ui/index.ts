// src/ui/index.ts
// Single import point for the Brainfuel design system.
// Usage: import { colors, Sticker, Button, ... } from '../ui';

export * from './theme';
export { default as Sticker } from './components/Sticker';
export { default as Button } from './components/Button';
export { default as Chip } from './components/Chip';
export { default as Toggle } from './components/Toggle';
export { default as Bubble } from './components/Bubble';
export { default as Mascot } from './components/Mascot';
export type { Expr } from './components/Mascot';
export { default as Confetti } from './components/Confetti';
export { default as AppIcon } from './components/AppIcon';
export { default as TopBar } from './components/TopBar';
export { default as TabBar } from './components/TabBar';
export type { TabId } from './components/TabBar';
