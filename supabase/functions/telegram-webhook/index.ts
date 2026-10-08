import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("not found", { status: 404 });
  const secret = Deno.env.get("TELEGRAM_WEBHOOK_SECRET");
  if (!secret || request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== secret) return new Response("unauthorized", { status: 401 });

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!url || !serviceKey || !botToken) return new Response("server not configured", { status: 500 });

  const update = await request.json();
  const message = update?.message;
  const chatId = message?.chat?.id;
  const text = typeof message?.text === "string" ? message.text.trim() : "";
  const match = text.match(/^\/start(?:\s+([A-Za-z0-9_-]{20,64}))?/);
  if (!chatId || !match) return new Response("ok", { status: 200 });

  const client = createClient(url, serviceKey);
  const token = match[1];
  let reply = "Assalomu alaykum! Navbatingizni Telegram bilan ulash uchun saytdagi shaxsiy ulanish havolasidan foydalaning.";
  if (token) {
    const { data: appointment } = await client.from("appointments").select("id,patient_name").eq("telegram_link_token", token).in("status", ["pending", "confirmed"]).maybeSingle();
    if (appointment) {
      const { error } = await client.from("appointments").update({ telegram_chat_id: String(chatId), telegram_connected_at: new Date().toISOString(), telegram_link_token: null }).eq("id", appointment.id).eq("telegram_link_token", token).in("status", ["pending", "confirmed"]);
      reply = error ? "Ulanish amalga oshmadi. Saytdagi havolani yana ochib ko‘ring." : `Rahmat, ${appointment.patient_name}! Telegram ushbu navbatga ulangan. Admin tasdiqlagach xabar yuboriladi.`;
    } else {
      reply = "Ulanish havolasi noto‘g‘ri yoki muddati tugagan. Iltimos, saytdagi havoladan qayta foydalaning.";
    }
  }

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: reply }),
  });
  return new Response("ok", { status: 200 });
});
