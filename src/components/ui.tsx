import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";

/* ------------------------------------------------------------------ icons */
export const ICONS: Record<string, ReactNode> = {
  implant: (
    <>
      <path d="M12 3.5c-1.9 0-3.4 1.2-3.4 3 0 2.4 1 3.6 1.4 6.2.3 2 .5 4.8 2 4.8 1.6 0 1.8-3.2 2-4.8.3-2.2.4-2.2.7 0 .2 1.6.4 4.8 2 4.8 1.5 0 1.7-2.8 2-4.8.4-2.6 1.3-3.8 1.3-6.2 0-1.8-1.5-3-3.4-3S13 4.8 12 4.8s-2-1.3-3.9-1.3Z" />
    </>
  ),
  veneer: (
    <>
      <path d="M4 8h16l-2.2 9.4A2 2 0 0 1 15.8 19H8.2a2 2 0 0 1-2-1.6L4 8Z" />
      <path d="M7.5 8v11M12 8v11M16.5 8v11" />
    </>
  ),
  brace: (
    <>
      <path d="M3 12c0-4 4-7 9-7s9 3 9 7" />
      <rect x="6" y="10.4" width="3.4" height="3.4" rx="1" />
      <rect x="14.6" y="10.4" width="3.4" height="3.4" rx="1" />
      <path d="M9.4 12h5.2" />
    </>
  ),
  therapy: (
    <>
      <path d="M12 3.6c-3 0-5 2-5 4.8 0 3.8 1.4 5 1.9 9.1.2 1.9 2.3 1.9 2.6 0 .4-2.3.5-3.9 1-3.9s.6 1.6 1 3.9c.3 1.9 2.4 1.9 2.6 0 .5-4.1 1.9-5.3 1.9-9.1 0-2.8-2-4.8-5-4.8Z" />
    </>
  ),
  whitening: (
    <>
      <path d="M12 3.5 13.7 9l5.4 1.7-5.4 1.7L12 17.9l-1.7-5.5L4.9 10.7l5.4-1.7L12 3.5Z" />
      <path d="M18.6 16.4l.7 2.2 2.2.7-2.2.7-.7 2.2-.7-2.2-2.2-.7 2.2-.7.7-2.2Z" />
    </>
  ),
  child: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" />
      <path d="M9.5 7.5h.01M14.5 7.5h.01" />
    </>
  ),
  clean: (
    <>
      <path d="M14.9 4.6l4.5 4.5-8.7 8.7a3.2 3.2 0 0 1-4.5-4.5l8.7-8.7Z" />
      <path d="M8.5 12.5l3 3M17 2.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" />
    </>
  ),
  crown: (
    <>
      <path d="M4 8.5l3.2 2.6L12 5l4.8 6.1L20 8.5l-1.4 9.2a1.6 1.6 0 0 1-1.6 1.3H7a1.6 1.6 0 0 1-1.6-1.3L4 8.5Z" />
    </>
  ),
  scan: (
    <>
      <path d="M3.5 8.5V6a2.5 2.5 0 0 1 2.5-2.5h3M20.5 8.5V6A2.5 2.5 0 0 0 18 3.5h-3M3.5 15.5V18A2.5 2.5 0 0 0 6 20.5h3M20.5 15.5V18A2.5 2.5 0 0 1 18 20.5h-3" />
      <path d="M3 12h18" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.2l7.5 2.8v6c0 4.3-3 7.4-7.5 8.8-4.5-1.4-7.5-4.5-7.5-8.8v-6L12 3.2Z" />
      <path d="M9 12.3l2.2 2.2L15.4 10" />
    </>
  ),
  medal: (
    <>
      <circle cx="12" cy="14.5" r="5.5" />
      <path d="M8.5 9.5L6.8 2.5h10.4l-1.7 7" />
      <path d="M12 12.4l1 2 2.2.3-1.6 1.5.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.5 2.2-.3 1-2Z" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 9h17M3.5 15h17M12 3c2.6 3.4 2.6 14.6 0 18M12 3c-2.6 3.4-2.6 14.6 0 18" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3.3 2" />
    </>
  ),
  lab: (
    <>
      <path d="M9 3.5h6v4.8l3.6 9.3A2 2 0 0 1 16.7 20.5H7.3a2 2 0 0 1-1.9-2.9L9 8.3V3.5Z" />
      <path d="M7.6 14.6h8.8" />
    </>
  ),
  phone: (
    <>
      <path d="M6.5 3.8h2.2l1.5 3.7-1.9 1.4a11 11 0 0 0 5.8 5.8l1.4-1.9 3.7 1.5v2.2a2.6 2.6 0 0 1-2.9 2.5C10 18.4 5.6 14 4 8.3a2.6 2.6 0 0 1 2.5-4.5Z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21c4-4.6 6-7.7 6-10.4A6 6 0 0 0 6 10.6C6 13.3 8 16.4 12 21Z" />
      <circle cx="12" cy="10.4" r="2.3" />
    </>
  ),
  check: <path d="M4.5 12.8l4.7 4.7L19.5 7" />,
  arrow: <path d="M4 12h15m-5.5-6l6 6-6 6" />,
};

