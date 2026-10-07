import smileBefore from "./assets/smile-before.jpg";
import smileAfter from "./assets/smile-after.jpg";

const px = (id: number, w = 1200, h = 800) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

export const BRAND = {
  name: "Stomatologiya Azamat Dental",
  short: "AZAMAT DENTAL",
  sub: "STOMATOLOGIYA · 24/7",
  handle: "@azamatdental",
};

export const MEDIA = {
  hero: px(6627574, 1100, 1300),
  heroAlt: px(3845551, 1000, 1200),
  interior: px(5355920, 1200, 900),
  interiorAlt: px(4269268, 1200, 900),
  tech: px(6501859, 1200, 900),
  techAlt: px(6502162, 1200, 900),
  doctors: [px(37458046, 800, 1100), px(5355860, 800, 1100), px(37458054, 800, 1100)],
  smileBefore,
  smileAfter,
  caseB: { before: px(6502039, 900, 700), after: px(3845551, 900, 700) },
  caseC: { before: px(3881155, 900, 700), after: px(3762400, 900, 700) },
  gallery: [px(3762453, 900, 700), px(6627574, 900, 700), px(6627571, 900, 700), px(8260438, 900, 700)],
  avatars: [px(3762453, 200, 200), px(3845551, 200, 200), px(3762400, 200, 200), px(5355860, 200, 200)],
  phone: "+998 91 924 06 54",
  phoneHref: "tel:+998919240654",
  telegram: "https://t.me/+998919240654",
  instagram: "https://instagram.com/estheticwhitedental",
  maps: "https://maps.app.goo.gl/Vtir8RowgiwUByuv6",
};

export const BRANDS = [
  "Nobel Biocare",
  "Straumann",
  "3Shape TRIOS",
  "Ivoclar",
  "ZEISS",
  "KaVo",
  "Dürr Dental",
  "Philips Zoom",
  "Invisalign",
  "Dentsply Sirona",
];
