import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { DEFAULT_SITE_SETTINGS } from "../data/store";
import type { CategoryImageKey, SiteSettings } from "../types";

interface SiteSettingsRow {
  business_name: string;
  tagline: string;
  logo_url: string | null;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string | null;
  store_photo: string | null;
  category_images: Partial<Record<CategoryImageKey, string>>;
  whatsapp_number: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  map_url: string | null;
  order_notify_url: string | null;
  order_notify_secret: string | null;
  updated_at: string;
}

function rowToSettings(row: SiteSettingsRow): SiteSettings {
  return {
    businessName: row.business_name,
    tagline: row.tagline,
    logoUrl: row.logo_url,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    heroImage: row.hero_image ?? DEFAULT_SITE_SETTINGS.heroImage,
    storePhoto: row.store_photo ?? DEFAULT_SITE_SETTINGS.storePhoto,
    categoryImages: { ...DEFAULT_SITE_SETTINGS.categoryImages, ...row.category_images },
    whatsappNumber: row.whatsapp_number,
    phone: row.phone,
    email: row.email,
    address: row.address,
    hours: row.hours,
    instagramUrl: row.instagram_url,
    facebookUrl: row.facebook_url,
    tiktokUrl: row.tiktok_url,
    mapUrl: row.map_url,
    orderNotifyUrl: row.order_notify_url,
    orderNotifySecret: row.order_notify_secret,
    updatedAt: row.updated_at,
  };
}

export type SiteSettingsInput = Omit<SiteSettings, "updatedAt">;

function settingsToRow(settings: SiteSettingsInput): Omit<SiteSettingsRow, "updated_at"> {
  return {
    business_name: settings.businessName,
    tagline: settings.tagline,
    logo_url: settings.logoUrl ?? null,
    hero_title: settings.heroTitle,
    hero_subtitle: settings.heroSubtitle,
    hero_image: settings.heroImage ?? null,
    store_photo: settings.storePhoto ?? null,
    category_images: settings.categoryImages,
    whatsapp_number: settings.whatsappNumber,
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    hours: settings.hours,
    instagram_url: settings.instagramUrl ?? null,
    facebook_url: settings.facebookUrl ?? null,
    tiktok_url: settings.tiktokUrl ?? null,
    map_url: settings.mapUrl ?? null,
    order_notify_url: settings.orderNotifyUrl ?? null,
    order_notify_secret: settings.orderNotifySecret ?? null,
  };
}

interface SiteSettingsContextValue {
  settings: SiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
  updateSettings: (input: SiteSettingsInput) => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", true).maybeSingle();
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    if (data) setSettings(rowToSettings(data as SiteSettingsRow));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    document.title = `${settings.businessName} | ${settings.tagline}`;
  }, [settings.businessName, settings.tagline]);

  const updateSettings = async (input: SiteSettingsInput) => {
    const { error } = await supabase
      .from("site_settings")
      .update({ ...settingsToRow(input), updated_at: new Date().toISOString() })
      .eq("id", true);
    if (error) throw new Error(error.message);
    await refresh();
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refresh, updateSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error("useSiteSettings debe usarse dentro de <SiteSettingsProvider>");
  return ctx;
}
