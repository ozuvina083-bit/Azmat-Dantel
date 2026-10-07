import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LANGS, useI18n, type Lang } from "@/i18n";
import { BRAND, MEDIA } from "@/media";
import { Icon, LuxButton, Reveal, ease } from "@/components/ui";
import { cn } from "@/utils/cn";
import logo from "@/assets/azamat-dental-logo.png";

/* ------------------------------------------------------------------ logo */
export function ToothMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-white", className)}>
      <img src={logo} alt="Stomatologiya Azamat Dental logo" className="h-full w-full object-contain" />
    </span>
  );
}

export function Wordmark({ onDark = true }: { onDark?: boolean }) {
  return (
    <span className="flex flex-col leading-none">
      <span
        className={cn(
          "font-display text-[0.98rem] tracking-[0.1em] whitespace-nowrap sm:text-[1.06rem] md:text-[1.14rem] md:tracking-[0.12em]",
          onDark ? "text-white" : "text-ink"
        )}
      >
        {BRAND.short}
      </span>
      <span className="mt-0.5 flex items-center gap-1.5">
        <span className="text-[0.55rem] font-semibold uppercase tracking-[0.34em] text-mint">Dental</span>
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ preloader */
export function Preloader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    // Kept deliberately short (~0.7s) so slow devices never wait on a fake loading screen.
    let p = 0;
    const id = setInterval(() => {
      p = Math.min(p + 26, 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(id);
        setTimeout(onDone, 200);
      }
    }, 90);
    return () => clearInterval(id);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-ink"
      exit={{ opacity: 0, filter: "blur(12px)" }}
      transition={{ duration: 0.7, ease }}
    >
      <div className="pointer-events-none absolute inset-0 dotgrid opacity-40" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 aurora rounded-full bg-mint/12 blur-[120px]" />
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease }} className="relative">
        <ToothMark className="h-20 w-20" />
        <motion.span
          className="absolute -inset-6 rounded-full border border-mint/25"
          animate={{ rotate: 360 }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        />
        <motion.span
          className="absolute -inset-12 rounded-full border border-dashed border-gold/20"
          animate={{ rotate: -360 }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
      <div className="relative mt-8 flex gap-1 overflow-hidden">
        {BRAND.short.split("").map((c, i) => (
          <motion.span
            key={i}
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 + i * 0.045, duration: 0.6, ease }}
            className="font-display text-lg tracking-[0.3em] text-white/90"
          >
            {c === " " ? "\u00A0" : c}
          </motion.span>
        ))}
      </div>
      <div className="relative mt-7 h-[3px] w-56 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-mint to-gold"
          animate={{ width: `${progress}%` }}
          transition={{ ease: "easeOut", duration: 0.2 }}
        />
      </div>
      <p className="relative mt-4 text-[11px] uppercase tracking-[0.34em] text-white/40">
        G'ijduvon · Buxoro · {Math.round(progress)}%
      </p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ language switcher */
function LangSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      className={cn(
        "relative flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur",
        compact && "w-full justify-between"
      )}
      aria-label={t.ui.langLabel}
    >
      {LANGS.map((l) => {
        const active = l.code === lang;
        return (
          <button
            key={l.code}
            onClick={() => setLang(l.code as Lang)}
            className={cn(
              "relative flex min-h-[40px] flex-1 items-center justify-center rounded-full px-3.5 text-[12px] font-bold uppercase tracking-[0.12em] transition-colors md:min-h-[34px] md:flex-none md:text-[11px] md:tracking-[0.16em]",
              active ? "text-ink" : "text-white/70 hover:text-white"
            )}
          >
            {active && (
              <motion.span
                layoutId={compact ? "lang-pill-mobile" : "lang-pill-desktop"}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-mint to-azure"
              />
            )}
            <span className="relative z-10">{l.short}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ nav */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [ids]);
  return active;
}

export function Nav({ onBook }: { onBook: () => void }) {
  const { t, lang, setLang } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(t.nav.map((n) => n.id));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease, delay: 0.1 }}
        className={cn(
          "fixed inset-x-0 top-0 z-[85] transition-all duration-500",
          scrolled
            ? "border-b border-white/10 bg-ink/95 py-2 backdrop-blur-md md:bg-ink/80 md:backdrop-blur-xl"
            : "py-4"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-3">
            <ToothMark />
            <Wordmark />
          </button>

          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur xl:flex">
            {t.nav.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-colors",
                  active === n.id ? "text-ink" : "text-white/65 hover:text-white"
                )}
              >
                {active === n.id && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-mint to-[#5fd6ff]"
                  />
                )}
                <span className="relative z-10">{n.label}</span>
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <LangSwitcher />
            <a
              href={MEDIA.phoneHref}
              className="flex items-center gap-2 text-[13px] font-semibold text-white/75 transition-colors hover:text-mint"
            >
              <Icon name="phone" className="h-4 w-4" />
              {MEDIA.phone}
            </a>
            <LuxButton onClick={onBook} className="px-5 py-3 text-[13px]">
              {t.ui.book}
            </LuxButton>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {/* quick UZ → RU → EN cycle: language switching is essential in Uzbekistan */}
            <button
              onClick={() => {
                const i = LANGS.findIndex((l) => l.code === lang);
                setLang(LANGS[(i + 1) % LANGS.length].code);
              }}
              aria-label={t.ui.langLabel}
              className="flex h-11 min-w-[52px] items-center justify-center gap-1 rounded-full border border-mint/35 bg-mint/10 text-[12.5px] font-bold tracking-[0.1em] text-mint"
            >
              {lang.toUpperCase()}
              <svg viewBox="0 0 24 24" className="h-3 w-3 opacity-80" fill="none" stroke="currentColor" strokeWidth={2.4}>
                <path d="M6 9l6 6 6-6" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={() => setOpen(true)}
              aria-label="menu"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white"
            >
              <span className="flex flex-col gap-[5px]">
                <span className="h-[2px] w-5 bg-current" />
                <span className="h-[2px] w-5 bg-current" />
                <span className="h-[2px] w-3 bg-current" />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] lg:hidden"
          >
            <div className="absolute inset-0 bg-ink" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.5, ease }}
              className="safe-bottom relative flex h-full flex-col justify-between overflow-y-auto bg-ink px-6 pt-7"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ToothMark />
                  <Wordmark />
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6}>
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <nav className="my-auto flex flex-col gap-0.5 py-6">
                {t.nav.map((n, i) => (
                  <motion.button
                    key={n.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.08 + i * 0.05, duration: 0.5, ease }}
                    onClick={() => go(n.id)}
                    className="group flex items-center justify-between border-b border-white/8 py-3.5 text-left sm:py-4"
                  >
                    <span className="font-display text-[1.35rem] text-white/90 group-hover:text-mint sm:text-2xl">
                      {n.label}
                    </span>
                    <span className="text-[11px] tracking-widest text-white/30">0{i + 1}</span>
                  </motion.button>
                ))}
              </nav>

              <div className="shrink-0 space-y-3.5">
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">{t.ui.langLabel}</p>
                  <LangSwitcher compact />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={MEDIA.phoneHref}
                    className="flex items-center justify-center gap-2 rounded-full border border-mint/40 bg-mint/10 py-3 text-[13px] font-bold text-mint"
                  >
                    <Icon name="phone" className="h-4 w-4" />
                    {t.ui.call}
                  </a>
                  <a
                    href={MEDIA.maps}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 py-3 text-[13px] font-semibold text-white"
                  >
                    <Icon name="pin" className="h-4 w-4" />
                    {t.ui.open247}
                  </a>
                </div>
                <LuxButton onClick={() => { setOpen(false); onBook(); }} className="w-full">
                  {t.ui.book}
                </LuxButton>
                <p className="text-center text-[12px] font-semibold text-white/60">
                  {MEDIA.phone} · {lang === "ru" ? "Qumrabotsaroy 3, Gijduvon" : lang === "en" ? "Qumrabotsaroy 3, Gijduvon" : "Qumrabotsaroy 3, Gijduvon"}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------------ floating actions */
