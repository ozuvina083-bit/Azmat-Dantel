import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useI18n } from "@/i18n";
import { MEDIA } from "@/media";
import { Icon, LuxButton, Reveal, SectionHead, ease } from "@/components/ui";
import { cn } from "@/utils/cn";
import { useHomeContent } from "@/lib/home-content";

/* ------------------------------------------------------------------ pricing */

export function Pricing({ onBook }: { onBook: () => void }) {
  const { t } = useI18n();
  const { plans } = useHomeContent();

  return (
    <section
      id="prices"
      className="relative overflow-hidden rounded-[2rem] bg-paper py-16 text-ink sm:rounded-[3rem] sm:py-20 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 dotgrid-dark opacity-50" />
      <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-gold/25 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHead kicker={t.pricing.kicker} title={t.pricing.title} sub={t.pricing.sub} />


        <div className="mt-9 grid gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {plans.map((p, i) => {
            const featured = p.badge === "popular";
            return (
              <Reveal key={p.name} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 240, damping: 22 }}
                  className={cn(
                    "relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border p-5 sm:rounded-[1.9rem] sm:p-7",
                    featured
                      ? "border-transparent bg-ink text-white shadow-[0_35px_70px_-35px_rgba(8,25,48,0.75)]"
                      : "border-ink/8 bg-white shadow-[0_22px_55px_-40px_rgba(8,25,48,0.5)]"
                  )}
                >
                  {featured && <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-mint/20 blur-[80px]" />}
                  {p.badge && (
                    <span
                      className={cn(
                        "absolute right-5 top-5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]",
                        featured ? "bg-gradient-to-r from-mint to-azure text-ink" : "bg-gold/25 text-gold-2"
                      )}
                    >
                      {p.badge === "popular" ? t.ui.popular : p.badge}
                    </span>
                  )}

                  <p className={cn("text-[12px] font-bold uppercase tracking-[0.2em]", featured ? "text-mint" : "text-mint-2")}>
                    {p.name}
                  </p>
                  <div className="mt-5 flex items-end gap-2">
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key="fixed"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.35, ease }}
                        className={cn("font-display text-[2rem] leading-none sm:text-[2.4rem]", featured ? "text-white" : "text-ink")}
                      >
                        {p.price}
                      </motion.span>
                    </AnimatePresence>
                    <span className={cn("pb-1 text-[13px] font-semibold", featured ? "text-white/55" : "text-ink/50")}>{p.unit}</span>
                  </div>
                  <p className={cn("mt-2 text-[12.5px] uppercase tracking-[0.16em]", featured ? "text-white/45" : "text-ink/45")}>
                    {p.note}
                  </p>

                  <ul className="mt-7 flex-1 space-y-3.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <span
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                            featured ? "bg-mint/20 text-mint" : "bg-mint-2/12 text-mint-2"
                          )}
                        >
                          <Icon name="check" className="h-3.5 w-3.5" />
                        </span>
                        <span className={cn("text-[13.5px] leading-snug", featured ? "text-white/75" : "text-ink/70")}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <LuxButton
                    onClick={onBook}
                    variant={featured ? "primary" : "dark"}
                    className="mt-8 w-full px-5 py-3.5 text-[13.5px]"
                  >
                    {p.cta}
                  </LuxButton>
                </motion.div>
              </Reveal>
            );
          })}
        </div>

        <p className="mt-8 text-center text-[12.5px] text-ink/45">{t.pricing.footnote}</p>
      </div>

      {/* FAQ */}
      <div id="faq" className="relative mx-auto mt-16 max-w-6xl px-5 sm:mt-24 lg:px-8">
        <SectionHead kicker={t.faq.kicker} title={t.faq.title} />
        <div className="mt-8 grid gap-3.5 sm:mt-12 sm:gap-4 md:grid-cols-2">
          {t.faq.items.map((f, i) => (
            <Reveal key={f.q} delay={(i % 2) * 0.08}>
              <FaqRow q={f.q} a={f.a} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.5rem] border bg-white transition-colors",
        open ? "border-mint-2/40" : "border-ink/8"
      )}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:gap-4 sm:px-6 sm:py-5"
      >
        <span className="text-[14px] font-semibold leading-snug text-ink sm:text-[15px]">{q}</span>
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
            open ? "bg-mint text-ink" : "bg-ink/6 text-ink/60"
          )}
        >
          <motion.svg animate={{ rotate: open ? 45 : 0 }} viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </motion.svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.42, ease }}
          >
            <p className="border-t border-ink/8 px-4 py-4 text-[13.5px] leading-relaxed text-ink/65 sm:px-6 sm:py-5 sm:text-[14px]">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ contact */
