import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useI18n } from "@/i18n";
import { useHomeContent } from "@/lib/home-content";
import { MEDIA } from "@/media";
import { Counter, Icon, LuxButton, Reveal, SectionHead, ease } from "@/components/ui";

/* ------------------------------------------------------------------ services */
export function Services({ onBook }: { onBook: () => void }) {
  const { t } = useI18n();
  const { services } = useHomeContent();
  const [open, setOpen] = useState<number | null>(null);
  const active = open === null ? null : services[open];

  return (
    <section
      id="services"
      className="relative -mt-4 overflow-hidden rounded-[2rem] bg-paper py-16 text-ink sm:rounded-[3rem] sm:py-20 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 dotgrid-dark opacity-60" />
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-mint/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-1/2 h-72 w-72 rounded-full bg-azure/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHead kicker={t.services.kicker} title={t.services.title} sub={t.services.sub} />

        <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal key={s.name} delay={(i % 4) * 0.07}>
              <motion.button
                onClick={() => setOpen(i)}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="group relative flex h-full w-full flex-col overflow-hidden rounded-[1.5rem] border border-ink/8 bg-white p-5 text-left shadow-[0_20px_50px_-30px_rgba(8,25,48,0.35)] sm:rounded-[1.7rem] sm:p-6"
              >
                <span className="pointer-events-none absolute inset-x-0 top-0 h-[3px] scale-x-0 bg-gradient-to-r from-mint to-azure transition-transform duration-500 group-hover:scale-x-100" />
                {s.tag && (
                  <span className="absolute right-3.5 top-3.5 rounded-full bg-ink px-3 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-mint sm:right-4 sm:top-4 sm:text-[10px]">
                    {s.tag}
                  </span>
                )}
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-ink to-ink-3 text-mint transition-transform duration-500 group-hover:-rotate-6 sm:h-12 sm:w-12">
                  <Icon name={s.icon} className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <h3 className="mt-4 font-display text-[1.22rem] leading-tight sm:mt-5 sm:text-[1.35rem]">{s.name}</h3>
                <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-ink/60 sm:mt-3 sm:text-[13.5px]">{s.desc}</p>
                <div className="mt-5 flex items-center justify-between border-t border-ink/8 pt-4">
                  <span className="text-[13px] font-bold text-mint-2">{s.price}</span>
                  <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ink/45 transition-colors group-hover:text-ink">
                    {t.ui.more}
                    <Icon name="arrow" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </motion.button>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-ink/8 bg-white/70 p-4 text-center backdrop-blur sm:mt-12 sm:flex-row sm:gap-4 sm:rounded-[1.7rem] sm:p-5 sm:text-left">
            <p className="text-[13.5px] font-semibold text-ink/70 sm:text-sm">{t.pricing.promoHint}</p>
            <LuxButton variant="dark" onClick={onBook} className="w-full px-5 py-3 text-[13px] sm:w-auto">
              {t.pricing.promo}
            </LuxButton>
          </div>
        </Reveal>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          >
            <div className="absolute inset-0 bg-ink/80 backdrop-blur-md" onClick={() => setOpen(null)} />
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease }}
              className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[1.7rem] border border-white/12 bg-ink-2 p-5 text-white shadow-lux sm:rounded-[2rem] sm:p-7"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-mint/20 blur-[90px]" />
              <button
                onClick={() => setOpen(null)}
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>

              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-mint/25 to-azure/20 text-mint sm:h-14 sm:w-14">
                <Icon name={active.icon} className="h-6 w-6 sm:h-7 sm:w-7" />
              </span>
              <h3 className="mt-4 pr-10 font-display text-[1.6rem] leading-tight sm:mt-5 sm:text-3xl">{active.name}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-white/65 sm:mt-4 sm:text-[15px]">{active.long}</p>

              <div className="mt-5 grid grid-cols-3 gap-2.5 sm:mt-6 sm:gap-4">
                {[
                  { l: t.contact.hours, v: active.duration, i: "clock" },
                  { l: t.pricing.kicker, v: active.price, i: "medal" },
                  { l: t.why.items[5].title, v: "UZ · RU · EN", i: "globe" },
                ].map((row) => (
                  <div key={row.l} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.18em] text-white/40">
                      <Icon name={row.i} className="h-3.5 w-3.5 text-mint" />
                      {row.l}
                    </span>
                    <p className="mt-2 text-sm font-semibold text-white">{row.v}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:flex-wrap sm:gap-3">
                <LuxButton
                  onClick={() => {
                    setOpen(null);
                    onBook();
                  }}
                  className="w-full px-6 py-3.5 text-sm sm:w-auto"
                >
                  {t.ui.bookThis}
                </LuxButton>
                <LuxButton variant="ghost" href={MEDIA.phoneHref} className="w-full px-6 py-3.5 text-sm sm:w-auto">
                  {MEDIA.phone}
                </LuxButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ------------------------------------------------------------------ why + process */
export function Why() {
  const { t } = useI18n();

  return (
    <section id="why" className="relative overflow-hidden py-16 sm:py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_80%_0%,rgba(20,224,192,0.12),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHead kicker={t.why.kicker} title={t.why.title} sub={t.why.sub} dark />

        <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {t.why.items.map((w, i) => (
            <Reveal key={w.title} delay={(i % 3) * 0.08}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 240, damping: 20 }}
                className="group relative h-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur sm:rounded-[1.7rem] sm:p-6"
              >
                <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-mint/10 opacity-0 blur-[60px] transition-opacity duration-500 group-hover:opacity-100" />
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent text-mint sm:h-12 sm:w-12">
                  <Icon name={w.icon} className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <h3 className="mt-4 text-[1.08rem] font-bold text-white sm:mt-5 sm:text-[1.15rem]">{w.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-white/55 sm:mt-2.5 sm:text-[13.5px]">{w.desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* process */}
        <div className="mt-14 sm:mt-20">
          <SectionHead kicker={t.process.kicker} title={t.process.title} dark />
          <div className="relative mt-10 sm:mt-14">
            <motion.span
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1.4, ease }}
              className="absolute left-0 top-7 hidden h-px w-full origin-left bg-gradient-to-r from-mint/60 via-gold/40 to-transparent lg:block"
            />
            <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
              {t.process.steps.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.12}>
                  <div className="relative flex gap-4 sm:block">
                    <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-mint/30 bg-ink font-display text-lg text-mint sm:h-14 sm:w-14 sm:text-xl">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="text-[1rem] font-bold text-white sm:mt-5 sm:text-[1.05rem]">{s.title}</h4>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-white/55 sm:mt-2 sm:text-[13.5px]">{s.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* highlight band */}
        <Reveal delay={0.1}>
          <div className="mt-14 grid items-stretch overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.03] sm:mt-20 sm:rounded-[2.2rem] lg:grid-cols-2">
            <div className="relative min-h-[220px] sm:min-h-[280px]">
              <img src={MEDIA.interior} alt="clinic" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-ink/70 to-transparent lg:bg-gradient-to-l" />
              <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-mint backdrop-blur sm:left-5 sm:top-5 sm:px-4 sm:py-2 sm:text-[11px] sm:tracking-[0.2em]">
                {t.tech.badge}
              </span>
            </div>
            <div className="flex flex-col justify-center gap-5 p-5 sm:gap-6 sm:p-8 lg:p-12">
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  { v: "99", s: "%", l: t.results.successRate },
                  { v: "4 200", s: "+", l: t.stats[2].label },
                  { v: "3", s: "", l: t.ui.langLabel },
                ].map((k) => (
                  <div key={k.l}>
                    <p className="font-display text-[1.6rem] text-white sm:text-3xl">
                      <Counter value={k.v} />
                      <span className="text-mint">{k.s}</span>
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-white/45 sm:text-[11px] sm:tracking-[0.14em]">
                      {k.l}
                    </p>
                  </div>
                ))}
              </div>
              <p className="font-display text-[1.35rem] leading-snug text-white/90 sm:text-2xl">{t.hero.quote}</p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {t.hero.cards.map((c) => (
                  <span key={c.v} className="rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-[11.5px] text-white/65 sm:px-4 sm:py-2 sm:text-xs">
                    {c.k} · {c.v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ technology */
export function Tech() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-paper py-16 text-ink sm:rounded-[3rem] sm:py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 dotgrid-dark opacity-50" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 sm:gap-14 lg:grid-cols-2 lg:px-8">
        <div>
          <SectionHead kicker={t.tech.kicker} title={t.tech.title} sub={t.tech.text} center={false} />
          <div className="mt-7 space-y-3 sm:mt-9 sm:space-y-4">
            {t.tech.points.map((p, i) => (
              <Reveal key={p} delay={i * 0.08}>
                <div className="group flex items-start gap-3 rounded-2xl border border-ink/8 bg-white p-3.5 shadow-[0_16px_40px_-30px_rgba(8,25,48,0.4)] sm:gap-4 sm:p-4">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-mint/15 text-mint-2 sm:h-9 sm:w-9">
                    <Icon name="check" className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                  <p className="text-[13.5px] leading-relaxed text-ink/75 sm:text-[14.5px]">{p}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.15}>
          <div className="relative">
            <div className="overflow-hidden rounded-[2.2rem] border border-ink/8 bg-white p-2 shadow-[0_30px_70px_-40px_rgba(8,25,48,0.5)]">
              <div className="relative overflow-hidden rounded-[1.9rem]">
                <img src={MEDIA.tech} alt="technology" className="h-[260px] w-full object-cover sm:h-[360px] md:h-[440px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/15 bg-ink/70 p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-mint">{t.hero.scan}</p>
                    <p className="text-[11px] text-white/50">CBCT · 3Shape</p>
                  </div>
                  <div className="mt-3 flex items-end gap-1.5">
                    {Array.from({ length: 22 }).map((_, i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 flex-1 rounded-full bg-gradient-to-t from-azure/70 to-mint"
                        animate={{ height: [8, 12 + ((i * 7) % 26), 8] }}
                        transition={{ duration: 2 + (i % 5) * 0.3, repeat: Infinity, ease: "easeInOut" }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-4 hidden w-52 rounded-2xl border border-ink/8 bg-white p-4 shadow-[0_24px_50px_-28px_rgba(8,25,48,0.55)] sm:block"
            >
              <p className="text-[10.5px] uppercase tracking-[0.2em] text-ink/45">{t.tech.badge}</p>
              <p className="mt-1 font-display text-xl text-ink">5 min · 0 gips</p>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
