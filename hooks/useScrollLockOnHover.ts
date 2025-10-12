import { useCallback, useEffect, useRef } from "react";

let activeLocks = 0;
let previousOverflow: string | null = null;

function lockBodyScroll() {
  if (typeof document === "undefined") return;

  if (activeLocks === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  activeLocks += 1;
}

function unlockBodyScroll() {
  if (typeof document === "undefined") return;
  if (activeLocks === 0) return;

  activeLocks = Math.max(0, activeLocks - 1);

  if (activeLocks === 0 && previousOverflow !== null) {
    document.body.style.overflow = previousOverflow;
    previousOverflow = null;
  }
}

/**
 * Locks the body scroll while the pointer or focus is within the attached element.
 * This keeps the surrounding layout static while scroll gestures are captured by the list.
 */
export function useScrollLockOnHover<T extends HTMLElement>() {
  const nodeRef = useRef<T | null>(null);
  const isLockedRef = useRef(false);

  const handleLock = useCallback(() => {
    if (isLockedRef.current) return;
    lockBodyScroll();
    isLockedRef.current = true;
  }, []);

  const handleUnlock = useCallback(() => {
    if (!isLockedRef.current) return;
    unlockBodyScroll();
    isLockedRef.current = false;
  }, []);

  const handleFocusOut = useCallback((event: FocusEvent) => {
    const current = nodeRef.current;
    if (!current) return;
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && current.contains(nextTarget)) {
      return;
    }
    handleUnlock();
  }, [handleUnlock]);

  const setRef = useCallback(
    (node: T | null) => {
      if (nodeRef.current) {
        const current = nodeRef.current;
        current.removeEventListener("pointerenter", handleLock);
        current.removeEventListener("pointerleave", handleUnlock);
        current.removeEventListener("focusin", handleLock);
        current.removeEventListener("focusout", handleFocusOut);
      }

      if (node) {
        node.addEventListener("pointerenter", handleLock);
        node.addEventListener("pointerleave", handleUnlock);
        node.addEventListener("focusin", handleLock);
        node.addEventListener("focusout", handleFocusOut);
      }

      nodeRef.current = node;
    },
    [handleLock, handleUnlock, handleFocusOut],
  );

  useEffect(() => {
    return () => {
      handleUnlock();
      if (nodeRef.current) {
        const current = nodeRef.current;
        current.removeEventListener("pointerenter", handleLock);
        current.removeEventListener("pointerleave", handleUnlock);
        current.removeEventListener("focusin", handleLock);
        current.removeEventListener("focusout", handleFocusOut);
      }
    };
  }, [handleFocusOut, handleLock, handleUnlock]);

  return setRef;
}

