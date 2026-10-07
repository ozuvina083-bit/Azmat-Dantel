import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import { BRAND, MEDIA } from "@/media";
import { Icon, Reveal, SectionHead, Stars, ease } from "@/components/ui";
import { cn } from "@/utils/cn";
import { useHomeContent } from "@/lib/home-content";

/* ------------------------------------------------------------------ doctors */
export function Doctors({ onBook }: { onBook: () => void }) {
  const { t } = useI18n();
  const { doctors } = useHomeContent();
  return (
    <section id="doctors" className="relative overflow-hidden py-16 sm:py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_35%_at_15%_10%,rgba(63,140,255,0.14),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHead kicker={t.doctors.kicker} title={t.doctors.title} sub={t.doctors.sub} dark />

        <div className="mt-10 grid gap-5 sm:mt-14 md:grid-cols-3 md:gap-6">
          {doctors.map((d, i) => (
            <Reveal key={d.name} delay={i * 0.1}>
              <motion.article
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 240, damping: 22 }}
                className="group relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.03] sm:rounded-[2rem]"
              >
                <div className="relative h-[300px] overflow-hidden sm:h-[340px]">
                  <img
                    src={d.image || MEDIA.doctors[i % MEDIA.doctors.length]}
                    alt={d.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.07]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-ink/70 px-3 py-1.5 text-[11px] font-semibold text-mint backdrop-blur">
                    {d.exp} {t.doctors.expLabel}
                  </span>
                  <div className="absolute inset-x-4 bottom-4">
                    <h3 className="font-display text-[1.4rem] leading-tight text-white sm:text-[1.6rem]">{d.name}</h3>
                    <p className="mt-1 text-[11.5px] uppercase tracking-[0.12em] text-white/55 sm:text-[12.5px] sm:tracking-[0.14em]">
                      {d.role}
                    </p>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {d.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-[11px] text-white/75 sm:px-3 sm:text-[11.5px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={onBook}
                    className="mt-4 flex w-full items-center justify-between rounded-2xl border border-white/12 px-4 py-3 text-[12.5px] font-semibold text-white/80 transition hover:border-mint/50 hover:bg-mint/10 hover:text-white sm:mt-5 sm:text-[13px]"
                  >
                    {t.doctors.bookWith}
                    <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ before / after */
function CompareSlider({ before, after, className }: { before: string; after: string; className?: string }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(52);
  const [dragging, setDragging] = useState(false);

  const update = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.min(98, Math.max(2, ((clientX - r.left) / r.width) * 100)));
  };

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => update(e.clientX);
    const stop = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    window.addEventListener("blur", stop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      window.removeEventListener("blur", stop);
    };
  }, [dragging]);

  return (
    <div
      ref={ref}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        setDragging(true);
        update(e.clientX);
      }}
      className={cn(
        // touch-pan-y keeps vertical page scrolling working on phones
        "group relative touch-pan-y select-none overflow-hidden rounded-[1.5rem] border border-white/12 bg-ink-2 sm:rounded-[2rem]",
        dragging ? "cursor-grabbing" : "cursor-grab",
        className
      )}
    >
      <img src={after} alt={t.results.after} className="block h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={before} alt={t.results.before} className="block h-full w-full object-cover" draggable={false} />
      </div>

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-ink/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80 backdrop-blur sm:left-4 sm:top-4 sm:px-3.5 sm:text-[11px] sm:tracking-[0.16em]">
        {t.results.before}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-mint/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink sm:right-4 sm:top-4 sm:px-3.5 sm:text-[11px] sm:tracking-[0.16em]">
        {t.results.after}
      </span>

      <div className="pointer-events-none absolute inset-y-0 w-px bg-white/80 shadow-[0_0_24px_rgba(20,224,192,0.9)]" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/80 bg-ink/70 text-white backdrop-blur">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M4 12h16" />
          </svg>
        </span>
      </div>

      <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-ink/70 px-4 py-2 text-[11px] text-white/70 backdrop-blur transition-opacity group-hover:opacity-0">
        {t.results.hint}
      </span>
    </div>
  );
}

