import { useState, useEffect } from 'react';

declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      isMaximized: () => Promise<boolean>;
      onMaximizedChanged: (cb: (maximized: boolean) => void) => void;
    };
  }
}

const isElectron = () => !!window.electronAPI;

export default function TrafficLights() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    window.electronAPI?.isMaximized().then(setIsMaximized);
    window.electronAPI?.onMaximizedChanged(setIsMaximized);
  }, []);

  if (!isElectron()) return null;

  const buttons = [
    {
      id: 'close',
      color: '#FF5F57',
      icon: (
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1 1L7 7M7 1L1 7" stroke="#4A0002" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
      onClick: () => window.electronAPI?.close(),
    },
    {
      id: 'minimize',
      color: '#FEBC2E',
      icon: (
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1 4H7" stroke="#995700" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
      onClick: () => window.electronAPI?.minimize(),
    },
    {
      id: 'maximize',
      color: '#28C840',
      icon: isMaximized ? (
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M2.5 1H6C6.55 1 7 1.45 7 2V5.5" stroke="#006500" strokeWidth="1.1" strokeLinecap="round" />
          <path d="M5.5 7H2C1.45 7 1 6.55 1 6V2.5" stroke="#006500" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1 3L1 1H3M5 1H7V3M7 5V7H5M3 7H1V5" stroke="#006500" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      onClick: () => window.electronAPI?.maximize(),
    },
  ];

  return (
    <div className="flex items-center gap-2 pl-4 py-2 select-none">
      {buttons.map((btn) => (
        <button
          key={btn.id}
          onClick={(e) => {
            e.stopPropagation();
            btn.onClick();
          }}
          onMouseEnter={() => setHovered(btn.id)}
          onMouseLeave={() => setHovered(null)}
          className="w-3 h-3 rounded-full flex items-center justify-center transition-all duration-150"
          style={{
            backgroundColor: btn.color,
            WebkitAppRegion: 'no-drag',
          } as React.CSSProperties}
        >
          {hovered === btn.id && btn.icon}
        </button>
      ))}
    </div>
  );
}
