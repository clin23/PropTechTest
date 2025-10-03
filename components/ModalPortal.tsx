"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalPortalProps {
  children: ReactNode;
}

export default function ModalPortal({ children }: ModalPortalProps) {
  const [container, setContainer] = useState<Element | null>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      setContainer(document.body);
    }
  }, []);

  if (!container) {
    return null;
  }

  return createPortal(children, container);
}
