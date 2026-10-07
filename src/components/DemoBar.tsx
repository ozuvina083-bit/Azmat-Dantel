import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DEMO } from "@/config";
import { useI18n } from "@/i18n";
import { Icon, ease } from "@/components/ui";
import { cn } from "@/utils/cn";

/**
 * Client-facing demo layer: a small badge that opens a sheet explaining
 * what is included, what changes before launch, and the next steps.
 */
export function DemoBar() {
  const { lang } = useI18n();
  const c = DEMO.copy[lang] ?? DEMO.copy.uz;
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!DEMO.enabled ? false : !DEMO.ribbon) return;
    try {
      if (localStorage.getItem("ewd-demo-hidden") === "1" || sessionStorage.getItem("ewd-demo-toast") === "1") return;
      sessionStorage.setItem("ewd-demo-toast", "1");
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => setToast(true), 1600);
    const hide = setTimeout(() => setToast(false), 1600 + DEMO.toastMs);
    return () => {
      clearTimeout(t);
      clearTimeout(hide);
    };
  }, []);

  if (!DEMO.enabled) return null;

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "ESTHETIC WHITE DENTAL — demo", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      {/* toast — one time per session */}
      <AnimatePresence>
        {toast && !hidden && (
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.4, ease }}
            className="fixed inset-x-3 top-[70px] z-[96] mx-auto max-w-md rounded-2xl border border-mint/35 bg-ink/95 p-3.5 backdrop-blur-md md:left-1/2 md:right-auto md:w-[420px] md:-translate-x-1/2"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-mint/20 text-mint">
                <Icon name="check" className="h-4 w-4" />
              </span>
              <p className="text-[12.5px] leading-relaxed text-white/85">{c.toast}</p>
              <button
                onClick={() => setToast(false)}
                aria-label={c.close}
                className="shrink-0 text-white/50 transition hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* badge */}
      {DEMO.ribbon && !hidden && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.4, ease }}
          onClick={() => setOpen(true)}
          className="fixed bottom-[92px] left-3 z-[87] flex items-center gap-2 rounded-full border border-gold/45 bg-ink/90 py-2.5 pl-3 pr-3.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-gold shadow-[0_14px_35px_-18px_rgba(0,0,0,0.9)] backdrop-blur md:bottom-7 md:left-7"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute h-2 w-2 rounded-full bg-gold pulse-ring" />
            <span className="h-2 w-2 rounded-full bg-gold" />
          </span>
          {c.pill}
        </motion.button>
      )}

      {/* sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[112] flex items-end justify-center p-3 sm:items-center sm:p-5"
          >
            <div className="absolute inset-0 bg-ink/85" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.4, ease }}
              className="relative max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-[1.6rem] border border-white/12 bg-ink-2 p-5 text-white shadow-lux sm:rounded-[2rem] sm:p-7"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label={c.close}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>

              <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-gold">
                {c.pill}
              </span>
              <h3 className="mt-3.5 pr-10 font-display text-[1.5rem] leading-tight sm:text-[1.8rem]">{c.title}</h3>

              <Section title={c.includedTitle} tone="mint" items={c.included} />
              <Section title={c.productionTitle} tone="gold" items={c.production} />
              <Section title={c.stepsTitle} tone="sky" items={c.steps} numbered />

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                <button
                  onClick={share}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-mint to-azure px-5 py-3.5 text-[13.5px] font-bold text-ink active:scale-[0.99] sm:w-auto"
                >
                  {copied ? c.copied : c.share}
                  <Icon name={copied ? "check" : "arrow"} className="h-4 w-4" />
                </button>
                <a
                  href={DEMO.contact.telegram || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3.5 text-[13.5px] font-semibold text-white sm:w-auto",
                    !DEMO.contact.telegram && "pointer-events-none opacity-40"
                  )}
                >
                  {c.contactCta}
                </a>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-[11.5px] text-white/60">
                <span>{c.showNote}</span>
                <button
                  onClick={() => {
                    try {
                      localStorage.setItem("ewd-demo-hidden", "1");
                    } catch {
                      /* ignore */
                    }
                    setHidden(true);
                    setOpen(false);
                  }}
                  className="font-semibold text-mint"
                >
                  {c.hide}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Section({
  title,
  items,
  tone,
  numbered = false,
}: {
  title: string;
  items: string[];
  tone: "mint" | "gold" | "sky";
  numbered?: boolean;
}) {
  const tones = {
    mint: "bg-mint/18 text-mint",
    gold: "bg-gold/18 text-gold",
    sky: "bg-azure/18 text-[#7fd3ff]",
  } as const;

  return (
    <div className="mt-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">{title}</p>
      <ul className="mt-3 space-y-2.5">
        {items.map((item, i) => (
          <li key={item} className="flex items-start gap-3">
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold",
                tones[tone]
              )}
            >
              {numbered ? i + 1 : <Icon name="check" className="h-3 w-3" />}
            </span>
            <span className="text-[13px] leading-relaxed text-white/80">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
