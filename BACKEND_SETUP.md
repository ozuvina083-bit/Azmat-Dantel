# Azamat Dental — ব্যাকএন্ড সেটআপ

## এখন পর্যন্ত সম্পন্ন

- হোমপেজের বিদ্যমান ডিজাইন অক্ষত রেখে `/admin` ড্যাশবোর্ডের কোড যোগ করা হয়েছে।
- Supabase project `Azamat-Dental` তৈরি হয়েছে (`ap-south-1`, Mumbai; project ref `vqygptrtjqqpeftaterz`)। তৈরি করার তালিকাভুক্ত মূল্য ছিল **$0/month**।
- Database migration প্রয়োগ হয়েছে। `site_content`, `appointments`, `admin_users`, slot RPC, Storage bucket ও RLS policy তৈরি হয়েছে।
- দুই Telegram Edge Function deploy হয়েছে: `send-appointment-confirmation` ও `telegram-webhook`।
- Supabase URL ও public publishable key এই sandbox-এর ignored `.env.local`-এ সেট; repository-তে key commit করা হয়নি।
- Slot RPC পরীক্ষা হয়েছে; public role দিয়ে appointment table পড়ে রোগীর তথ্য পাওয়া যায়নি। TypeScript ও production build-ও পাস করেছে।

## এখনো বাকি

1. কোন Auth account-কে admin করা হবে তা নির্ধারণ ও `admin_users`-এ যুক্ত করা।
2. Clinic Telegram bot-এর username ও token সেট করা; এই গোপন token চ্যাটে পাঠাবেন না। Bot token ছাড়া Telegram function বার্তা পাঠাতে পারবে না।
3. Frontend source code hosting-এ প্রকাশ এবং production environment variables বসানো। এই পরিবর্তন না গেলে বর্তমান Render website পুরনো code-ই দেখাবে।

## ১. Admin account অনুমোদন

1. Supabase Dashboard → **Authentication → Users** থেকে clinic admin-এর জন্য user তৈরি করুন।
2. সেই user-এর UUID কপি করুন।
3. SQL Editor-এ চালান:

```sql
insert into public.admin_users (user_id)
values ('<ADMIN_USER_UUID>')
on conflict (user_id) do nothing;
```

তারপর deployed site-এ `/admin` খুলে সেই Auth account দিয়ে sign in করুন। `admin_users`-এ না থাকলে user ড্যাশবোর্ডে ঢুকতে পারবে না।

## ২. Telegram bot

1. Telegram-এ **BotFather** দিয়ে clinic bot তৈরি করুন; bot **username** ও **token** পাবেন।
2. Bot username Render-এর `VITE_TELEGRAM_BOT_USERNAME` environment variable-এ দিন (শুধু username, `@` ছাড়া)।
3. Supabase Dashboard → Project Settings / Edge Functions-এর Secrets অংশে এই মানগুলো যোগ করুন:
   - `TELEGRAM_BOT_TOKEN` — BotFather থেকে পাওয়া token
   - `TELEGRAM_WEBHOOK_SECRET` — নিজে তৈরি করা দীর্ঘ random value
   - `SITE_ORIGIN` — `https://azmat-dantel.onrender.com`
4. Telegram bot webhook-কে এই endpoint-এ নির্দেশ দিন:
   `https://vqygptrtjqqpeftaterz.supabase.co/functions/v1/telegram-webhook`
   Telegram-এর `secret_token` হিসেবে একই `TELEGRAM_WEBHOOK_SECRET` ব্যবহার করতে হবে।
5. রোগী বুকিংয়ের পরে bot-এর private Start link চাপবে। এরপর admin **“Tasdiqlash + Telegram”** চাপলে আগে থেকে লেখা confirmation message পাঠানো হবে। রোগী bot Start না করলে bot তাকে আগে থেকে message পাঠাতে পারে না।

**Bot token কখনো browser code, `.env.local`, GitHub বা chat-এ দেবেন না।** এটি Supabase Edge Function secret হিসেবেই রাখুন।

## ৩. Render-এ frontend চালু

Render service-এর Environment settings-এ যোগ করুন:

```dotenv
VITE_SUPABASE_URL=https://vqygptrtjqqpeftaterz.supabase.co
VITE_SUPABASE_ANON_KEY=<Supabase publishable key>
VITE_TELEGRAM_BOT_USERNAME=<clinic_bot_username>
```

`VITE_SUPABASE_ANON_KEY`-এ Supabase-এর **publishable key** ব্যবহার করুন; `service_role` key নয়। তারপর নতুন frontend code deploy করুন এবং Render-এ SPA rewrite দিন, যেন `/admin` path `index.html`-এ যায়।

## ৪. স্থানীয় পরীক্ষা

এই repository-তে:

```bash
npm ci
npm run dev
```

লোকাল অ্যাডমিন প্যানেল: `http://localhost:5173/admin`। `.env.example` কপি করে `.env.local` বানালে project URL ও publishable key দিন।

## নিরাপত্তা ও আচরণ

- Public client কেবল ব্যস্ত সময়ের slot RPC দেখে; রোগীর নাম, ফোন ও মন্তব্য public পড়তে পারে না।
- একই দিন-সময়ের active appointment ডেটাবেস unique index দিয়ে একবারই অনুমোদিত হয়।
- Dashboard ও Storage write কেবল `admin_users` allowlist-এ থাকা Auth account-কে দেয়।
- Doctor image/certificate Storage-এ public-viewable, কিন্তু upload/update/delete শুধু admin-এর জন্য; সর্বোচ্চ 8 MB, JPG/PNG/WebP/PDF।
- Function deploy হয়েছে, কিন্তু Telegram token/webhook secret এবং bot username যোগ না করা পর্যন্ত Telegram সংযোগ চালু নয়।