export function FloatingActions() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-4 z-[88] hidden flex-col items-center gap-3 md:bottom-7 md:right-7 md:flex">
      <AnimatePresence>
        {show && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            title={t.ui.top}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-ink/70 text-white/80 backdrop-blur transition hover:text-mint"
          >
            <Icon name="arrow" className="h-5 w-5 -rotate-90" />
          </motion.button>
        )}
      </AnimatePresence>
      <motion.a
        href={MEDIA.telegram}
        target="_blank"
        rel="noreferrer"
        whileHover={{ scale: 1.06 }}
        className="glass flex h-12 items-center gap-2 rounded-full px-4 text-[13px] font-semibold text-white"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-mint" fill="currentColor">
          <path d="M21.7 4.3 18.5 19c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L5.7 12.9 1.6 11.6c-1-.3-1-1 .2-1.5l18-7c.8-.3 1.5.2 1.2 1.2Z" />
        </svg>
        Telegram
      </motion.a>
      <motion.a
        href={MEDIA.phoneHref}
        whileHover={{ scale: 1.06 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-mint to-azure text-ink shadow-[0_18px_40px_-14px_rgba(20,224,192,0.9)]"
      >
        <span className="absolute inset-0 rounded-full border border-mint pulse-ring" />
        <Icon name="phone" className="h-6 w-6" />
      </motion.a>
    </div>
  );
}

