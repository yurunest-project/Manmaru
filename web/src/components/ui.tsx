import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

let openSheetCount = 0;

function setSheetOpen(open: boolean) {
  openSheetCount = Math.max(0, openSheetCount + (open ? 1 : -1));
  document.body.classList.toggle("sheet-open", openSheetCount > 0);
  document.body.style.overflow = openSheetCount > 0 ? "hidden" : "";
  if (openSheetCount === 0) {
    window.scrollTo(0, 0);
  }
}

/** キーボード分だけ下余白を取る。backdrop 自体は常に inset:0 で位置崩れを防ぐ */
function useKeyboardBottomInset() {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const sync = () => {
      const vv = window.visualViewport;
      if (!vv) {
        setInset(0);
        return;
      }
      const next = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
      setInset(next);
      // iOS でキーボード後にページがずれたままになるのを戻す
      if (next === 0 && (window.scrollY !== 0 || vv.offsetTop !== 0)) {
        window.scrollTo(0, 0);
      }
    };
    sync();
    window.visualViewport?.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);
    return () => {
      window.visualViewport?.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  return inset;
}

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
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const dragYRef = useRef(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const keyboardInset = useKeyboardBottomInset();
  const keyboardOpen = keyboardInset > 72;

  useEffect(() => {
    setSheetOpen(true);
    return () => setSheetOpen(false);
  }, []);

  useEffect(() => {
    const root = bodyRef.current;
    if (!root) return;

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") return;
      window.setTimeout(() => {
        const container = bodyRef.current;
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const delta =
          targetRect.top - containerRect.top - container.clientHeight / 2 + targetRect.height / 2;
        container.scrollTop += delta;
      }, 50);
    };

    root.addEventListener("focusin", onFocusIn);
    return () => root.removeEventListener("focusin", onFocusIn);
  }, []);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    startY.current = event.clientY;
    dragYRef.current = 0;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const next = Math.max(0, event.clientY - startY.current);
    dragYRef.current = next;
    setDragY(next);
  };

  const finishDrag = () => {
    if (!dragging) return;
    const shouldClose = dragYRef.current > 110;
    setDragging(false);
    if (shouldClose) {
      onClose();
      return;
    }
    setDragY(0);
    dragYRef.current = 0;
  };

  const backdropOpacity = Math.max(0.12, 0.45 * (1 - dragY / 320));

  return (
    <div
      className={`sheet-backdrop${keyboardOpen ? " keyboard-open" : ""}`}
      onClick={onClose}
      role="presentation"
      style={{
        background: `rgba(15, 23, 36, ${backdropOpacity})`,
        paddingBottom: keyboardInset,
      }}
    >
      <div
        className={`sheet${dragging ? " dragging" : ""}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-label={title}
        style={{ transform: `translateY(${dragY}px)` }}
      >
        <div
          className="sheet-handle-area"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        >
          <div className="sheet-handle" />
        </div>
        <div className="topbar">
          <button type="button" onClick={onClose} className="sheet-close">
            閉じる
          </button>
          <strong>{title}</strong>
          <span style={{ width: 48 }} />
        </div>
        <div className="sheet-body" ref={bodyRef}>
          {children}
        </div>
      </div>
    </div>
  );
}
