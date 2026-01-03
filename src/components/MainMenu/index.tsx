import React from 'react';
import './index.scss';

export type GameMode = 'slate' | 'status' | 'conversation' | 'library' | 'menu';

interface MainMenuProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ currentMode, onModeChange }) => {
  const modes: { id: GameMode; label: string; icon: string }[] = [
    { id: 'slate', label: "Alchemist's Slate", icon: '\u{1F9EA}' },
    { id: 'status', label: 'Status', icon: '\u{1F4CA}' },
    { id: 'conversation', label: 'Conversation', icon: '\u{1F4AC}' },
    { id: 'library', label: 'Library', icon: '\u{1F4DA}' },
    { id: 'menu', label: 'Menu', icon: '\u{2699}\u{FE0F}' },
  ];

  return (
    <div className="main-menu">
      <div className="main-menu-brand">
        <span className="main-menu-title">IdyllWyld</span>
      </div>
      <nav className="main-menu-nav">
        {modes.map((mode) => (
          <button
            key={mode.id}
            className={`main-menu-button ${currentMode === mode.id ? 'active' : ''}`}
            onClick={() => onModeChange(mode.id)}
          >
            <span className="main-menu-icon">{mode.icon}</span>
            <span className="main-menu-label">{mode.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