export function Results() {
  const { t } = useI18n();
  const cases = [
    { src: { before: MEDIA.smileBefore, after: MEDIA.smileAfter }, data: t.results.cases[0] },
    { src: MEDIA.caseB, data: t.results.cases[1] },
    { src: MEDIA.caseC, data: t.results.cases[2] },
  ];

  return (
    <section
      id="results"
      className="relative overflow-hidden rounded-[2rem] bg-paper py-16 text-ink sm:rounded-[3rem] sm:py-20 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 dotgrid-dark opacity-50" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHead kicker={t.results.kicker} title={t.results.title} sub={t.results.sub} />

        <Reveal delay={0.1}>
          <div className="mx-auto mt-9 max-w-4xl sm:mt-12">
            <CompareSlider
              before={cases[0].src.before}
              after={cases[0].src.after}
              className="h-[260px] sm:h-[320px] md:h-[440px]"
            />
            <div className="mt-3.5 flex flex-col items-center justify-center gap-1.5 text-center sm:mt-4 sm:flex-row sm:gap-3">
              <p className="font-display text-[1.05rem] sm:text-lg">{cases[0].data.title}</p>
              <span className="hidden h-4 w-px bg-ink/20 sm:block" />
              <p className="text-[13px] text-ink/55 sm:text-sm">{cases[0].data.desc}</p>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:mt-16 md:grid-cols-3 md:gap-6">
          {cases.map((c, i) => (
            <Reveal key={c.data.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 240, damping: 22 }}
                className="h-full overflow-hidden rounded-[1.8rem] border border-ink/8 bg-white p-3 shadow-[0_22px_55px_-34px_rgba(8,25,48,0.45)]"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative overflow-hidden rounded-[1.3rem]">
                    <img src={c.src.before} alt={t.results.before} loading="lazy" className="h-32 w-full object-cover grayscale-[35%]" />
                    <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-1 text-[10.5px] font-bold uppercase tracking-widest text-white">
                      {t.results.before}
                    </span>
                  </div>
                  <div className="relative overflow-hidden rounded-[1.3rem]">
                    <img src={c.src.after} alt={t.results.after} loading="lazy" className="h-32 w-full object-cover" />
                    <span className="absolute left-2 top-2 rounded-full bg-mint px-2 py-1 text-[9.5px] font-bold uppercase tracking-widest text-ink">
                      {t.results.after}
                    </span>
                  </div>
                </div>
                <div className="px-2 pb-2 pt-4">
                  <h3 className="font-display text-[1.3rem] leading-tight">{c.data.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink/60">{c.data.desc}</p>
                  <p className="mt-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-mint-2">
                    <Icon name="check" className="h-3.5 w-3.5" />
                    {c.data.meta}
                  </p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* clinic gallery strip */}
        <div className="relative mt-12 overflow-hidden sm:mt-16 [mask-image:linear-gradient(to_right,transparent,black_9%,black_91%,transparent)]">
          <div className="ticker flex w-max gap-3 sm:gap-5">
            {[...MEDIA.gallery, MEDIA.interiorAlt, MEDIA.interior, ...MEDIA.gallery, MEDIA.interiorAlt, MEDIA.interior].map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                loading="lazy"
                className="h-32 w-48 rounded-[1.2rem] border border-ink/8 object-cover shadow-[0_20px_45px_-32px_rgba(8,25,48,0.5)] sm:h-40 sm:w-64 sm:rounded-[1.5rem] md:h-48 md:w-80"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ testimonials */
export function Testimonials() {
  const { t } = useI18n();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const items = t.testimonials.items;

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((v) => (v + 1) % items.length), 6000);
    return () => clearInterval(id);
  }, [paused, items.length]);

  const go = (dir: number) => setI((v) => (v + dir + items.length) % items.length);
  const active = items[i];

  return (
    <section
      className="relative overflow-hidden py-16 sm:py-20 lg:py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_35%_at_80%_20%,rgba(233,198,139,0.12),transparent_60%)]" />
      <div className="relative mx-auto max-w-6xl px-5 lg:px-8">
        <SectionHead kicker={t.testimonials.kicker} title={t.testimonials.title} dark />

        <div className="relative mt-10 sm:mt-14">
          <div className="hair rounded-[1.8rem] p-1 sm:rounded-[2.2rem]">
            <div className="relative overflow-hidden rounded-[1.6rem] bg-ink/70 p-5 backdrop-blur-xl sm:rounded-[2rem] sm:p-7 md:p-12">
              <svg viewBox="0 0 24 24" className="absolute right-8 top-6 h-20 w-20 text-mint/10" fill="currentColor">
                <path d="M9.8 5.5C6.3 6.7 4 9.9 4 13.6c0 3 1.8 4.9 4.1 4.9 2 0 3.6-1.5 3.6-3.5 0-2-1.4-3.3-3.2-3.3-.3 0-.7 0-.9.1.3-1.7 1.6-3.2 3.4-4L9.8 5.5Zm8.4 0c-3.5 1.2-5.8 4.4-5.8 8.1 0 3 1.8 4.9 4.1 4.9 2 0 3.6-1.5 3.6-3.5 0-2-1.4-3.3-3.2-3.3-.3 0-.7 0-.9.1.3-1.7 1.6-3.2 3.4-4l-1.2-2.3Z" />
              </svg>

              <AnimatePresence mode="wait">
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 40, filter: "blur(6px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -40, filter: "blur(6px)" }}
                  transition={{ duration: 0.55, ease }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -55) go(1);
                    else if (info.offset.x > 55) go(-1);
                  }}
                  className="relative cursor-grab active:cursor-grabbing"
                >
                  <Stars className="h-4 w-4 sm:h-5 sm:w-5" />
                  <p className="mt-4 max-w-3xl font-display text-[clamp(1.05rem,2.4vw,1.75rem)] leading-snug text-white/90 sm:mt-6">
                    “{active.text}”
                  </p>
                  <div className="mt-6 flex items-center gap-3 sm:mt-8 sm:gap-4">
                    <img
                      src={MEDIA.avatars[i % MEDIA.avatars.length]}
                      alt={active.name}
                      className="h-12 w-12 rounded-2xl object-cover sm:h-14 sm:w-14"
                    />
                    <div>
                      <p className="text-[14.5px] font-semibold text-white sm:text-base">{active.name}</p>
                      <p className="text-[12px] text-white/70 sm:text-[13px]">
                        {active.city} · {active.treatment}
                      </p>
                    </div>
                    <span className="ml-auto hidden items-center gap-2 rounded-full border border-mint/25 bg-mint/10 px-3.5 py-1.5 text-[11px] font-semibold text-mint sm:flex">
                      <Icon name="check" className="h-3.5 w-3.5" />
                      {t.testimonials.verified}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5 sm:mt-10 sm:pt-6">
                <div className="flex items-center gap-2">
                  {items.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setI(idx)}
                      aria-label={`slide ${idx + 1}`}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-500",
                        idx === i ? "w-8 bg-gradient-to-r from-mint to-azure sm:w-10" : "w-3 bg-white/20 hover:bg-white/40"
                      )}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  {[-1, 1].map((d) => (
                    <button
                      key={d}
                      onClick={() => go(d)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-mint/50 hover:text-white sm:h-11 sm:w-11"
                    >
                      <Icon name="arrow" className={cn("h-5 w-5", d === -1 && "rotate-180")} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="no-scrollbar -mx-5 mt-6 flex items-center gap-2.5 overflow-x-auto px-5 pb-1 sm:mt-8 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
            {items.map((p, idx) => (
              <button
                key={p.name}
                onClick={() => setI(idx)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-[11.5px] transition sm:px-4 sm:text-[12px]",
                  idx === i ? "border-mint/50 bg-mint/10 text-mint" : "border-white/12 bg-white/[0.03] text-white/50 hover:text-white"
                )}
              >
                {p.name} · {p.treatment}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:mt-14">
          <Reveal>
            <div className="flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.03] px-4 py-3 backdrop-blur sm:gap-4 sm:px-6 sm:py-3.5">
              <Stars className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[12px] font-semibold text-white/80 sm:text-[13.5px]">{t.hero.ratingText}</span>
              <span className="hidden h-4 w-px bg-white/15 sm:block" />
              <a href={MEDIA.instagram} className="hidden text-[13px] font-semibold text-mint sm:block">
                {BRAND.handle}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
