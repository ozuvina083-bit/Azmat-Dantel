import { motion } from "framer-motion";
import { useState } from "react";
import { useI18n } from "@/i18n";
import { BRANDS, MEDIA } from "@/media";
import { Counter, Icon, LuxButton, Reveal, Stars, TiltCard, container, ease, item } from "@/components/ui";
import { cn } from "@/utils/cn";

/** Hero photo card. `compact` = the trimmed mobile-first variant. */
function HeroVisual({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();

  const liveBars = (
    <div className="hidden h-9 items-end gap-1 sm:flex">
      {[0.4, 0.75, 0.55, 1, 0.65, 0.85].map((h, i) => (
        <motion.span
          key={i}
          className="w-1.5 rounded-full bg-gradient-to-t from-azure to-mint"
          animate={{ height: [`${h * 40}%`, "100%", `${h * 40}%`] }}
          transition={{ duration: 1.6 + i * 0.2, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );

  return (
    <TiltCard strength={compact ? 0 : 9} className="relative">
      <div
        className={cn(
          "relative overflow-hidden rounded-[2.4rem] border border-white/12 bg-ink-2 p-2 shadow-lux",
          compact && "rounded-[1.6rem] p-1.5"
        )}
      >
        <div className={cn("relative overflow-hidden rounded-[2rem]", compact && "rounded-[1.25rem]")}>
          <img
            src={MEDIA.hero}
            alt="ESTHETIC WHITE DENTAL klinikasi"
            width={1100}
            height={1300}
            decoding="async"
            className={cn(
              "w-full object-cover",
              compact ? "h-[216px] object-[center_26%] sm:h-[260px]" : "h-[330px] sm:h-[430px] md:h-[520px]"
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />

          {!compact && (
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-mint/25 to-transparent scanline" />
          )}

          {/* 24/7 badge on the photo */}
          <span className="absolute right-2.5 top-2.5 flex items-center gap-2 rounded-full border border-mint/40 bg-ink/75 px-3 py-1.5 backdrop-blur-xl sm:right-3 sm:top-3 sm:px-3.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute h-2 w-2 rounded-full bg-mint pulse-ring" />
              <span className="h-2 w-2 rounded-full bg-mint" />
            </span>
            <span className="text-[11px] font-bold tracking-[0.18em] text-mint">24/7</span>
          </span>

          {compact ? (
            /* compact: single live strip — keeps the photo clean and the first screen tidy */
            <div className="absolute inset-x-2 bottom-2 flex items-center gap-2 rounded-2xl border border-white/12 bg-ink/80 px-3 py-2 backdrop-blur-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-mint/15 text-mint">
                <Icon name="scan" className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[9.5px] uppercase tracking-[0.16em] text-mint">{t.hero.scan}</span>
                <span className="block truncate text-[12px] font-semibold text-white">{t.tech.liveLabel}</span>
              </span>
            </div>
          ) : (
            <div className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between gap-3 rounded-2xl border border-white/12 bg-ink/70 px-3 py-2.5 backdrop-blur-xl sm:inset-x-3 sm:bottom-3 sm:px-4 sm:py-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-mint/15 text-mint sm:h-9 sm:w-9">
                  <Icon name="scan" className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-mint sm:text-[11px] sm:tracking-[0.2em]">
                    {t.hero.scan}
                  </p>
                  <p className="text-[12.5px] font-semibold text-white sm:text-sm">{t.tech.liveLabel}</p>
                </div>
              </div>
              {liveBars}
            </div>
          )}
        </div>
      </div>

      {!compact && (
        <>
          <motion.div
            aria-hidden
            className="absolute -right-6 -top-6 h-24 w-24 rounded-full border border-dashed border-mint/40 spin-slow"
            style={{ transform: "translateZ(60px)" }}
          >
            <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-gold" />
          </motion.div>

          <motion.div
            className="absolute -left-4 top-10 hidden rounded-2xl border border-white/15 bg-ink/80 px-4 py-3 backdrop-blur-xl sm:block floaty"
            style={{ transform: "translateZ(80px)" }}
          >
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">{t.hero.cards[0].v}</p>
            <p className="font-display text-xl text-mint">{t.hero.cards[0].k}</p>
          </motion.div>

          <motion.div
            className="absolute -right-5 top-1/2 hidden rounded-2xl border border-white/15 bg-ink/80 px-4 py-3 backdrop-blur-xl sm:block floaty-slow"
            style={{ transform: "translateZ(90px)" }}
          >
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">{t.hero.cards[1].v}</p>
            <p className="font-display text-xl text-gold">{t.hero.cards[1].k}</p>
          </motion.div>

          <motion.div
            className="absolute -bottom-6 left-1/2 hidden -translate-x-1/2 rounded-2xl border border-white/15 bg-ink/85 px-5 py-3 backdrop-blur-xl sm:block"
            style={{ transform: "translateZ(70px)" }}
          >
            <div className="flex items-center gap-3">
              <Icon name="shield" className="h-5 w-5 text-mint" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">{t.hero.cards[2].v}</p>
                <p className="text-sm font-semibold text-white">{t.hero.cards[2].k}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </TiltCard>
  );
}

export function Hero({ onBook }: { onBook: () => void }) {
  const { t, lang } = useI18n();
  const [openSub, setOpenSub] = useState(false);

  return (
    <section id="hero" className="relative overflow-hidden pt-24 pb-0 sm:pt-32 lg:pt-40">
      {/* backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_15%_0%,rgba(20,224,192,0.16),transparent_60%),radial-gradient(45%_45%_at_90%_10%,rgba(63,140,255,0.16),transparent_65%)]" />
      <div className="pointer-events-none absolute inset-0 dotgrid opacity-40" />
      <div className="pointer-events-none absolute -left-32 top-24 h-[420px] w-[420px] aurora rounded-full bg-mint/12 blur-[130px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-[380px] w-[380px] aurora rounded-full bg-gold/10 blur-[130px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-8">
        <div className="min-w-0">
          <motion.div key={lang} variants={container} initial="hidden" animate="show" className="w-full min-w-0">
            <motion.span
              variants={item}
              className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/5 py-2 pl-2.5 pr-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/75 backdrop-blur sm:gap-2.5 sm:pl-2.5 sm:pr-4 sm:text-[11.5px] sm:tracking-[0.18em]"
            >
              <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
                <span className="absolute h-2 w-2 rounded-full bg-mint pulse-ring" />
                <span className="h-2 w-2 rounded-full bg-mint" />
              </span>
              <span className="truncate">{t.hero.badge}</span>
            </motion.span>

            <h1 className="mt-4 font-display text-[clamp(2.05rem,6vw,4.6rem)] leading-[1.06] tracking-tight text-white sm:mt-6 sm:leading-[1.02]">
              <motion.span variants={item} className="block">
                {t.hero.titleA}
              </motion.span>
              <motion.span variants={item} className="block grad-text pb-1.5 sm:pb-2">
                {t.hero.titleB}
              </motion.span>
            </h1>

            {/* phones: the photo card sits right under the headline, inside the first screen */}
            <motion.div variants={item} className="mt-5 lg:hidden">
              <HeroVisual compact />
              <div className="mt-3 grid grid-cols-3 gap-2">
                {t.hero.cards.map((c, i) => (
                  <div
                    key={c.v}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-2.5 text-center"
                  >
                    <p
                      className={cn(
                        "font-display text-[15px] leading-none",
                        i === 0 ? "text-mint" : i === 1 ? "text-gold" : "text-[#7fd3ff]"
                      )}
                    >
                      {c.k}
                    </p>
                    <p className="mt-1 text-[10px] leading-tight text-white/70">{c.v}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={item}
              className="mt-5 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
            >
              <LuxButton
                onClick={onBook}
                className="w-full px-5 py-3.5 text-[14px] sm:w-auto sm:px-7 sm:py-4 sm:text-[15px]"
                icon={<Icon name="arrow" className="h-4 w-4" />}
              >
                {t.hero.cta1}
              </LuxButton>
              <LuxButton
                variant="ghost"
                href="#services"
                className="w-full px-5 py-3.5 text-[14px] sm:w-auto sm:px-6 sm:py-4 sm:text-[15px]"
              >
                {t.hero.cta2}
              </LuxButton>
            </motion.div>

            <motion.div variants={item} className="mt-5 sm:mt-7">
              <p
                className={cn(
                  "text-[14px] leading-relaxed text-white/70 sm:text-[15.5px] md:text-base",
                  !openSub && "line-clamp-3 sm:line-clamp-none"
                )}
              >
                {t.hero.sub}
              </p>
              <button
                onClick={() => setOpenSub((v) => !v)}
                aria-expanded={openSub}
                className="mt-2 text-[12.5px] font-bold uppercase tracking-[0.12em] text-mint sm:hidden"
              >
                {openSub ? t.ui.close : t.ui.more}
              </button>
            </motion.div>

            <motion.div variants={item} className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 sm:mt-9">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {MEDIA.avatars.map((a, i) => (
                    <img
                      key={a}
                      src={a}
                      alt=""
                      width={200}
                      height={200}
                      loading="lazy"
                      decoding="async"
                      className="h-9 w-9 rounded-full border-2 border-ink object-cover"
                      style={{ zIndex: 10 - i }}
                    />
                  ))}
                </div>
                <div>
                  <Stars />
                  <p className="mt-0.5 text-[12px] text-white/70 sm:text-xs">{t.hero.ratingText}</p>
                </div>
              </div>
              <p className="hidden font-display text-sm italic text-gold/80 md:block">{t.hero.quote}</p>
            </motion.div>
          </motion.div>
        </div>

        {/* desktop visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.25 }}
          className="relative hidden lg:block"
        >
          <HeroVisual />
        </motion.div>
      </div>

      {/* stats */}
      <div className="relative mx-auto mt-12 max-w-7xl px-4 sm:mt-16 sm:px-5 lg:mt-20 lg:px-8">
        <div className="hair overflow-hidden rounded-[1.6rem] p-1 sm:rounded-[2rem]">
          <div className="grid grid-cols-2 gap-px rounded-[1.45rem] bg-white/5 sm:rounded-[1.85rem] lg:grid-cols-4">
            {t.stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div className="group h-full bg-ink/60 px-4 py-5 transition-colors hover:bg-ink/30 sm:px-6 sm:py-7">
                  <p className="font-display text-[1.6rem] leading-none text-white sm:text-[2.1rem]">
                    <Counter value={s.value} />
                    <span className="ml-0.5 text-mint sm:ml-1">{s.suffix}</span>
                  </p>
                  <p className="mt-1.5 text-[11px] uppercase tracking-[0.1em] text-white/65 sm:mt-2 sm:text-[12.5px] sm:tracking-[0.16em]">
                    {s.label}
                  </p>
                  <span className="mt-3 block h-px w-8 bg-gradient-to-r from-mint to-transparent transition-all duration-500 group-hover:w-20 sm:mt-4" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* brands */}
      <div className="relative mt-10 border-y border-white/8 py-5 sm:mt-14 sm:py-6">
        <p className="mb-4 px-4 text-center text-[9.5px] font-semibold uppercase tracking-[0.22em] text-white/45 sm:px-5 sm:text-[10.5px] sm:tracking-[0.3em]">
          {t.ui.brandsLabel}
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="ticker flex w-max items-center gap-8 pr-8 sm:gap-12 sm:pr-12">
            {[...BRANDS, ...BRANDS].map((b, i) => (
              <span key={i} className="whitespace-nowrap font-display text-base tracking-wide text-white/45 sm:text-lg">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
