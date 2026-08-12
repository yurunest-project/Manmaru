import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  if (onClick) {
    return (
      <div
        className={`card ${className}`}
        onClick={onClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onClick();
        }}
        role="button"
        tabIndex={0}
      >
        {children}
      </div>
    );
  }
  return <div className={`card ${className}`}>{children}</div>;
}

export function Empty({
  icon,
  title,
  message,
}: {
  icon: string;
  title: string;
  message: string;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <h2>{title}</h2>
      <p className="muted">{message}</p>
    </div>
  );
}

export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <div
        className="sheet"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-label={title}
      >
        <div className="sheet-handle" />
        <div className="topbar">
          <button type="button" onClick={onClose} className="muted">
            閉じる
          </button>
          <strong>{title}</strong>
          <span style={{ width: 48 }} />
        </div>
        {children}
      </div>
    </div>
  );
}
