import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { DICT, type Lang } from "@/i18n";
import { getSupabaseSetupMessage, supabase } from "@/lib/supabase";
import { Icon } from "@/components/ui";

type Doctor = { name: string; role: string; exp: string; tags: string[]; image?: string; certificate?: string };
type Service = { icon: string; name: string; desc: string; price: string; tag: string; duration: string; long: string };
type Plan = { name: string; price: string; unit: string; note: string; features: string[]; cta: string; badge: string };
type Content = { doctors: Doctor[]; services: Service[]; plans: Plan[] };
type Appointment = { id: string; reference: string; service: string; doctor: string; appointment_date: string; appointment_time: string; patient_name: string; phone: string; comment: string; status: string; telegram_chat_id: string | null; created_at: string };
type Tab = "overview" | "appointments" | "doctors" | "services";
const LANGUAGES: { code: Lang; label: string }[] = [{ code: "uz", label: "O‘zbek" }, { code: "ru", label: "Русский" }, { code: "en", label: "English" }];

function defaultContent(lang: Lang): Content {
  return {
    doctors: DICT[lang].doctors.items.map((d) => ({ ...d, image: undefined, certificate: "" })),
    services: DICT[lang].services.items.map((s) => ({ ...s })),
    plans: DICT[lang].pricing.plans.map((p) => ({ ...p, features: [...p.features] })),
  };
}

