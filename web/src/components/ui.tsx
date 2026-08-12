import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

let openSheetCount = 0;
let lockedScrollY = 0;

function setSheetOpen(open: boolean) {
  const wasOpen = openSheetCount > 0;
  openSheetCount = Math.max(0, openSheetCount + (open ? 1 : -1));
  const isOpen = openSheetCount > 0;

  if (!wasOpen && isOpen) {
    lockedScrollY = window.scrollY;
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.classList.add("sheet-open");
  }

  if (wasOpen && !isOpen) {
    document.body.classList.remove("sheet-open");
    document.body.style.top = "";
    window.scrollTo(0, lockedScrollY);
  }
}

type ViewportRect = {
  top: number;
  left: number;
  width: number;
  height: number;
  keyboardOpen: boolean;
};

function readViewport(): ViewportRect {
  const vv = window.visualViewport;
  const height = Math.round(vv?.height ?? window.innerHeight);
  const width = Math.round(vv?.width ?? window.innerWidth);
  const top = Math.round(vv?.offsetTop ?? 0);
  const left = Math.round(vv?.offsetLeft ?? 0);
  const keyboardOpen = height < window.innerHeight - 80;
  return { top, left, width, height, keyboardOpen };
}

function useVisualViewportRect() {
  const [rect, setRect] = useState<ViewportRect>(() =>
    typeof window === "undefined"
      ? { top: 0, left: 0, width: 390, height: 800, keyboardOpen: false }
      : readViewport(),
  );

  useEffect(() => {
    const sync = () => setRect(readViewport());
    sync();
    window.visualViewport?.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    return () => {
      window.visualViewport?.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
    };
  }, []);

  return rect;
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
  header,
  /** 検索など入力中心のシート。キーボード時は画面いっぱいに広げる */
  preferFill = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  header?: ReactNode;
  preferFill?: boolean;
}) {
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const dragYRef = useRef(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const vv = useVisualViewportRect();
  const fill = preferFill || vv.keyboardOpen;

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
        const cRect = container.getBoundingClientRect();
        const tRect = target.getBoundingClientRect();
        if (tRect.bottom > cRect.bottom - 12 || tRect.top < cRect.top + 12) {
          container.scrollTop += tRect.top - cRect.top - 16;
        }
      }, 50);
    };
    root.addEventListener("focusin", onFocusIn);
    return () => root.removeEventListener("focusin", onFocusIn);
  }, []);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (vv.keyboardOpen) return;
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
      className={`sheet-backdrop${fill ? " sheet-fill" : ""}`}
      onClick={onClose}
      role="presentation"
      style={{
        top: vv.top,
        left: vv.left,
        width: vv.width,
        height: vv.height,
        background: `rgba(15, 23, 36, ${backdropOpacity})`,
      }}
    >
      <div
        className={`sheet${dragging ? " dragging" : ""}${fill ? " is-fill" : ""}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-label={title}
        style={{
          transform: fill ? undefined : `translateY(${dragY}px)`,
          maxHeight: fill ? "100%" : Math.min(vv.height * 0.92, vv.height),
          height: fill ? "100%" : undefined,
        }}
      >
        {!vv.keyboardOpen && (
          <div
            className="sheet-handle-area"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
          >
            <div className="sheet-handle" />
          </div>
        )}
        <div className="topbar">
          <button type="button" onClick={onClose} className="sheet-close">
            閉じる
          </button>
          <strong>{title}</strong>
          <span style={{ width: 48 }} />
        </div>
        {header && <div className="sheet-header">{header}</div>}
        <div className="sheet-body" ref={bodyRef}>
          {children}
        </div>
      </div>
    </div>
  );
}