export function Icon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {ICONS[name] ?? ICONS.check}
    </svg>
  );
}

/* ------------------------------------------------------------------ motion helpers */
export const ease = [0.22, 1, 0.36, 1] as const;

export const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
export const item: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease } },
};

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      // amount: 0 keeps reveals reliable on small screens and tall blocks
      viewport={{ once, amount: 0, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.75, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[90] h-[3px] origin-left bg-gradient-to-r from-mint via-gold to-azure"
    />
  );
}

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const move = (e: PointerEvent) => {
      if (!ref.current) return;
      ref.current.style.transform = `translate3d(${e.clientX - 300}px, ${e.clientY - 300}px, 0)`;
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[80] hidden h-[600px] w-[600px] rounded-full opacity-60 blur-[80px] md:block"
      style={{ background: "radial-gradient(circle, rgba(20,224,192,0.16), rgba(63,140,255,0.08) 45%, transparent 70%)" }}
    />
  );
}

/* ------------------------------------------------------------------ primitives */
export function Counter({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState("0");
  const target = parseFloat(value.replace(/[^\d.]/g, "")) || 0;
  const grouped = value.includes(" ");
  const decimal = value.includes(".");

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1500;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = target * eased;
      let out = decimal ? cur.toFixed(1) : Math.round(cur).toString();
      if (grouped) out = out.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      setDisplay(out);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, grouped, decimal]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

export function LuxButton({
  children,
  href,
  onClick,
  variant = "primary",
  className,
  icon,
  type = "button",
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "gold" | "dark";
  className?: string;
  icon?: ReactNode;
  type?: "button" | "submit";
}) {
  const base =
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3.5 text-sm font-semibold tracking-wide transition-transform duration-300 will-change-transform hover:-translate-y-0.5";
  const styles: Record<string, string> = {
    primary:
      "sheen bg-gradient-to-r from-mint via-[#26e6cb] to-azure text-ink shadow-[0_18px_45px_-18px_rgba(20,224,192,0.85)]",
    gold: "sheen bg-gradient-to-r from-gold via-[#f2dcb0] to-gold-2 text-ink shadow-[0_18px_45px_-18px_rgba(233,198,139,0.8)]",
    ghost: "border border-white/20 bg-white/5 text-white backdrop-blur hover:border-mint/60 hover:bg-white/10",
    dark: "sheen bg-ink text-white hover:bg-ink-2",
  };
  const inner = (
    <>
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {icon}
      </span>
    </>
  );
  if (href) {
    return (
      <a href={href} className={cn(base, styles[variant], className)}>
        {inner}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cn(base, styles[variant], className)}>
      {inner}
    </button>
  );
}

export function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const on = () => setCoarse(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return coarse;
}

export function TiltCard({ children, className, strength = 12 }: { children: ReactNode; className?: string; strength?: number }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 18 });
  const sry = useSpring(ry, { stiffness: 150, damping: 18 });
  const t2 = useMotionTemplate`perspective(1100px) rotateX(${srx}deg) rotateY(${sry}deg)`;
  const coarse = useCoarsePointer();
  const flat = useMotionTemplate`perspective(1100px) rotateX(0deg) rotateY(0deg)`;

  return (
    <motion.div
      style={{ transform: coarse ? flat : t2, touchAction: "pan-y" }}
      onPointerMove={(e) => {
        if (coarse || e.pointerType === "touch") return;
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry.set(px * strength * 2);
        rx.set(-py * strength * 2);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      className={cn("[transform-style:preserve-3d]", className)}
    >
      {children}
    </motion.div>
  );
}

export function SectionHead({
  kicker,
  title,
  sub,
  dark = false,
  center = true,
  className,
}: {
  kicker: string;
  title: string;
  sub?: string;
  dark?: boolean;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", center && "mx-auto text-center", className)}>
      <Reveal>
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-[11px] sm:tracking-[0.24em]",
            dark ? "border-mint/30 bg-mint/10 text-mint" : "border-mint-2/25 bg-mint-2/8 text-mint-2"
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {kicker}
        </span>
      </Reveal>
      <Reveal delay={0.08}>
        <h2
          className={cn(
            "mt-4 font-display text-[clamp(1.7rem,4.2vw,3.35rem)] leading-[1.1] sm:mt-5 sm:leading-[1.08]",
            dark ? "text-white" : "text-ink"
          )}
        >
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.16}>
          <p className={cn("mt-4 text-[14px] leading-relaxed sm:mt-5 sm:text-[15px] md:text-base", dark ? "text-white/60" : "text-ink/60")}>
            {sub}
          </p>
        </Reveal>
      )}
    </div>
  );
}

export function Stars({ n = 5, className = "h-4 w-4" }: { n?: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-gold">
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9L12 2.6Z" />
        </svg>
      ))}
    </span>
  );
}