export function Admin() {
  const [session, setSession] = useState<any>(null);
  const [adminAllowed, setAdminAllowed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [lang, setLang] = useState<Lang>("uz");
  const [content, setContent] = useState<Content>(() => defaultContent("uz"));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session) { setAdminAllowed(null); return; }
    let live = true;
    supabase.rpc("is_admin").then(({ data, error }) => {
      if (live) setAdminAllowed(!error && data === true);
    });
    return () => { live = false; };
  }, [session]);

  const loadContent = useCallback(async () => {
    if (!supabase || !session) return;
    const { data, error } = await supabase.from("site_content").select("value").eq("id", `homepage_${lang}`).maybeSingle();
    if (error) { setNotice(`Ma’lumotlarni yuklab bo‘lmadi: ${error.message}`); return; }
    const base = defaultContent(lang);
    const saved = (data?.value ?? {}) as Partial<Content>;
    setContent({ doctors: saved.doctors ?? base.doctors, services: saved.services ?? base.services, plans: saved.plans ?? base.plans });
  }, [lang, session]);

  const loadAppointments = useCallback(async () => {
    if (!supabase || !session) return;
    const { data, error } = await supabase.from("appointments").select("id,reference,service,doctor,appointment_date,appointment_time,patient_name,phone,comment,status,telegram_chat_id,created_at").order("created_at", { ascending: false }).limit(200);
    if (error) { setNotice(`Navbatlarni yuklab bo‘lmadi: ${error.message}`); return; }
    setAppointments((data ?? []) as Appointment[]);
  }, [session]);

  useEffect(() => { void loadContent(); }, [loadContent]);
  useEffect(() => { void loadAppointments(); }, [loadAppointments]);

  const counts = useMemo(() => ({ pending: appointments.filter((a) => a.status === "pending").length, confirmed: appointments.filter((a) => a.status === "confirmed").length, doctors: content.doctors.length, services: content.services.length }), [appointments, content]);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError(error.message);
    setBusy(false);
  };

  const saveContent = async () => {
    if (!supabase || !session) return;
    setBusy(true); setNotice("");
    const { error } = await supabase.from("site_content").upsert({ id: `homepage_${lang}`, value: content, updated_by: session.user.id, updated_at: new Date().toISOString() });
    setBusy(false);
    setNotice(error ? `Saqlashda xatolik: ${error.message}` : "Sahifa ma’lumotlari saqlandi va saytga uzatildi.");
    window.dispatchEvent(new Event("azamat:content-updated"));
  };

  const setAppointmentStatus = async (appointment: Appointment, status: "confirmed" | "cancelled" | "completed") => {
    if (!supabase) return;
    setBusy(true); setNotice("");
    const { error } = await supabase.from("appointments").update({ status }).eq("id", appointment.id);
    setBusy(false);
    if (error) { setNotice(`Yangilashda xatolik: ${error.message}`); return; }
    if (status === "confirmed" && appointment.telegram_chat_id) {
      const { error: telegramError } = await supabase.functions.invoke("send-appointment-confirmation", { body: { appointment_id: appointment.id } });
      setNotice(telegramError ? `Navbat tasdiqlandi, lekin Telegram xabari yuborilmadi: ${telegramError.message}` : "Navbat tasdiqlandi va Telegram tasdiq xabari yuborildi.");
    } else if (status === "confirmed") {
      setNotice("Navbat tasdiqlandi. Bemor Telegram botiga ulanmagan; ulanishdan so‘ng xabar tugmasi chiqadi.");
    } else setNotice("Navbat holati yangilandi.");
    await loadAppointments();
  };

  const sendTelegram = async (appointment: Appointment) => {
    if (!supabase || !appointment.telegram_chat_id) return;
    setBusy(true); setNotice("");
    const { error } = await supabase.functions.invoke("send-appointment-confirmation", { body: { appointment_id: appointment.id } });
    setBusy(false);
    setNotice(error ? `Telegram xabari yuborilmadi: ${error.message}` : "Tasdiq xabari Telegram orqali yuborildi.");
    await loadAppointments();
  };

  const uploadDoctorFile = async (file: File, index: number, field: "image" | "certificate") => {
    if (!supabase || !session) return;
    if (file.size > 8 * 1024 * 1024) { setNotice("Fayl 8 MB dan kichik bo‘lishi kerak."); return; }
    const path = `${field}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    setBusy(true);
    const { data, error } = await supabase.storage.from("doctor-assets").upload(path, file, { upsert: false });
    if (error) { setNotice(`Yuklashda xatolik: ${error.message}`); setBusy(false); return; }
    const { data: urlData } = supabase.storage.from("doctor-assets").getPublicUrl(data.path);
    setContent((current) => ({ ...current, doctors: current.doctors.map((doctor, i) => i === index ? { ...doctor, [field]: urlData.publicUrl } : doctor) }));
    setBusy(false); setNotice("Fayl yuklandi. O‘zgarishlarni saqlashni unutmang.");
  };

  const filtered = appointments.filter((a) => `${a.patient_name} ${a.phone} ${a.reference} ${a.service}`.toLowerCase().includes(search.toLowerCase()));

  if (!supabase) return <SetupScreen />;
  if (!session) return <LoginScreen email={email} setEmail={setEmail} password={password} setPassword={setPassword} busy={busy} error={loginError} onSubmit={signIn} />;
  if (adminAllowed === null) return <div className="flex min-h-screen items-center justify-center bg-[#07101d] text-sm text-white/60">Tekshirilmoqda…</div>;
  if (!adminAllowed) return <AccessDenied onSignOut={() => void supabase?.auth.signOut()} />;

  const nav: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Bosh sahifa", icon: "lab" }, { id: "appointments", label: "Navbatlar", icon: "clock" },
    { id: "doctors", label: "Shifokorlar", icon: "medal" }, { id: "services", label: "Xizmatlar va narxlar", icon: "check" },
  ];

  return <div className="min-h-screen bg-[#07101d] text-[#e9eef5]">
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-white/10 bg-[#091321] p-5 lg:flex lg:flex-col">
      <a href="/" className="mb-10 flex items-center gap-3"><img src="/azamat-dental-logo.png" className="h-10 w-10 rounded-xl bg-white object-contain"/><span><b className="block font-display tracking-widest">AZAMAT DENTAL</b><small className="text-mint">ADMIN PANEL</small></span></a>
      <nav className="space-y-2">{nav.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${tab === item.id ? "bg-mint/15 text-mint" : "text-white/60 hover:bg-white/5 hover:text-white"}`}><Icon name={item.icon} className="h-4 w-4"/>{item.label}</button>)}</nav>
      <div className="mt-auto space-y-3"><a href="/" className="block rounded-xl border border-white/10 px-4 py-3 text-sm text-white/65 hover:text-white">← Saytni ko‘rish</a><button onClick={() => void supabase?.auth.signOut()} className="w-full rounded-xl border border-white/10 px-4 py-3 text-left text-sm text-white/65 hover:text-white">Chiqish</button></div>
    </aside>
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:ml-64 lg:px-10 lg:pt-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5"><div><p className="text-xs uppercase tracking-[.22em] text-mint">Klinika boshqaruvi</p><h1 className="mt-1 font-display text-2xl sm:text-3xl">{nav.find((n) => n.id === tab)?.label}</h1></div><div className="flex items-center gap-2"><select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm">{LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}</select><button onClick={() => void supabase?.auth.signOut()} className="rounded-xl border border-white/15 px-3 py-2 text-sm lg:hidden">Chiqish</button></div></header>
      {notice && <div role="status" className="mt-5 rounded-xl border border-mint/25 bg-mint/10 px-4 py-3 text-sm text-mint">{notice}</div>}
      <div className="mt-6 lg:hidden"><div className="grid grid-cols-2 gap-2">{nav.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={`rounded-xl px-3 py-3 text-sm ${tab === item.id ? "bg-mint text-ink" : "bg-white/5 text-white/70"}`}>{item.label}</button>)}</div></div>
      {tab === "overview" && <section className="mt-7"><p className="max-w-2xl text-sm leading-6 text-white/60">Sayt dizayni o‘zgarmaydi. Bu paneldan navbatlarni boshqaring va bosh sahifada ko‘rinadigan shifokorlar, xizmatlar hamda narxlarni yangilang.</p><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Kutilmoqda", counts.pending], ["Tasdiqlangan", counts.confirmed], ["Shifokorlar", counts.doctors], ["Xizmatlar", counts.services]].map(([label, count]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><p className="text-sm text-white/50">{label}</p><p className="mt-2 font-display text-3xl text-white">{count}</p></div>)}</div><div className="mt-6 rounded-2xl border border-mint/20 bg-mint/[.06] p-5"><h2 className="font-semibold">Navbatlar holati</h2><p className="mt-2 text-sm leading-6 text-white/60">Vaqtni tanlashda bazadagi band navbatlar esas olinadi. Ikki bemor bir xil vaqtni egallamasligi uchun ma’lumotlar bazasida noyob vaqt cheklovi mavjud.</p></div></section>}
      {tab === "appointments" && <section className="mt-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Bemor navbatlari</h2><p className="mt-1 text-sm text-white/50">So‘nggi 200 ta yozuv</p></div><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ism, telefon yoki ID bo‘yicha qidirish" className="w-full max-w-sm rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none focus:border-mint/50"/></div><div className="mt-5 space-y-3">{filtered.length === 0 ? <Empty text="Hozircha navbatlar yo‘q."/> : filtered.map((a) => <article key={a.id} className="rounded-2xl border border-white/10 bg-white/[.035] p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><strong>{a.patient_name}</strong><span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/55">{a.reference}</span><span className={`rounded-full px-2.5 py-1 text-[11px] ${a.status === "confirmed" ? "bg-mint/15 text-mint" : a.status === "cancelled" ? "bg-red-400/10 text-red-300" : "bg-amber-400/10 text-amber-200"}`}>{a.status}</span></div><p className="mt-2 text-sm text-white/65">{a.service} · {a.doctor} · {a.appointment_date} · {String(a.appointment_time).slice(0,5)}</p><a className="mt-1 inline-block text-sm text-mint" href={`tel:${a.phone}`}>{a.phone}</a>{a.comment && <p className="mt-2 text-sm text-white/50">{a.comment}</p>}<p className="mt-2 text-xs text-white/40">Telegram: {a.telegram_chat_id ? "ulangan" : "hali ulanmagan"}</p></div><div className="flex flex-wrap gap-2">{a.status === "pending" && <button disabled={busy} onClick={() => void setAppointmentStatus(a,"confirmed")} className="rounded-xl bg-mint px-3 py-2 text-xs font-bold text-ink disabled:opacity-50">{a.telegram_chat_id ? "Tasdiqlash + Telegram" : "Tasdiqlash"}</button>}{a.status === "confirmed" && a.telegram_chat_id && <button disabled={busy} onClick={() => void sendTelegram(a)} className="rounded-xl border border-mint/30 px-3 py-2 text-xs text-mint disabled:opacity-50">Telegramga yuborish</button>}{a.status !== "cancelled" && <button disabled={busy} onClick={() => void setAppointmentStatus(a,"cancelled")} className="rounded-xl border border-white/15 px-3 py-2 text-xs text-white/70">Bekor qilish</button>}{a.status === "confirmed" && <button disabled={busy} onClick={() => void setAppointmentStatus(a,"completed")} className="rounded-xl border border-white/15 px-3 py-2 text-xs text-white/70">Yakunlandi</button>}</div></div></article>)}</div></section>}
      {tab === "doctors" && <section className="mt-7"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-semibold">Shifokorlar va malaka</h2><p className="mt-1 text-sm text-white/50">Profil ma’lumotlari hamda rasm/sertifikatlar.</p></div><button onClick={() => setContent((c) => ({ ...c, doctors: [...c.doctors, { name: "Yangi shifokor", role: "Mutaxassis", exp: "0", tags: [], image: "", certificate: "" }] }))} className="rounded-xl border border-mint/30 px-4 py-2.5 text-sm text-mint">+ Shifokor qo‘shish</button></div><div className="mt-5 space-y-4">{content.doctors.map((d,i) => <article key={i} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[.035] p-4 md:grid-cols-[120px_1fr]"><div className="flex flex-col gap-2"><img src={d.image || "/azamat-dental-logo.png"} className="h-28 w-full rounded-xl bg-white/10 object-cover" alt="Doctor portrait"/><label className="cursor-pointer rounded-lg border border-white/15 px-2 py-2 text-center text-xs text-white/70">Rasm yuklash<input hidden type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && void uploadDoctorFile(e.target.files[0],i,"image")}/></label><label className="cursor-pointer rounded-lg border border-white/15 px-2 py-2 text-center text-xs text-white/70">Sertifikat yuklash<input hidden type="file" accept="image/*,application/pdf" onChange={(e) => e.target.files?.[0] && void uploadDoctorFile(e.target.files[0],i,"certificate")}/></label></div><div className="grid gap-3 sm:grid-cols-2"><Field label="Ism" value={d.name} onChange={(v) => editDoctor(setContent,i,"name",v)}/><Field label="Lavozim / yo‘nalish" value={d.role} onChange={(v) => editDoctor(setContent,i,"role",v)}/><Field label="Tajriba (yil)" value={d.exp} onChange={(v) => editDoctor(setContent,i,"exp",v)}/><Field label="Rasm URL" value={d.image || ""} onChange={(v) => editDoctor(setContent,i,"image",v)}/><div className="sm:col-span-2"><Field label="Sertifikat va mutaxassisliklar (vergul bilan)" value={d.tags.join(", ")} onChange={(v) => setContent((c) => ({...c, doctors:c.doctors.map((x,j)=>j===i?{...x,tags:v.split(",").map((s)=>s.trim()).filter(Boolean)}:x)}))}/></div>{d.certificate && <a href={d.certificate} target="_blank" rel="noreferrer" className="text-xs text-mint">Sertifikatni ochish ↗</a>}<button onClick={() => setContent((c) => ({ ...c, doctors: c.doctors.filter((_,j) => j !== i) }))} className="justify-self-end text-xs text-red-300">O‘chirish</button></div></article>)}</div><SaveButton busy={busy} onClick={() => void saveContent()}/></section>}
      {tab === "services" && <section className="mt-7"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-semibold">Xizmatlar va narxlar</h2><p className="mt-1 text-sm text-white/50">Saytdagi xizmat kartalari hamda narxlarni tahrirlang.</p></div><button onClick={() => setContent((c) => ({ ...c, services: [...c.services, { icon: "therapy", name: "Yangi xizmat", desc: "", price: "", tag: "", duration: "", long: "" }] }))} className="rounded-xl border border-mint/30 px-4 py-2.5 text-sm text-mint">+ Xizmat qo‘shish</button></div><div className="mt-5 grid gap-4 xl:grid-cols-2">{content.services.map((s,i) => <article key={i} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-4 sm:grid-cols-2"><Field label="Xizmat nomi" value={s.name} onChange={(v)=>editService(setContent,i,"name",v)}/><Field label="Narxi" value={s.price} onChange={(v)=>editService(setContent,i,"price",v)}/><Field label="Davomiyligi" value={s.duration} onChange={(v)=>editService(setContent,i,"duration",v)}/><Field label="Tavsiya belgisi" value={s.tag} onChange={(v)=>editService(setContent,i,"tag",v)}/><div className="sm:col-span-2"><Field label="Qisqa ma’lumot" value={s.desc} onChange={(v)=>editService(setContent,i,"desc",v)}/></div><div className="sm:col-span-2"><Field label="Batafsil ma’lumot" value={s.long} onChange={(v)=>editService(setContent,i,"long",v)}/></div><button onClick={() => setContent((c) => ({ ...c, services: c.services.filter((_,j)=>j!==i) }))} className="justify-self-end text-xs text-red-300">O‘chirish</button></article>)}</div><div className="mt-8"><h3 className="text-lg font-semibold">Narxlar sahifasidagi paketlar</h3><div className="mt-4 grid gap-3 xl:grid-cols-2">{content.plans.map((p,i)=><article key={i} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-4 sm:grid-cols-2"><Field label="Paket nomi" value={p.name} onChange={(v)=>setContent(c=>({...c,plans:c.plans.map((x,j)=>j===i?{...x,name:v}:x)}))}/><Field label="Narxi" value={p.price} onChange={(v)=>setContent(c=>({...c,plans:c.plans.map((x,j)=>j===i?{...x,price:v}:x)}))}/><Field label="Tavsif" value={p.note} onChange={(v)=>setContent(c=>({...c,plans:c.plans.map((x,j)=>j===i?{...x,note:v}:x)}))}/><Field label="Imtiyozlar (vergul bilan)" value={p.features.join(", ")} onChange={(v)=>setContent(c=>({...c,plans:c.plans.map((x,j)=>j===i?{...x,features:v.split(",").map(y=>y.trim()).filter(Boolean)}:x)}))}/></article>)}</div></div><SaveButton busy={busy} onClick={() => void saveContent()}/></section>}
    </main>
  </div>;
}

function editDoctor(setContent: React.Dispatch<React.SetStateAction<Content>>, index: number, key: keyof Doctor, value: string) { setContent((c) => ({ ...c, doctors: c.doctors.map((d,i) => i === index ? { ...d, [key]: value } : d) })); }
function editService(setContent: React.Dispatch<React.SetStateAction<Content>>, index: number, key: keyof Service, value: string) { setContent((c) => ({ ...c, services: c.services.map((d,i) => i === index ? { ...d, [key]: value } : d) })); }
function Field({ label, value, onChange }: { label: string; value: string; onChange: (value:string)=>void }) { return <label className="block text-xs text-white/55">{label}<input value={value} onChange={(e)=>onChange(e.target.value)} className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#07101d] px-3 py-2.5 text-sm text-white outline-none focus:border-mint/50"/></label>; }
function SaveButton({busy,onClick}:{busy:boolean;onClick:()=>void}) { return <button disabled={busy} onClick={onClick} className="mt-6 rounded-xl bg-gradient-to-r from-mint to-azure px-5 py-3 text-sm font-bold text-ink disabled:opacity-50">{busy?"Saqlanmoqda…":"O‘zgarishlarni saqlash"}</button>; }
function Empty({text}:{text:string}) { return <div className="rounded-2xl border border-dashed border-white/15 px-5 py-12 text-center text-sm text-white/45">{text}</div>; }
function AccessDenied({onSignOut}:{onSignOut:()=>void}) { return <div className="flex min-h-screen items-center justify-center bg-[#07101d] px-4 text-white"><div className="max-w-md rounded-3xl border border-white/10 bg-white/[.04] p-8"><h1 className="font-display text-2xl">Kirishga ruxsat yo‘q</h1><p className="mt-3 text-sm leading-6 text-white/60">Ushbu hisob <code className="text-mint">admin_users</code> ro‘yxatiga qo‘shilmagan. Supabase loyiha egasiga murojaat qiling.</p><button onClick={onSignOut} className="mt-5 rounded-xl border border-white/15 px-4 py-2.5 text-sm">Chiqish</button></div></div>; }
function SetupScreen() { return <div className="flex min-h-screen items-center justify-center bg-[#07101d] px-4 text-white"><div className="max-w-xl rounded-3xl border border-white/10 bg-white/[.04] p-7 sm:p-10"><a href="/" className="text-sm text-mint">← Saytga qaytish</a><p className="mt-7 text-xs uppercase tracking-[.2em] text-mint">Admin · Supabase</p><h1 className="mt-3 font-display text-3xl">Sozlash kerak</h1><p className="mt-4 text-sm leading-6 text-white/65">{getSupabaseSetupMessage()}</p><ol className="mt-5 list-decimal space-y-2 pl-5 text-sm leading-6 text-white/65"><li>Supabase’da loyiha yarating va loyiha URL’i hamda public anon key’i oling.</li><li>Faylni <code className="text-mint">.env.example</code> dan <code className="text-mint">.env.local</code> ga ko‘chiring va qiymatlarni kiriting.</li><li><code className="text-mint">supabase/migrations/202610070001_initial_schema.sql</code> migratsiyasini ishga tushiring.</li><li>Supabase Authentication’da admin foydalanuvchisini yarating, keyin dashboard’ga kiring: <code className="text-mint">/admin</code>.</li></ol></div></div>; }
function LoginScreen({email,setEmail,password,setPassword,busy,error,onSubmit}:{email:string;setEmail:(v:string)=>void;password:string;setPassword:(v:string)=>void;busy:boolean;error:string;onSubmit:(e:FormEvent)=>void}) { return <div className="flex min-h-screen items-center justify-center bg-[#07101d] px-4 text-white"><form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[.04] p-7 sm:p-9"><a href="/" className="text-sm text-mint">← Saytga qaytish</a><p className="mt-7 text-xs uppercase tracking-[.2em] text-mint">AZAMAT DENTAL</p><h1 className="mt-3 font-display text-3xl">Admin kirish</h1><label className="mt-7 block text-sm text-white/65">Email<input type="email" autoComplete="username" required value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#07101d] px-4 py-3 text-white outline-none focus:border-mint/50"/></label><label className="mt-4 block text-sm text-white/65">Parol<input type="password" autoComplete="current-password" required value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#07101d] px-4 py-3 text-white outline-none focus:border-mint/50"/></label>{error&&<p className="mt-4 text-sm text-red-300">{error}</p>}<button disabled={busy} className="mt-6 w-full rounded-xl bg-gradient-to-r from-mint to-azure px-4 py-3 font-bold text-ink disabled:opacity-50">{busy?"Tekshirilmoqda…":"Kirish"}</button></form></div>; }