/* ------------------------------------------------------------------ mobile action bar */
export function MobileActionBar({ onBook }: { onBook: () => void }) {
  const { t } = useI18n();
  const [hide, setHide] = useState(false);
  const [inBooking, setInBooking] = useState(false);

  // Hide the bar while an input is focused so it never covers the on-screen keyboard area.
  useEffect(() => {
    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
    const onIn = (e: FocusEvent) => setHide(isField(e.target));
    const onOut = () => setHide(false);
    window.addEventListener("focusin", onIn);
    window.addEventListener("focusout", onOut);
    return () => {
      window.removeEventListener("focusin", onIn);
      window.removeEventListener("focusout", onOut);
    };
  }, []);

  // The booking wizard has its own primary buttons: hide the bar there so nothing is obscured.
  useEffect(() => {
    const el = document.getElementById("book");
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => setInBooking(entry.isIntersecting),
      { rootMargin: "-12% 0px -12% 0px", threshold: 0.01 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const hidden = hide || inBooking;

  return (
    <motion.div
      initial={{ y: 90 }}
      animate={{ y: hidden ? 130 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.32, ease }}
      className="safe-bottom pointer-events-none fixed inset-x-0 bottom-0 z-[86] border-t border-white/10 bg-ink px-3 pt-2.5 shadow-[0_-18px_40px_-24px_rgba(0,0,0,0.9)] md:hidden"
      aria-hidden={hidden}
    >
      <div className={cn("flex items-center gap-2", hidden ? "pointer-events-none" : "pointer-events-auto")}>
        <a
          href={MEDIA.phoneHref}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-mint/40 bg-mint/10 py-3 text-[13px] font-bold text-mint active:scale-[0.98]"
        >
          <Icon name="phone" className="h-4 w-4" />
          {t.ui.call}
        </a>
        <a
          href={MEDIA.telegram}
          target="_blank"
          rel="noreferrer"
          aria-label={t.contact.telegram}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/80 active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-mint" fill="currentColor">
            <path d="M21.7 4.3 18.5 19c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L5.7 12.9 1.6 11.6c-1-.3-1-1 .2-1.5l18-7c.8-.3 1.5.2 1.2 1.2Z" />
          </svg>
        </a>
        <button
          onClick={onBook}
          className="flex flex-[1.4] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-mint to-azure py-3 text-[13px] font-bold text-ink active:scale-[0.98]"
        >
          {t.ui.book}
          <Icon name="arrow" className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ footer */
export function Footer({ onBook }: { onBook: () => void }) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [mailErr, setMailErr] = useState(false);

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email.trim());
    if (!ok) {
      setMailErr(true);
      setSent(false);
      return;
    }
    setMailErr(false);
    try {
      const list = JSON.parse(localStorage.getItem("ewd-subscribers") || "[]");
      list.push({ email: email.trim(), at: new Date().toISOString() });
      localStorage.setItem("ewd-subscribers", JSON.stringify(list));
    } catch {
      /* ignore */
    }
    setSent(true);
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink pt-14 sm:pt-20">
      <div className="pointer-events-none absolute inset-0 dotgrid opacity-30" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 aurora rounded-full bg-mint/12 blur-[110px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 aurora rounded-full bg-azure/10 blur-[110px]" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:gap-12">
          <div>
            <div className="flex items-center gap-3">
              <ToothMark className="h-11 w-11" />
              <Wordmark />
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">{t.footer.about}</p>
            <p className="mt-4 font-display text-sm italic text-gold/80">{t.hero.quote}</p>
            <div className="mt-6 flex gap-3">
              {[
                { href: MEDIA.telegram, label: "Telegram", path: "M21.7 4.3 18.5 19c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L5.7 12.9 1.6 11.6c-1-.3-1-1 .2-1.5l18-7c.8-.3 1.5.2 1.2 1.2Z" },
                { href: MEDIA.instagram, label: "Instagram", path: "M7 2.8h10A4.2 4.2 0 0 1 21.2 7v10A4.2 4.2 0 0 1 17 21.2H7A4.2 4.2 0 0 1 2.8 17V7A4.2 4.2 0 0 1 7 2.8Zm5 5.4a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Zm5.2-1.3h.01" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/70 transition hover:border-mint/50 hover:text-mint"
                >
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill={s.label === "Telegram" ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.6}>
                    <path d={s.path} strokeLinecap="round" />
                    {s.label === "Instagram" && <circle cx="12" cy="12" r="4.2" fill="none" />}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[11.5px] font-bold uppercase tracking-[0.22em] text-mint">{t.footer.links}</h4>
            <ul className="mt-5 space-y-3">
              {t.nav.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => document.getElementById(n.id)?.scrollIntoView({ behavior: "smooth" })}
                    className="group flex min-h-[32px] items-center gap-2 text-sm text-white/70 transition hover:text-white"
                  >
                    <span className="h-px w-0 bg-mint transition-all duration-300 group-hover:w-4" />
                    {n.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11.5px] font-bold uppercase tracking-[0.22em] text-mint">{t.footer.services}</h4>
            <ul className="mt-5 space-y-3">
              {t.services.items.slice(0, 6).map((s) => (
                <li key={s.name}>
                  <button
                    onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
                    className="min-h-[32px] text-left text-sm text-white/70 transition hover:text-white"
                  >
                    {s.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.24em] text-mint">{t.footer.newsletter}</h4>
            <form onSubmit={subscribe} className="mt-5 space-y-3" noValidate>
              <div className="flex flex-col gap-2 rounded-3xl border border-white/12 bg-white/5 p-2 focus-within:border-mint/50 sm:flex-row sm:items-center sm:gap-3 sm:rounded-full sm:p-1.5">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.footer.emailPh}
                  type="email"
                  className="w-full bg-transparent px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none"
                />
                <button className="rounded-full bg-gradient-to-r from-mint to-azure px-5 py-2.5 text-xs font-bold text-ink sm:py-2">
                  {t.footer.subscribe}
                </button>
              </div>
              <AnimatePresence>
                {sent && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[12.5px] text-mint"
                    role="status"
                  >
                    {t.footer.subscribed}
                  </motion.p>
                )}
                {mailErr && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[12.5px] text-red-300"
                    role="alert"
                  >
                    {t.footer.emailInvalid}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>

            <div className="mt-6 space-y-3 text-[13.5px] text-white/70">
              <p className="flex items-start gap-2">
                <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
                {t.contact.addressValue}
              </p>
              <p className="flex items-start gap-2">
                <Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
                {t.contact.hoursValue}
              </p>
              <a href={MEDIA.phoneHref} className="flex items-center gap-2 font-semibold text-white">
                <Icon name="phone" className="h-4 w-4 text-mint" />
                {MEDIA.phone}
              </a>
            </div>
            <div className="mt-6">
              <Reveal>
                <LuxButton variant="ghost" onClick={onBook} className="w-full px-4 py-3 text-[13px]">
                  {t.ui.book}
                </LuxButton>
              </Reveal>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2.5 border-t border-white/10 py-7 text-[12px] leading-relaxed text-white/60 sm:mt-16 sm:text-xs md:flex-row md:items-center md:justify-between md:gap-3">
          <p>{t.footer.rights}</p>
          <p className="text-gold/60">{t.ui.demo}</p>
          <p>{t.footer.licenses}</p>
        </div>
      </div>
    </footer>
  );
}
