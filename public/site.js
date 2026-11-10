import { mountMosaic } from "./mosaic.js";

const copy = {
  tr: {
    title: "TASH90 · Yapay zekâ güvenliği buluşması, İstanbul",
    description: "Araştırmacılar, mühendisler ve yapay zekâ güvenliğine kafa yoran herkes için İstanbul’da bir günlük buluşma.",
    skip: "İçeriğe geç", navLabel: "Ana menü", langLabel: "Dil", paletteLabel: "Renk",
    nav1: "Konular", nav2: "Program", nav3: "Bize yazın",
    h1: "Yapay zekâ güvenliği için İstanbul’da buluşuyoruz",
    lead: "Bir gün boyunca araştırmacılar, mühendisler ve bu konuya kafa yoran herkes bir arada.",
    cta: "Bize yazın",
    topicsH: "Ne konuşacağız?",
    t1h: "Doğrulama", t1p: "Bir yapay zekâ sistemi hakkında söylenenleri dışarıdan nasıl doğrularız?",
    t2h: "Model güvenliği", t2p: "Güçlü modelleri ve ajanları saldırılardan ve kötüye kullanımdan nasıl koruruz?",
    t3h: "Risk ve yönetişim", t3p: "Riskleri nasıl ölçeriz, bulguları nasıl karara dönüştürürüz?",
    dayH: "Gün nasıl geçecek?", dayL: "Gün boyunca",
    f1: "Paneller", f1p: "Araştırma, mühendislik ve kamu politikası aynı sahnede.",
    f2: "Açık kürsü", f2p: "Makalesini ya da süren çalışmasını anlatmak isteyenler için kısa sunumlar.",
    f3: "Yuvarlak masalar", f3p: "Küçük gruplarda, kayda alınmadan, cevabı henüz belli olmayan sorular üzerine sohbet.",
    prepL: "Hazırlık", s1: "Konuşmacılar ve sponsorlar", s1t: "şimdi", s2: "Tarih\u00a0ve\u00a0mekân", s2t: "sırada", s3: "Kayıt", s3t: "sonra",
    spH: "Konuşmacı arıyoruz", spP: "Sunum, panel ya da açık kürsü. Hangisini istediğinizi ve size uyan tarihleri yazın; günü konuşmacılarla birlikte seçiyoruz.",
    soH: "Sponsor\u00a0arıyoruz", soP: "Desteğiniz konuşmacıları İstanbul’a getirmemizi sağlayacak.",
    mail: "Bize ulaşın",
    foot: "Yapay zekâ güvenliği buluşması · İstanbul",
    toLight: "Açık tema", toDark: "Koyu tema",
    pause: "Animasyonu durdur", play: "Animasyonu oynat",
  },
  en: {
    title: "TASH90 · An AI safety gathering in Istanbul",
    description: "A one-day gathering in Istanbul for researchers, engineers and anyone who thinks hard about AI safety.",
    skip: "Skip to content", navLabel: "Main menu", langLabel: "Language", paletteLabel: "Colour",
    nav1: "Topics", nav2: "Programme", nav3: "Write to us",
    h1: "An AI safety gathering in Istanbul",
    lead: "One day for researchers, engineers and anyone who thinks hard about AI safety.",
    cta: "Write to us",
    topicsH: "What we’ll cover",
    t1h: "Verification", t1p: "How do we check claims about an AI system from the outside?",
    t2h: "Model security", t2p: "How do we protect powerful models and agents from attacks and misuse?",
    t3h: "Risk and governance", t3p: "How do we measure risk, and turn findings into decisions?",
    dayH: "How the day works", dayL: "Through the day",
    f1: "Panels", f1p: "Research, engineering and public policy on one stage.",
    f2: "Open floor", f2p: "Short talks for anyone who wants to present a paper or work in progress.",
    f3: "Round tables", f3p: "Small groups, off the record, on questions without a settled answer.",
    prepL: "Preparation", s1: "Speakers and sponsors", s1t: "now", s2: "Date and venue", s2t: "next", s3: "Registration", s3t: "later",
    spH: "Speak at TASH90", spP: "A talk, a panel or the open floor. Tell us which, and the dates that suit you; we’ll pick the day with our speakers.",
    soH: "Sponsor TASH90", soP: "Your support brings our speakers to Istanbul.",
    mail: "Contact us",
    foot: "An AI safety gathering · Istanbul",
    toLight: "Light theme", toDark: "Dark theme",
    pause: "Pause animation", play: "Play animation",
  },
};

