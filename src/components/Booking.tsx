import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n, type Lang } from "@/i18n";
import { MEDIA } from "@/media";
import { Icon, LuxButton, SectionHead, ease } from "@/components/ui";
import { cn } from "@/utils/cn";

const WEEKDAYS: Record<Lang, string[]> = {
  uz: ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"],
  ru: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

/** 24/7 clinic → daytime, evening and night slots */
const SLOTS = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30", "21:00", "23:00"];

/** Deterministic per-day availability instead of hard-coded "busy" slots. */
function busyForDay(key: string) {
  let h = 7;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 99991;
  const busy = new Set<number>();
  SLOTS.forEach((_, i) => {
    if (((h >> (i % 12)) + i) % 4 === 0) busy.add(i);
  });
  if (busy.size > SLOTS.length - 4) {
    busy.delete(1);
    busy.delete(6);
  }
  return busy;
}

/** Accepts +998XXXXXXXXX, 998XXXXXXXXX or a 9-digit local number. */
function normalizePhone(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("998")) return d.length === 12 ? `+${d}` : null;
  return d.length === 9 ? `+998${d}` : null;
}

type BookingRecord = {
  ref: string;
  service: string;
  doctor: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  comment: string;
  lang: Lang;
  createdAt: string;
};

export function Booking() {
  const { t, lang } = useI18n();
  const [step, setStep] = useState(0);
  const [service, setService] = useState<number | null>(null);
  const [doctorId, setDoctorId] = useState<number>(-1); // -1 = any doctor
  const [dateIdx, setDateIdx] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [record, setRecord] = useState<BookingRecord | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const dates = useMemo(() => {
    const out: { d: number; m: number; wd: string; key: string; busy: Set<number> }[] = [];
    const now = new Date();
    for (let i = 0; i < 10; i++) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i + 1);
      const key = `${day.getDate()}-${day.getMonth()}-${day.getFullYear()}`;
      out.push({
        d: day.getDate(),
        m: day.getMonth() + 1,
        wd: WEEKDAYS[lang][day.getDay()],
        key,
        busy: busyForDay(key),
      });
    }
    return out;
  }, [lang]);

  const selectedDate = dateIdx === null ? null : dates[dateIdx];
  const doctorName = doctorId === -1 ? t.booking.anyDoctor : t.doctors.items[doctorId].name;

  // Moving between steps should bring the form back into view (mobile especially).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) return;
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // the card carries scroll-mt-28 so it never lands behind the fixed header
  }, [step, sending]);

  const next = () => {
    setError("");
    if (step === 0 && service === null) return setError(t.booking.needService);
    if (step === 1 && (dateIdx === null || !time)) return setError(t.booking.needDate);
    if (step === 2) return void submit();
    setStep((s) => s + 1);
  };

  const submit = async () => {
    const normalized = normalizePhone(phone);
    if (name.trim().length < 2) return setError(t.booking.needName);
    if (!normalized) return setError(t.booking.needPhone);
    if (!consent) return setError(t.booking.consentRequired);

    setError("");
    setSending(true);
    const payload: BookingRecord = {
      ref: `EWD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 8999)}`,
      service: service === null ? "—" : t.services.items[service].name,
      doctor: doctorName,
      date: selectedDate ? `${selectedDate.d}.${String(selectedDate.m).padStart(2, "0")}` : "—",
      time: time ?? "—",
      name: name.trim(),
      phone: normalized,
      comment: comment.trim(),
      lang,
      createdAt: new Date().toISOString(),
    };

    try {
      // Demo "backend": the record is persisted locally.
      // In production replace this block with a POST to your booking API / CRM.
      const endpoint = (window as unknown as { EWD_API?: string }).EWD_API;
      if (endpoint) {
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        const store = JSON.parse(localStorage.getItem("ewd-bookings") || "[]");
        store.push(payload);
        localStorage.setItem("ewd-bookings", JSON.stringify(store));
        await new Promise((r) => setTimeout(r, 850));
      }
    } catch {
      /* demo mode: never block the user */
    }

    setSending(false);
    setRecord(payload);
  };

  const reset = () => {
    setRecord(null);
    setStep(0);
    setService(null);
    setDateIdx(null);
    setTime(null);
    setName("");
    setPhone("+998 ");
    setComment("");
    setConsent(false);
    setError("");
  };

  const telegramText = record
    ? encodeURIComponent(
        [
          `ESTHETIC WHITE DENTAL · ${t.booking.refLabel}: ${record.ref}`,
          `${t.booking.summaryLabels.service}: ${record.service}`,
          `${t.booking.summaryLabels.doctor}: ${record.doctor}`,
          `${t.booking.summaryLabels.time}: ${record.date} ${record.time}`,
          `${t.booking.summaryLabels.name}: ${record.name}`,
          `${t.booking.summaryLabels.phone}: ${record.phone}`,
        ].join("\n")
      )
    : "";

  const summary = [
    { l: t.booking.summaryLabels.service, v: service === null ? "—" : t.services.items[service].name },
    { l: t.booking.summaryLabels.doctor, v: doctorName },
    {
      l: t.booking.summaryLabels.time,
      v: selectedDate ? `${selectedDate.d}.${String(selectedDate.m).padStart(2, "0")} · ${time ?? "—"}` : "—",
    },
    { l: t.booking.summaryLabels.name, v: name || "—" },
    { l: t.booking.summaryLabels.phone, v: phone.trim() || "—" },
  ];

  return (
    <section
      id="book"
      className="relative w-full max-w-[100vw] overflow-x-clip overflow-y-hidden py-16 sm:py-20 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_45%_at_50%_0%,rgba(20,224,192,0.14),transparent_60%)]" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 aurora rounded-full bg-azure/12 blur-[90px] sm:h-80 sm:w-80" />

      <div className="relative mx-auto min-w-0 max-w-6xl px-4 sm:px-5 lg:px-8">
        <SectionHead kicker={t.booking.kicker} title={t.booking.title} sub={t.booking.sub} dark />

        <div className="mt-8 grid min-w-0 gap-5 sm:mt-14 sm:gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          {/* mount-based animation (not scroll-based) so the wizard is always visible */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="min-w-0"
          >
            <div
              ref={cardRef}
              className="hair w-full max-w-full scroll-mt-28 overflow-hidden rounded-[1.6rem] p-1 sm:rounded-[2.2rem]"
            >
              <div className="relative w-full min-w-0 max-w-full overflow-hidden rounded-[1.4rem] bg-ink/70 p-4 backdrop-blur-xl sm:rounded-[2rem] sm:p-6 md:min-h-[520px] md:p-9">
                <AnimatePresence mode="wait">
                  {record ? (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, ease }}
                      className="relative flex flex-col items-center justify-center py-6 text-center md:min-h-[460px]"
                    >
                      <div className="pointer-events-none absolute inset-x-0 top-6 mx-auto h-40 confetti">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <span
                            key={i}
                            className="absolute h-2 w-2 rounded-sm"
                            style={{
                              left: `${(i * 4.1) % 100}%`,
                              background: ["#14e0c0", "#e9c68b", "#3f8cff", "#8ff5e4"][i % 4],
                              animationDelay: `${(i % 8) * 0.12}s`,
                            }}
                          />
                        ))}
                      </div>
                      <motion.span
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 16 }}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-mint to-azure text-ink shadow-glow sm:h-20 sm:w-20"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-8 w-8 sm:h-10 sm:w-10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.4}
                          strokeLinecap="round"
                        >
                          <motion.path
                            d="M4.5 12.8l4.7 4.7L19.5 7"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.45, duration: 0.6, ease }}
                          />
                        </svg>
                      </motion.span>

                      <h3 className="mt-6 font-display text-[1.6rem] leading-tight text-white sm:text-3xl">
                        {t.booking.successTitle}
                      </h3>
                      <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-white/70 sm:text-[14.5px]">
                        {t.booking.successText.replace("{name}", record.name.split(" ")[0]).replace("{phone}", record.phone)}
                      </p>
                      <p className="mt-4 rounded-full border border-mint/40 bg-mint/10 px-4 py-2 text-[12.5px] font-bold tracking-[0.08em] text-mint">
                        {t.booking.refLabel}: {record.ref}
                      </p>

                      <div className="mt-6 w-full max-w-md space-y-2 rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4 text-left sm:mt-8 sm:rounded-[1.5rem] sm:p-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-mint">{t.booking.summary}</p>
                        {summary.map((s) => (
                          <div key={s.l} className="flex items-center justify-between gap-4 border-b border-white/8 py-2 last:border-0">
                            <span className="text-[12.5px] text-white/60">{s.l}</span>
                            <span className="text-right text-[13.5px] font-semibold text-white">{s.v}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex w-full max-w-md flex-col justify-center gap-2.5 sm:mt-7 sm:flex-row sm:gap-3">
                        <LuxButton
                          href={`https://t.me/share/url?url=${encodeURIComponent(MEDIA.maps)}&text=${telegramText}`}
                          className="w-full px-5 py-3.5 text-[13px] sm:w-auto"
                        >
                          {t.booking.telegramCta}
                        </LuxButton>
                        <LuxButton variant="ghost" className="w-full px-5 py-3.5 text-[13px] sm:w-auto" onClick={reset}>
                          {t.booking.again}
                        </LuxButton>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full min-w-0">
                      {/* stepper — compact on phones, full circles from md up */}
                      <div className="w-full min-w-0">
                        <div className="flex items-center justify-between gap-3 md:hidden">
                          <span className="min-w-0 truncate text-[12.5px] font-bold uppercase tracking-[0.14em] text-white">
                            <span className="text-mint">
                              {step + 1}/{t.booking.steps.length}
                            </span>{" "}
                            · {t.booking.steps[step]}
                          </span>
                          <span className="flex shrink-0 gap-1">
                            {t.booking.steps.map((_, i) => (
                              <span
                                key={i}
                                className={cn(
                                  "h-1.5 rounded-full transition-all duration-500",
                                  i === step ? "w-6 bg-gradient-to-r from-mint to-azure" : "w-2.5 bg-white/20"
                                )}
                              />
                            ))}
                          </span>
                        </div>
                        <div className="hidden items-center gap-3 md:flex">
                          {t.booking.steps.map((s, i) => (
                            <div key={s} className="flex flex-1 items-center gap-3">
                              <button
                                onClick={() => i < step && setStep(i)}
                                disabled={i >= step}
                                aria-label={s}
                                className={cn(
                                  "flex min-h-[44px] flex-1 items-center gap-2.5 rounded-xl py-1.5 text-left transition",
                                  i <= step ? "text-white" : "text-white/55"
                                )}
                              >
                                <span
                                  className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-[13px] font-bold transition-colors",
                                    i < step
                                      ? "border-mint/40 bg-mint text-ink"
                                      : i === step
                                        ? "border-mint/60 bg-mint/15 text-mint"
                                        : "border-white/20"
                                  )}
                                >
                                  {i < step ? <Icon name="check" className="h-4 w-4" /> : i + 1}
                                </span>
                                <span className="text-[12.5px] font-semibold">{s}</span>
                              </button>
                              {i < t.booking.steps.length - 1 && (
                                <span className="relative h-px flex-1 bg-white/15">
                                  <motion.span
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-mint to-azure"
                                    animate={{ width: i < step ? "100%" : "0%" }}
                                    transition={{ duration: 0.5, ease }}
                                  />
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="relative mt-5 w-full min-w-0 sm:mt-8">
                        <AnimatePresence mode="wait">
                          {step === 0 && (
                            <motion.div
                              key="s0"
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -12 }}
                              transition={{ duration: 0.3, ease }}
                              className="w-full min-w-0 space-y-5 sm:space-y-7"
                            >
                              <div>
                                <p className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-mint sm:text-[12px] sm:tracking-[0.2em]">
                                  {t.booking.serviceLabel}
                                </p>
                                {/* phones: scrollable list so the tall form never gets cut off */}
                                <div className="no-scrollbar mt-3.5 grid max-h-[42vh] gap-2 overflow-y-auto overscroll-contain pr-1 sm:max-h-none sm:grid-cols-2 sm:gap-2.5 sm:overflow-visible sm:pr-0">
                                  {t.services.items.map((s, i) => (
                                    <button
                                      key={s.name}
                                      onClick={() => setService(i)}
                                      className={cn(
                                        "flex min-h-[44px] items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition sm:gap-3 sm:px-4 sm:py-3.5",
                                        service === i
                                          ? "border-mint/60 bg-mint/12 text-white"
                                          : "border-white/10 bg-white/[0.03] text-white/75 hover:border-white/25"
                                      )}
                                    >
                                      <Icon
                                        name={s.icon}
                                        className={cn("h-4 w-4 shrink-0 sm:h-5 sm:w-5", service === i ? "text-mint" : "text-white/50")}
                                      />
                                      <span className="flex-1 text-[12.5px] font-semibold leading-snug sm:text-[13.5px]">
                                        {s.name}
                                      </span>
                                      {service === i ? (
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint text-ink">
                                          <Icon name="check" className="h-3 w-3" />
                                        </span>
                                      ) : (
                                        <span className="shrink-0 text-[11px] text-white/55">{s.price}</span>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-mint sm:text-[12px] sm:tracking-[0.2em]">
                                  {t.booking.doctorLabel}
                                </p>
                                <div className="no-scrollbar mt-3.5 flex w-full min-w-0 gap-2.5 overflow-x-auto overscroll-x-contain pb-1 sm:flex-wrap">
                                  {[-1, ...t.doctors.items.map((_, i) => i)].map((id) => (
                                    <button
                                      key={id}
                                      onClick={() => setDoctorId(id)}
                                      className={cn(
                                        "min-h-[44px] shrink-0 whitespace-nowrap rounded-full border px-4 py-2.5 text-[12.5px] font-semibold transition sm:text-[13px]",
                                        doctorId === id
                                          ? "border-mint/60 bg-mint/12 text-white"
                                          : "border-white/15 text-white/70 hover:text-white"
                                      )}
                                    >
                                      {id === -1
                                        ? t.booking.anyDoctor
                                        : t.doctors.items[id].name.replace("Dr. ", "").replace("Д-р ", "")}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {step === 1 && (
                            <motion.div
                              key="s1"
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -12 }}
                              transition={{ duration: 0.3, ease }}
                              className="w-full min-w-0 space-y-5 sm:space-y-7"
                            >
                              <div>
                                <p className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-mint sm:text-[12px] sm:tracking-[0.2em]">
                                  {t.booking.dateLabel}
                                </p>
                                <div className="no-scrollbar mt-3.5 flex w-full min-w-0 snap-x gap-2.5 overflow-x-auto overscroll-x-contain pb-2">
                                  {dates.map((d, i) => (
                                    <button
                                      key={d.key}
                                      onClick={() => {
                                        setDateIdx(i);
                                        setTime(null);
                                      }}
                                      className={cn(
                                        "flex min-h-[72px] min-w-[68px] shrink-0 snap-start flex-col items-center justify-center rounded-2xl border px-2.5 py-2.5 transition sm:min-w-[74px] sm:px-3",
                                        dateIdx === i
                                          ? "border-mint/60 bg-gradient-to-b from-mint/20 to-transparent text-white"
                                          : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25"
                                      )}
                                    >
                                      <span className="text-[10.5px] uppercase tracking-[0.08em] sm:text-[11px]">{d.wd}</span>
                                      <span className="mt-0.5 font-display text-lg text-white sm:text-xl">{d.d}</span>
                                      <span className="text-[10px] text-white/60 sm:text-[10.5px]">
                                        {String(d.m).padStart(2, "0")}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-mint sm:text-[12px] sm:tracking-[0.2em]">
                                  {t.booking.timeLabel}
                                </p>
                                {dateIdx !== null && selectedDate && (
                                  <p className="mt-2 text-[12px] text-white/60">
                                    {selectedDate.d}.{String(selectedDate.m).padStart(2, "0")} · {SLOTS.length - selectedDate.busy.size}{" "}
                                    / {SLOTS.length}
                                  </p>
                                )}
                                <div className="mt-3.5 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-2.5">
                                  {SLOTS.map((s, i) => {
                                    const busy = selectedDate ? selectedDate.busy.has(i) : false;
                                    return (
                                      <button
                                        key={s}
                                        disabled={busy || dateIdx === null}
                                        onClick={() => setTime(s)}
                                        className={cn(
                                          "min-h-[44px] rounded-xl border px-2 py-2.5 text-[13px] font-semibold transition sm:text-[13.5px]",
                                          busy
                                            ? "cursor-not-allowed border-white/10 text-white/35 line-through"
                                            : dateIdx === null
                                              ? "border-white/10 text-white/40"
                                              : time === s
                                                ? "border-mint/60 bg-mint/15 text-white"
                                                : "border-white/15 bg-white/[0.03] text-white/75 hover:border-white/30"
                                        )}
                                      >
                                        {s}
                                      </button>
                                    );
                                  })}
                                </div>
                                {dateIdx !== null && selectedDate && selectedDate.busy.size >= SLOTS.length - 1 && (
                                  <p className="mt-3 text-[12.5px] text-gold">{t.booking.noSlots}</p>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2 text-[11.5px] text-white/65">
                                <span className="rounded-full border border-white/12 px-3 py-1.5">
                                  🦷 {t.services.items[service ?? 0].name}
                                </span>
                                <span className="rounded-full border border-white/12 px-3 py-1.5">
                                  ⏱ {t.services.items[service ?? 0].duration}
                                </span>
                                <span className="rounded-full border border-white/12 px-3 py-1.5">
                                  💎 {t.services.items[service ?? 0].price}
                                </span>
                              </div>
                            </motion.div>
                          )}

                          {step === 2 && (
                            <motion.div
                              key="s2"
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -12 }}
                              transition={{ duration: 0.3, ease }}
                              className="w-full min-w-0 space-y-4 sm:space-y-5"
                            >
                              <label className="block">
                                <span className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-mint sm:text-[12px] sm:tracking-[0.2em]">
                                  {t.booking.nameLabel}
                                </span>
                                <input
                                  type="text"
                                  value={name}
                                  placeholder={t.booking.namePh}
                                  onChange={(e) => setName(e.target.value)}
                                  className="mt-2.5 w-full rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3.5 text-[16px] text-white placeholder-white/40 outline-none transition focus:border-mint/60 focus:bg-white/[0.07] md:text-[15px]"
                                />
                              </label>
                              <label className="block">
                                <span className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-mint sm:text-[12px] sm:tracking-[0.2em]">
                                  {t.booking.phoneLabel}
                                </span>
                                <input
                                  type="tel"
                                  inputMode="tel"
                                  value={phone}
                                  placeholder={t.booking.phonePh}
                                  onChange={(e) => setPhone(e.target.value)}
                                  className="mt-2.5 w-full rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3.5 text-[16px] text-white placeholder-white/40 outline-none transition focus:border-mint/60 focus:bg-white/[0.07] md:text-[15px]"
                                />
                              </label>
                              <label className="block">
                                <span className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-mint sm:text-[12px] sm:tracking-[0.2em]">
                                  {t.booking.commentLabel}
                                </span>
                                <textarea
                                  rows={3}
                                  value={comment}
                                  placeholder={t.booking.commentPh}
                                  onChange={(e) => setComment(e.target.value)}
                                  className="mt-2.5 w-full resize-none rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3.5 text-[16px] text-white placeholder-white/40 outline-none transition focus:border-mint/60 focus:bg-white/[0.07] md:text-[15px]"
                                />
                              </label>

                              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/12 bg-white/[0.03] p-3.5">
                                <input
                                  type="checkbox"
                                  checked={consent}
                                  onChange={(e) => setConsent(e.target.checked)}
                                  className="mt-0.5 h-5 w-5 shrink-0 accent-[#14e0c0]"
                                />
                                <span>
                                  <span className="block text-[12.5px] leading-snug text-white/80">{t.booking.consent}</span>
                                  <span className="mt-1 block text-[11.5px] text-white/60">{t.booking.consentData}</span>
                                </span>
                              </label>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <AnimatePresence>
                        {error && (
                          <motion.p
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            role="alert"
                            className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-200"
                          >
                            {error}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <div className="mt-6 flex flex-col-reverse items-stretch gap-2 sm:mt-7 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <button
                          onClick={() => setStep((s) => Math.max(0, s - 1))}
                          className={cn(
                            "flex min-h-[44px] items-center justify-center gap-2 text-[13.5px] font-semibold text-white/70 transition hover:text-white sm:justify-start",
                            step === 0 && "invisible"
                          )}
                        >
                          <Icon name="arrow" className="h-4 w-4 rotate-180" />
                          {t.booking.back}
                        </button>
                        <LuxButton onClick={next} className="w-full px-7 py-4 text-[14px] sm:w-auto" type="button">
                          {sending ? t.booking.sending : step === 2 ? t.booking.submit : t.booking.next}
                        </LuxButton>
                      </div>
                    </motion.div>
                  )}
                 </AnimatePresence>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease }}
            className="min-w-0"
          >
            <div className="flex h-full min-w-0 flex-col gap-4 sm:gap-5">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4 backdrop-blur sm:rounded-[2rem] sm:p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-mint sm:tracking-[0.22em]">
                  {t.booking.summary}
                </p>
                <div className="mt-3.5 space-y-2.5 sm:mt-4 sm:space-y-3">
                  {summary.map((s) => (
                    <div key={s.l} className="flex items-start justify-between gap-3 border-b border-white/8 pb-3 last:border-0 last:pb-0">
                        <span className="shrink-0 text-[12.5px] text-white/60">{s.l}</span>
                      <motion.span
                        key={s.v}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="min-w-0 break-words text-right text-[13.5px] font-semibold text-white"
                      >
                        {s.v}
                      </motion.span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-mint/12 to-azure/8 p-4 sm:rounded-[2rem] sm:p-6">
                <ul className="space-y-2.5 sm:space-y-3">
                  {t.booking.guarantee.map((g) => (
                    <li key={g} className="flex items-center gap-3 text-[13.5px] text-white/85">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mint/20 text-mint">
                        <Icon name="check" className="h-3.5 w-3.5" />
                      </span>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative hidden overflow-hidden rounded-[1.6rem] border border-white/10 sm:block sm:flex-1 sm:rounded-[2rem]">
                <img
                  src={MEDIA.heroAlt}
                  alt="ESTHETIC WHITE DENTAL clinic"
                  width={1000}
                  height={1200}
                  loading="lazy"
                  decoding="async"
                  className="h-full min-h-[200px] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                <p className="absolute inset-x-5 bottom-5 font-display text-lg text-white/90">{t.testimonials.items[1].name}</p>
                <p className="absolute inset-x-5 bottom-12 max-w-[85%] text-[12px] text-white/70">
                  “{t.testimonials.items[1].text.slice(0, 96)}…”
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