export function Contact({ onBook }: { onBook: () => void }) {
  const { t } = useI18n();

  const cards = [
    { i: "pin", l: t.contact.address, v: t.contact.addressValue },
    { i: "phone", l: t.contact.phone, v: MEDIA.phone, href: MEDIA.phoneHref },
    { i: "clock", l: t.contact.hours, v: t.contact.hoursValue },
  ];

  return (
    <section id="contacts" className="relative overflow-hidden py-16 sm:py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_40%_at_10%_20%,rgba(20,224,192,0.12),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHead kicker={t.contact.kicker} title={t.contact.title} sub={t.contact.sub} dark />

        <div className="mt-9 grid gap-5 sm:mt-14 sm:gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-3.5 sm:space-y-4">
            {cards.map((c, i) => (
              <Reveal key={c.l} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="group flex items-start gap-3.5 rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4 backdrop-blur sm:gap-4 sm:rounded-[1.6rem] sm:p-6"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-mint/25 to-azure/20 text-mint sm:h-12 sm:w-12">
                    <Icon name={c.i} className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40 sm:text-[11px] sm:tracking-[0.2em]">
                      {c.l}
                    </p>
                    {c.href ? (
                      <a
                        href={c.href}
                        className="mt-1 block font-display text-[1.15rem] text-white transition-colors group-hover:text-mint sm:text-xl"
                      >
                        {c.v}
                      </a>
                    ) : (
                      <p className="mt-1 text-[13.5px] leading-snug text-white/80 sm:text-[15px]">{c.v}</p>
                    )}
                  </div>
                </motion.div>
              </Reveal>
            ))}

            <Reveal delay={0.24}>
              <div className="rounded-[1.4rem] border border-gold/25 bg-gold/8 p-4 sm:rounded-[1.6rem] sm:p-6">
                <p className="text-[12.5px] leading-relaxed text-gold/90 sm:text-[13px]">
                  {t.contact.emergency}{" "}
                  <a href={MEDIA.phoneHref} className="font-semibold text-white underline decoration-gold/60 underline-offset-4">
                    {MEDIA.phone}
                  </a>
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
                <LuxButton variant="ghost" href={MEDIA.telegram} className="px-4 py-3 text-[12.5px] sm:px-5 sm:text-[13px]">
                  {t.contact.telegram}
                </LuxButton>
                <LuxButton variant="ghost" href={MEDIA.instagram} className="px-4 py-3 text-[12.5px] sm:px-5 sm:text-[13px]">
                  {t.contact.instagram}
                </LuxButton>
                <LuxButton onClick={onBook} className="col-span-2 px-5 py-3 text-[13px] sm:col-span-1">
                  {t.ui.book}
                </LuxButton>
              </div>
            </Reveal>
          </div>

          {/* stylised map */}
          <Reveal delay={0.15}>
            <div className="relative h-full min-h-[330px] overflow-hidden rounded-[1.6rem] border border-white/12 bg-ink-2 sm:min-h-[420px] sm:rounded-[2.2rem]">
              <div className="absolute inset-0 dotgrid opacity-50" />
              <svg viewBox="0 0 600 420" className="absolute inset-0 h-full w-full opacity-70">
                <defs>
                  <linearGradient id="road" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#14e0c0" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#3f8cff" stopOpacity="0.15" />
                  </linearGradient>
                </defs>
                <path d="M-20 300 C120 250 180 320 320 280 S520 200 640 240" stroke="url(#road)" strokeWidth="26" fill="none" />
                <path d="M180 -20 C210 90 150 160 200 260 S300 360 280 460" stroke="url(#road)" strokeWidth="18" fill="none" />
                <path d="M420 -20 C400 100 470 180 440 300 S400 400 420 460" stroke="url(#road)" strokeWidth="12" fill="none" />
                <g fill="#ffffff" opacity="0.08">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <rect key={i} x={(i % 8) * 78 + 10} y={Math.floor(i / 8) * 72 + 12} width="54" height="46" rx="8" />
                  ))}
                </g>
              </svg>

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="relative flex h-16 w-16 items-center justify-center">
                  <span className="absolute h-16 w-16 rounded-full border border-mint/40 pulse-ring" />
                  <span className="absolute h-8 w-8 rounded-full border border-mint/60 pulse-ring" style={{ animationDelay: "0.6s" }} />
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-mint to-azure text-ink shadow-glow">
                    <Icon name="pin" className="h-6 w-6" />
                  </span>
                </span>
              </div>

              <a
                href={MEDIA.maps}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-x-3 bottom-3 flex flex-col items-stretch gap-3 rounded-2xl border border-white/12 bg-ink/80 p-3.5 backdrop-blur-xl transition-colors hover:border-mint/40 sm:inset-x-4 sm:bottom-4 sm:flex-row sm:items-center sm:justify-between sm:p-4"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-mint sm:text-[10.5px] sm:tracking-[0.22em]">
                    {t.contact.reception}
                  </p>
                  <p className="mt-0.5 text-[13px] font-semibold leading-snug text-white sm:text-sm">{t.contact.addressValue}</p>
                </div>
                <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-[12px] font-semibold text-white">
                  {t.contact.mapCta}
                  <Icon name="arrow" className="h-3.5 w-3.5" />
                </span>
              </a>

              <div className="absolute right-3 top-3 rounded-2xl border border-white/12 bg-ink/70 px-3.5 py-2.5 backdrop-blur sm:right-4 sm:top-4 sm:px-4 sm:py-3">
                <p className="flex items-center gap-2 text-[10.5px] font-semibold text-mint sm:text-[11px]">
                  <Icon name="clock" className="h-3.5 w-3.5" />
                  {t.ui.open247}
                </p>
                <p className="mt-1 text-[10.5px] text-white/50 sm:text-[11px]">Qumrabotsaroy 3 · 40.15°N</p>
                <p className="text-[10.5px] text-white/50 sm:text-[11px]">64.80°E · Gijduvon</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
