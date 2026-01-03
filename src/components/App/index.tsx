import React, { useState } from 'react';
import { MainMenu, GameMode } from '../MainMenu';
import { SlateMode } from '../SlateMode';
import './index.scss';

export const App = () => {
  const [currentMode, setCurrentMode] = useState<GameMode>('slate');

  const renderMode = () => {
    switch (currentMode) {
      case 'slate':
        return <SlateMode />;
      case 'status':
        return <div className="mode-placeholder">Status Mode - Coming Soon</div>;
      case 'conversation':
        return <div className="mode-placeholder">Conversation Mode - Coming Soon</div>;
      case 'library':
        return <div className="mode-placeholder">Library Mode - Coming Soon</div>;
      case 'menu':
        return <div className="mode-placeholder">Menu Mode - Coming Soon</div>;
      default:
        return <SlateMode />;
    }
  };

  return (
    <div className="app">
      <MainMenu currentMode={currentMode} onModeChange={setCurrentMode} />
      <div className="app-content">
        {renderMode()}
      </div>
    </div>
  );
};