const BRAND = { light: "#0a6685", dark: "#0d1430" };
const params = new URL(location.href).searchParams;

// Language: ?lang= wins; otherwise Turkish for visitors in Türkiye's time zone or with a Turkish browser, English for everyone else.
function pickLanguage() {
  const asked = params.get("lang");
  if (asked === "tr" || asked === "en") return asked;
  let zone = "";
  try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch {}
  const browser = (navigator.languages && navigator.languages[0]) || navigator.language || "";
  return zone === "Europe/Istanbul" || /^tr\b/i.test(browser) ? "tr" : "en";
}

const state = {
  lang: pickLanguage(),
  theme: params.get("theme") === "dark" ? "dark" : "light",
  paused: false,
};
let stops = [];

// Choices live in the URL (no storage), so a shared link opens the same way.
function remember(key, value, fallback) {
  const url = new URL(location.href);
  if (value === fallback) url.searchParams.delete(key);
  else url.searchParams.set(key, value);
  history.replaceState(null, "", url);
}

function applyCopy() {
  const text = copy[state.lang];
  document.documentElement.lang = state.lang;
  document.title = text.title;
  document.querySelector('meta[name="description"]').content = text.description;
  document.querySelector('meta[property="og:title"]').content = text.title;
  document.querySelector('meta[property="og:description"]').content = text.description;
  document.querySelector('meta[property="og:locale"]').content = state.lang === "tr" ? "tr_TR" : "en_GB";
  document.querySelectorAll("[data-copy]").forEach((el) => {
    const key = el.dataset.copy === "pause" ? (state.paused ? "play" : "pause") : el.dataset.copy;
    el.textContent = text[key];
  });
  document.querySelectorAll("[data-label]").forEach((el) => el.setAttribute("aria-label", text[el.dataset.label]));
  document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === state.lang)));
  themeLabel();
}

function mountArt() {
  stops.forEach((stop) => stop());
  stops = [...document.querySelectorAll("canvas[data-art]")].map((canvas) =>
    mountMosaic(canvas, canvas.dataset.art, {
      palette: state.theme,
      glyph: canvas.dataset.glyph,
      order: Number(canvas.dataset.order || 0),
      still: state.paused,
    }),
  );
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  document.querySelector('meta[name="theme-color"]').content = BRAND[state.theme];
  themeLabel();
}

// The theme button shows, in its tesserae, the colours it switches to; its name says the same.
function themeLabel() {
  const text = copy[state.lang][state.theme === "light" ? "toDark" : "toLight"];
  const button = document.querySelector(".theme");
  button.setAttribute("aria-label", text);
  button.title = text;
}

applyTheme();
applyCopy();
mountArt();
document.querySelectorAll(".switch, .theme").forEach((el) => { el.hidden = false; });
// With reduced motion the scene is already still, so the pause control would do nothing; follow the setting live.
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const syncPause = () => {
  const button = document.querySelector(".pause");
  if (reduced.matches && document.activeElement === button) document.getElementById("main").focus();
  button.hidden = reduced.matches;
};
syncPause();
reduced.addEventListener("change", syncPause);

document.querySelectorAll("[data-lang]").forEach((button) => {
  button.addEventListener("click", () => {
    state.lang = button.dataset.lang;
    remember("lang", state.lang, null);
    applyCopy();
  });
});

document.querySelector(".theme").addEventListener("click", () => {
  state.theme = state.theme === "light" ? "dark" : "light";
  remember("theme", state.theme, "light");
  applyTheme();
  mountArt();
});

// WCAG 2.2.2: the moving water can be stopped and started again.
const pause = document.querySelector(".pause");
pause.addEventListener("click", () => {
  state.paused = !state.paused;
  stops.forEach((stop) => stop.hold && stop.hold(state.paused));
  applyCopy();
});
