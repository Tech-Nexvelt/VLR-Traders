"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { WebsiteSettings } from "@/lib/website-settings-store";

interface WebsiteSettingsContextValue {
  settings: WebsiteSettings | null;
  loading: boolean;
  refetchSettings: () => Promise<void>;
}

const WebsiteSettingsContext = createContext<WebsiteSettingsContextValue>({
  settings: null,
  loading: true,
  refetchSettings: async () => {},
});

export function WebsiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/website");
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Failed to fetch website settings", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetchSettings();
  }, [refetchSettings]);

  return (
    <WebsiteSettingsContext.Provider value={{ settings, loading, refetchSettings }}>
      {children}
    </WebsiteSettingsContext.Provider>
  );
}

export function useWebsiteSettings() {
  return useContext(WebsiteSettingsContext);
}
