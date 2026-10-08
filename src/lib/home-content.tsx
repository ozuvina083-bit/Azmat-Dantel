import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DICT, useI18n, type Dict, type Lang } from "@/i18n";
import { supabase } from "@/lib/supabase";

type HomeOverrides = {
  services?: Dict["services"]["items"];
  doctors?: (Dict["doctors"]["items"][number] & { image?: string })[];
  plans?: Dict["pricing"]["plans"];
};
type HomeContentValue = {
  services: Dict["services"]["items"];
  doctors: (Dict["doctors"]["items"][number] & { image?: string })[];
  plans: Dict["pricing"]["plans"];
  refresh: () => Promise<void>;
};
const HomeContentContext = createContext<HomeContentValue | null>(null);

export function HomeContentProvider({ children }: { children: ReactNode }) {
  const { lang } = useI18n();
  const [overrides, setOverrides] = useState<Partial<Record<Lang, HomeOverrides>>>({});

  const refresh = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from("site_content").select("value").eq("id", `homepage_${lang}`).maybeSingle();
    if (error) {
      console.warn("Homepage content could not be loaded", error.message);
      return;
    }
    setOverrides((current) => ({ ...current, [lang]: (data?.value as HomeOverrides | undefined) ?? {} }));
  };

  useEffect(() => {
    void refresh();
    const onUpdate = () => { void refresh(); };
    window.addEventListener("azamat:content-updated", onUpdate);
    return () => window.removeEventListener("azamat:content-updated", onUpdate);
  }, [lang]);

  const value = useMemo(() => {
    const fallback = DICT[lang];
    const current = overrides[lang] ?? {};
    return {
      services: current.services ?? fallback.services.items,
      doctors: current.doctors ?? fallback.doctors.items.map((doctor) => ({ ...doctor, image: undefined })),
      plans: current.plans ?? fallback.pricing.plans,
      refresh,
    };
  }, [lang, overrides]);

  return <HomeContentContext.Provider value={value}>{children}</HomeContentContext.Provider>;
}

export function useHomeContent() {
  const value = useContext(HomeContentContext);
  if (!value) throw new Error("useHomeContent must be used inside HomeContentProvider");
  return value;
}
