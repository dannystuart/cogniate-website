"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import FormModal from "../../components/FormModal";
import { loadHubSpotScript } from "../../components/HubSpotForm";
import { FORMS, isFormId } from "./registry";
import type { FormId } from "./types";

interface FormModalContextValue {
  active: FormId | null;
  open: (id: FormId) => void;
  close: () => void;
}

const FormModalContext = createContext<FormModalContextValue | null>(null);

export function useFormModal() {
  const ctx = useContext(FormModalContext);
  if (!ctx) {
    throw new Error("useFormModal must be used within FormModalProvider");
  }
  return ctx;
}

export default function FormModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [active, setActive] = useState<FormId | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const internalHashChange = useRef(false);

  const open = useCallback((id: FormId) => {
    if (typeof document !== "undefined") {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
    }
    setActive(id);
    if (typeof window !== "undefined" && window.location.hash !== `#${id}`) {
      internalHashChange.current = true;
      history.pushState(null, "", `#${id}`);
    }
  }, []);

  const close = useCallback(() => {
    setActive(null);
    if (typeof window !== "undefined" && window.location.hash) {
      internalHashChange.current = true;
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
    const restore = restoreFocusRef.current;
    restoreFocusRef.current = null;
    if (restore && typeof restore.focus === "function") {
      requestAnimationFrame(() => restore.focus());
    }
  }, []);

  // Pre-load the HubSpot embed script after the page is idle so the first
  // modal open is near-instant instead of waiting on a cold script fetch.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const idle =
      (window as Window & {
        requestIdleCallback?: (
          cb: () => void,
          options?: { timeout: number }
        ) => number;
      }).requestIdleCallback ??
      ((cb: () => void) => window.setTimeout(cb, 1500));
    const handle = idle(
      () => {
        loadHubSpotScript().catch(() => {});
      },
      { timeout: 4000 }
    );
    return () => {
      const cancel =
        (window as Window & {
          cancelIdleCallback?: (handle: number) => void;
        }).cancelIdleCallback ?? window.clearTimeout;
      cancel(handle as number);
    };
  }, []);

  // Sync URL hash → modal state (for deep links and back-button).
  useEffect(() => {
    const syncFromHash = () => {
      if (internalHashChange.current) {
        internalHashChange.current = false;
        return;
      }
      const raw = window.location.hash.replace(/^#/, "");
      if (isFormId(raw)) {
        setActive(raw);
      } else {
        setActive(null);
      }
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  // ESC to close.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, close]);

  // Scroll lock while open.
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);

  const value = useMemo<FormModalContextValue>(
    () => ({ active, open, close }),
    [active, open, close]
  );

  return (
    <FormModalContext.Provider value={value}>
      {children}
      <FormModal
        config={active ? FORMS[active] : null}
        formId={active}
        onClose={close}
      />
    </FormModalContext.Provider>
  );
}
