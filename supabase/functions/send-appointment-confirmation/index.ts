import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("SITE_ORIGIN") ?? "https://azmat-dantel.onrender.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authorization = request.headers.get("Authorization") ?? "";
  const jwt = authorization.replace(/^Bearer\s+/i, "");
  if (!jwt) return json({ error: "Sign-in required" }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!url || !serviceKey || !botToken) return json({ error: "Function secrets are not configured" }, 500);

  const adminClient = createClient(url, serviceKey);
  const { data: userData, error: userError } = await adminClient.auth.getUser(jwt);
  if (userError || !userData.user) return json({ error: "Sign-in required" }, 401);
  const { data: adminRecord } = await adminClient.from("admin_users").select("user_id").eq("user_id", userData.user.id).maybeSingle();
  if (!adminRecord) return json({ error: "Admin access required" }, 403);

  let body: { appointment_id?: string };
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  if (!body.appointment_id) return json({ error: "appointment_id is required" }, 400);

  const { data: appointment, error: appointmentError } = await adminClient
    .from("appointments")
    .select("id,reference,patient_name,service,doctor,appointment_date,appointment_time,language,status,telegram_chat_id")
    .eq("id", body.appointment_id)
    .maybeSingle();
  if (appointmentError || !appointment) return json({ error: "Appointment not found" }, 404);
  if (appointment.status !== "confirmed") return json({ error: "Appointment must be confirmed first" }, 409);
  if (!appointment.telegram_chat_id) return json({ error: "Patient has not connected the Telegram bot" }, 409);

  const messages: Record<string, string> = {
    uz: `Assalomu alaykum, ${appointment.patient_name}! AZAMAT DENTAL navbatingiz tasdiqlandi.\n\nXizmat: ${appointment.service}\nShifokor: ${appointment.doctor}\nSana: ${appointment.appointment_date}\nVaqt: ${String(appointment.appointment_time).slice(0, 5)}\nNavbat raqami: ${appointment.reference}\n\nSavollaringiz bo‘lsa, klinika bilan bog‘laning.`,
    ru: `Здравствуйте, ${appointment.patient_name}! Ваша запись в AZAMAT DENTAL подтверждена.\n\nУслуга: ${appointment.service}\nВрач: ${appointment.doctor}\nДата: ${appointment.appointment_date}\nВремя: ${String(appointment.appointment_time).slice(0, 5)}\nНомер записи: ${appointment.reference}\n\nЕсли у вас есть вопросы, свяжитесь с клиникой.`,
    en: `Hello, ${appointment.patient_name}! Your AZAMAT DENTAL appointment is confirmed.\n\nService: ${appointment.service}\nDoctor: ${appointment.doctor}\nDate: ${appointment.appointment_date}\nTime: ${String(appointment.appointment_time).slice(0, 5)}\nReference: ${appointment.reference}\n\nPlease contact the clinic if you have any questions.`,
  };

  const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: appointment.telegram_chat_id, text: messages[appointment.language] ?? messages.uz }),
  });
  const telegramResult = await telegramResponse.json();
  if (!telegramResponse.ok || !telegramResult.ok) return json({ error: "Telegram could not deliver the message", details: telegramResult.description ?? "Unknown error" }, 502);

  await adminClient.from("appointments").update({ telegram_sent_at: new Date().toISOString() }).eq("id", appointment.id);
  return json({ ok: true });

  function json(value: unknown, status = 200) {
    return new Response(JSON.stringify(value), { status, headers: { ...corsHeaders, "content-type": "application/json" } });
  }
});
