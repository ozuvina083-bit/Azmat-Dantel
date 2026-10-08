# Azamat Dental — ব্যাকএন্ড সেটআপ

## এখন পর্যন্ত সম্পন্ন

- হোমপেজের বিদ্যমান ডিজাইন অক্ষত রেখে `/admin` ড্যাশবোর্ডের কোড যোগ করা হয়েছে।
- Supabase project `Azamat-Dental` তৈরি হয়েছে (`ap-south-1`, Mumbai; project ref `vqygptrtjqqpeftaterz`)। তৈরির তালিকাভুক্ত মূল্য ছিল **$0/month**।
- Database schema, appointments, dynamic homepage content, doctor asset Storage, slot RPC এবং RLS policy deploy হয়েছে।
- Supabase owner-এর test account Auth-এ verified এবং `admin_users` allowlist-এ যুক্ত।
- Telegram confirmation ও webhook Edge Function deploy হয়েছে; bot token/username ও webhook secret এখনো বাকি।
- TypeScript ও production build পাস করেছে। Public slot RPC কাজ করেছে; anon role দিয়ে patient name/phone পড়া denied হয়েছে।
- Admin login-এ password recovery ও নতুন password সেট করার form যোগ হয়েছে; account-এর জন্য recovery email request পাঠানো হয়েছে।
- Code Pull Request #1-এ আছে; এখনো merge বা production publish করা হয়নি।

## বাকি কাজ

1. Password recovery email-এর link খুলে নতুন password সেট করুন; তারপর temporary preview-তে sign in করে `/admin` পরীক্ষা করুন।
2. Telegram-এর BotFather bot তৈরি করে public username দিন; bot token ও webhook secret Supabase Edge Function Secrets-এ রাখুন। Token chat বা GitHub-এ দেবেন না।
3. Pull Request merge ও Render environment variables সেট করার আগে production publish অনুমোদন নিন/দিন। Current Render site ততক্ষণ পুরনো code-ই দেখাবে।
4. QA শেষ হলে client-এর Supabase Auth user তৈরি করে তার UUID `admin_users`-এ যোগ করুন। Client access নিশ্চিত হলে test-admin-কে সরাতে চাইলে তার row-ও delete করুন।

## ১. Client admin handover

Test account ইতিমধ্যে allowlist-এ আছে। Client-এর জন্য পরে:

1. Supabase Dashboard → **Authentication → Users** থেকে client-এর Auth account তৈরি/invite করুন।
2. ওই account-এর UUID নিন।
3. SQL Editor-এ চালান:

```sql
insert into public.admin_users (user_id)
values ('<CLIENT_ADMIN_USER_UUID>')
on conflict (user_id) do nothing;
```

Client sign-in ও access যাচাই হয়ে গেলে test account access তুলে নিতে চাইলে:

```sql
delete from public.admin_users
where user_id = '<TEST_ADMIN_USER_UUID>';
```

`admin_users` membership client-side app-ээс өөрөө যোগ করা যায় না; Supabase owner-ই manage করবে।

## ২. Telegram bot

1. Telegram-এ **BotFather** দিয়ে clinic bot তৈরি করুন; bot **username** ও **token** পাবেন।
2. Bot username Render-এর `VITE_TELEGRAM_BOT_USERNAME` environment variable-এ দিন (শুধু username, `@` ছাড়া)।
3. Supabase Dashboard → Project Settings / Edge Functions-এর Secrets অংশে যোগ করুন:
   - `TELEGRAM_BOT_TOKEN` — BotFather থেকে পাওয়া token
   - `TELEGRAM_WEBHOOK_SECRET` — দীর্ঘ random value
   - `SITE_ORIGIN` — `https://azmat-dantel.onrender.com`
4. Telegram webhook endpoint:
   `https://vqygptrtjqqpeftaterz.supabase.co/functions/v1/telegram-webhook`
   Telegram-এর `secret_token` হিসেবে একই `TELEGRAM_WEBHOOK_SECRET` ব্যবহার করুন।
5. রোগী booking শেষে bot-এর private Start link চাপবে। তারপর admin **“Tasdiqlash + Telegram”** চাপলে আগে থেকে লেখা confirmation message যাবে। রোগী bot Start না করলে bot তাকে প্রথম message পাঠাতে পারে না।

**Bot token কখনো browser code, `.env.local`, GitHub বা chat-এ দেবেন না।** Supabase Edge Function Secret হিসেবেই রাখুন।

## ৩. Render-এ frontend চালু

Pull Request merge এবং production publish অনুমোদিত হলে Render service-এর Environment settings-এ যোগ করুন:

```dotenv
VITE_SUPABASE_URL=https://vqygptrtjqqpeftaterz.supabase.co
VITE_SUPABASE_ANON_KEY=<Supabase publishable key>
VITE_TELEGRAM_BOT_USERNAME=<clinic_bot_username>
```

`VITE_SUPABASE_ANON_KEY`-এ Supabase **publishable key** ব্যবহার করুন; `service_role` key নয়। Render-এ SPA rewrite দিন, যেন `/admin` path `index.html`-এ যায়। Production release-এর সময় Supabase Auth-এর **Site URL**-ও `https://azmat-dantel.onrender.com` করুন এবং এই domain-কে Redirect URLs allowlist-এ যোগ করুন।

## ৪. Local test

```bash
npm ci
npm run dev
```

Local URL: `http://localhost:5173/admin`। `.env.example` কপি করে `.env.local` বানালে Supabase URL ও publishable key দিন। Temporary browser preview link task message-এ দেওয়া হয়েছে; sandbox preview স্থায়ী hosting নয়।

## নিরাপত্তা ও আচরণ

- Public visitors কেবল busy slot সময় দেখতে পারে; patient name, phone ও comment পড়তে পারে না। Public REST দিয়ে patient-column access-denied করে পরীক্ষা করা হয়েছে।
- `is_admin()` security invoker; authenticated user শুধু নিজের admin-membership row দেখতে পারে। Admin content/booking/upload access allowlist পরীক্ষা করে।
- একই তারিখ-সময়ের active appointment unique index দিয়ে একবারই অনুমোদিত হয়।
- Doctor image/certificate public-viewable; upload/update/delete admin-only; সর্বোচ্চ 8 MB, JPG/PNG/WebP/PDF।
- Supabase Security Advisor এখনো **Leaked Password Protection Disabled** দেখায়; Supabase Auth security settings-এ এটি উপলভ্য থাকলে চালু করুন।
- Telegram secret/username যোগ না হওয়া পর্যন্ত Telegram পাঠানো চালু নয়।
