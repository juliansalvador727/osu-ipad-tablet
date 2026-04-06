import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { loadSettings, saveSettings as persistSettings } from "../lib/settingsStorage";
import { AppSettings } from "../types/settings";

interface SettingsContextValue {
  settings: AppSettings | null;
  loading: boolean;
  reloadSettings: () => Promise<void>;
  saveSettings: (settings: AppSettings) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const reloadSettings = useCallback(async () => {
    setLoading(true);
    const nextSettings = await loadSettings();
    setSettings(nextSettings);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reloadSettings();
  }, [reloadSettings]);

  const saveSettings = useCallback(async (nextSettings: AppSettings) => {
    await persistSettings(nextSettings);
    setSettings(nextSettings);
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, loading, reloadSettings, saveSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }

  return context;
}
