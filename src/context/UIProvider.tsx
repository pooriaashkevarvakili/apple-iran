import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from 'react';

const UI_KEY = 'translation-manager:ui';

interface UIState {
  activePublicLang: string | null;
  setActivePublicLang: (code: string) => void;
}

const UIContext = createContext<UIState | null>(null);

function readStoredLang(): string | null {
  try {
    const raw = localStorage.getItem(UI_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { activePublicLang?: unknown };
    return typeof parsed.activePublicLang === 'string' ? parsed.activePublicLang : null;
  } catch {
    return null;
  }
}

export function UIProvider({ children }: PropsWithChildren) {
  const [activePublicLang, setActivePublicLangState] = useState<string | null>(readStoredLang);

  const setActivePublicLang = useCallback((code: string) => {
    setActivePublicLangState(code);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(UI_KEY, JSON.stringify({ activePublicLang }));
    } catch {
    }
  }, [activePublicLang]);

  const value = useMemo<UIState>(
    () => ({ activePublicLang, setActivePublicLang }),
    [activePublicLang, setActivePublicLang]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIState {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside <UIProvider>');
  return ctx;
}