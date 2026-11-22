import { Maximize2, Minus, X } from 'lucide-react';
import type { CSSProperties, ReactNode, PointerEvent } from 'react';

interface WindowFrameProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  style: CSSProperties;
  maximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onHeaderPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
}

export function WindowFrame({
  title, icon, children, style, maximized, onClose, onMinimize,
  onMaximize, onFocus, onHeaderPointerDown,
}: WindowFrameProps) {
  return (
    <section
      className={`app-window${maximized ? ' is-maximized' : ''}`}
      style={style}
      onPointerDown={onFocus}
      aria-label={`${title} window`}
    >
      <header className="window-titlebar" onPointerDown={onHeaderPointerDown}>
        <div className="window-title">
          <span className="window-title-icon">{icon}</span>
          <span>{title}</span>
        </div>
        <div className="window-controls" onPointerDown={(event) => event.stopPropagation()}>
          <button className="window-control" onClick={onMinimize} aria-label="Minimize window"><Minus size={14} /></button>
          <button className="window-control" onClick={onMaximize} aria-label="Maximize window"><Maximize2 size={12} /></button>
          <button className="window-control close" onClick={onClose} aria-label="Close window"><X size={14} /></button>
        </div>
      </header>
      <div className="window-content">{children}</div>
    </section>
  );
}
