import type { Lang } from "@/i18n";

/**
 * Demo-mode configuration.
 * Before the public launch: set `enabled` (and `ribbon`) to false, and replace
 * the placeholder phone / address / prices / photos in `src/i18n.tsx` + `src/media.ts`.
 */
export const DEMO = {
  enabled: true,
  ribbon: true,
  toastMs: 9000,
  /** Shown in the demo sheet so the client can reply straight away. */
  contact: {
    telegram: "https://t.me/+998919240654",
    whatsapp: "", // ← optional: https://wa.me/998XXXXXXXXX
  },
  copy: {
    uz: {
      pill: "Demo",
      toast: "Bu ko'rgazmali demo — matn, narx va rasmlar namunaviy. Yakuniy saytda klinikaning haqiqiy ma'lumotlari qo'yiladi.",
      title: "Ko'rgazmali demo: nima tayyor?",
      includedTitle: "Demo ichida",
      included: [
        "3 tilda to'liq sayt: o'zbek, rus, ingliz",
        "Xizmatlar, narxlar, aksiya va FAQ bloklari",
        "Oldin/Keyin natijalar slayderi (barmoq bilan tortiladi)",
        "3 qadamli onlayn navbat: xizmat → sana/vaqt → aloqa",
        "Shifokorlar, mijozlar fikri va klinika galereyasi",
        "24/7 bloklari, xarita havolasi va mobil uchun to'liq moslashgan dizayn",
      ],
      productionTitle: "Ishga tushirishdan oldin almashtiriladi",
      production: [
        "Telefon, manzil, xarita havolasi va ish vaqti",
        "Klinikaning haqiqiy fotolari va shifokorlar rasmlari",
        "Real narxlar, xizmatlar va kafolat shartlari",
        "Navbatlarni qabul qilish: CRM yoki Telegram bot (backend)",
        "SEO uchun alohida /ru va /en sahifalar + domen",
      ],
      stepsTitle: "Keyingi qadamlar",
      steps: [
        "Demo'ni ko'rib chiqib, izoh va tuzatishlarni yuborasiz",
        "Kontent (matn, rasm, narx) va kontaktlar almashtiriladi",
        "Navbat tizimi ulanadi va sayt domen bilan hostingga chiqadi",
      ],
      share: "Havolani ulashish",
      copied: "Havola nusxalandi ✓",
      contactCta: "Bog'lanish (Telegram)",
      close: "Yopish",
      hide: "Demo yozuvini yashirish",
      showNote: "Demo rejimi yoqilgan — mijozga ko'rsatish uchun. O'chirish: src/config.ts → DEMO.enabled = false",
    },
    ru: {
      pill: "Демо",
      toast: "Это демонстрационный сайт — тексты, цены и фото условные. В финальной версии будут реальные данные клиники.",
      title: "Демо-версия: что готово?",
      includedTitle: "Внутри демо",
      included: [
        "Полный сайт на 3 языках: узбекский, русский, английский",
        "Блоки услуг, цен, акций и FAQ",
        "Слайдер результатов «до/после» (тянется пальцем)",
        "Онлайн-запись в 3 шага: услуга → дата/время → контакты",
        "Врачи, отзывы пациентов и галерея клиники",
        "Блоки 24/7, ссылка на карту и полностью адаптивный мобильный дизайн",
      ],
      productionTitle: "Заменяется перед запуском",
      production: [
        "Телефон, адрес, ссылка на карту и часы работы",
        "Реальные фото клиники и врачей",
        "Реальные цены, услуги и условия гарантии",
        "Приём записей: CRM или Telegram-бот (backend)",
        "Отдельные /ru и /en страницы для SEO + домен",
      ],
      stepsTitle: "Следующие шаги",
      steps: [
        "Вы просматриваете демо и отправляете правки",
        "Меняем контент (тексты, фото, цены) и контакты",
        "Подключаем систему записи и выпускаем сайт на домен",
      ],
      share: "Поделиться ссылкой",
      copied: "Ссылка скопирована ✓",
      contactCta: "Связаться (Telegram)",
      close: "Закрыть",
      hide: "Скрыть плашку демо",
      showNote: "Демо-режим включён. Отключение: src/config.ts → DEMO.enabled = false",
    },
    en: {
      pill: "Demo",
      toast: "This is a demonstration site — copy, prices and photos are placeholders. Real clinic data goes into the final build.",
      title: "Demo build: what's ready?",
      includedTitle: "Inside the demo",
      included: [
        "Full website in 3 languages: Uzbek, Russian, English",
        "Services, pricing, promo and FAQ sections",
        "Before/after results slider (drag with your finger)",
        "3-step online booking: service → date/time → contact",
        "Doctors, patient reviews and clinic gallery",
        "24/7 blocks, map link and a fully responsive mobile design",
      ],
      productionTitle: "Replaced before launch",
      production: [
        "Phone, address, map link and working hours",
        "Real clinic and doctor photos",
        "Real prices, services and warranty terms",
        "Booking intake: CRM or Telegram bot (backend)",
        "Separate /ru and /en pages for SEO + domain",
      ],
      stepsTitle: "Next steps",
      steps: [
        "You review the demo and send comments",
        "We swap in the real content (copy, photos, prices)",
        "We connect the booking system and launch on a domain",
      ],
      share: "Share the link",
      copied: "Link copied ✓",
      contactCta: "Get in touch (Telegram)",
      close: "Close",
      hide: "Hide the demo badge",
      showNote: "Demo mode is on. Disable it in src/config.ts → DEMO.enabled = false",
    },
  } as Record<Lang, DemoCopy>,
};

export type DemoCopy = {
  pill: string;
  toast: string;
  title: string;
  includedTitle: string;
  included: string[];
  productionTitle: string;
  production: string[];
  stepsTitle: string;
  steps: string[];
  share: string;
  copied: string;
  contactCta: string;
  close: string;
  hide: string;
  showNote: string;
};
