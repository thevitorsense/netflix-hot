import React from 'react';
import { ManufLixLogo } from './ManufLixLogo';

interface HeaderProps {
  onSubscribeClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSubscribeClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <ManufLixLogo className="h-8 md:h-10" />
        
        <button 
          onClick={onSubscribeClick}
          className="bg-manuflix-red text-white px-4 py-2 rounded font-bold text-sm hover:bg-opacity-80 transition-colors"
        >
          Assinar
        </button>
      </div>
    </header>
  );
};
