import { useEffect, useRef } from "react";

function isMacPlatform(): boolean {
  return /Mac|iPhone|iPod|iPad/i.test(navigator.platform);
}

function hasShortcutModifier(event: KeyboardEvent): boolean {
  return isMacPlatform() ? event.metaKey : event.ctrlKey;
}

export interface KeyboardShortcutCallbacks {
  onPalette?: () => void;
  onImprove?: () => void;
  onGrammar?: () => void;
  onSummarize?: () => void;
  onExpand?: () => void;
  onRewrite?: () => void;
  onTheme?: () => void;
  onSnapshot?: () => void;
  onClose?: () => void;
  onShortcuts?: () => void;
}

export function useKeyboardShortcuts(callbacks: KeyboardShortcutCallbacks) {
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const c = callbacksRef.current;

      if (hasShortcutModifier(event)) {
        switch (event.key.toLowerCase()) {
          case "k":
            event.preventDefault();
            c.onPalette?.();
            break;
          case "i":
            event.preventDefault();
            c.onImprove?.();
            break;
          case "g":
            event.preventDefault();
            c.onGrammar?.();
            break;
          case "j":
            event.preventDefault();
            c.onSummarize?.();
            break;
          case "e":
            event.preventDefault();
            c.onExpand?.();
            break;
          case "r":
            event.preventDefault();
            c.onRewrite?.();
            break;
          case "d":
            event.preventDefault();
            c.onTheme?.();
            break;
          case "s":
            event.preventDefault();
            c.onSnapshot?.();
            break;
        }
        return;
      }

      if (event.key === "Escape") {
        c.onClose?.();
        return;
      }

      if (event.key === "?" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        c.onShortcuts?.();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
