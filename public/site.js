const copy = {
  tr: {
    pageTitle: "TASH90 — Yapay zekâ güvenliği, İstanbul",
    description: "İstanbul'da AI safety ve security üzerine bir günlük buluşma hazırlıyoruz. Tarih, program ve katılım bilgileri yakında.",
    skip: "İçeriğe geç",
    status: "Bir buluşma hazırlıyoruz",
    titleOne: "Yapay zekâ",
    titleTwo: "güvenliği.",
    titleThree: "İstanbul'da.",
    intro: "AI safety ve security üzerine bir günlük buluşma. Araştırmacıları, mühendisleri ve bu sorulara kafa yoran insanları bir araya getirmek istiyoruz.",
    explore: "Ne konuşacağız?",
    artLabel: "Ortak bir zemin",
    focusLabel: "Odağımız",
    focusTitle: "Daha iyi sorular. Daha sağlam güvenceler.",
    topicOneTitle: "Doğrulama",
    topicOneBody: "AI sistemleri hakkında verilen sözleri bağımsız olarak nasıl kontrol edebiliriz?",
    topicTwoTitle: "Güvenlik",
    topicTwoBody: "Güçlü modelleri ve AI ajanlarını saldırılara ve kötüye kullanıma karşı nasıl koruruz?",
    topicThreeTitle: "Araştırma ve yönetişim",
    topicThreeBody: "Riskleri nasıl değerlendirir, bulguları hangi kararlara dönüştürürüz?",
    announcementLabel: "Etkinlik durumu",
    soonTitle: "Ayrıntılar yakında.",
    soonBody: "Tarih, mekân, program ve katılım bilgilerini burada paylaşacağız.",
    soonTag: "Hazırlık aşamasında",
    footer: "AI safety & security · İstanbul",
    backTop: "Başa dön ↑",
  },
  en: {
    pageTitle: "TASH90 — AI safety & security, Istanbul",
    description: "A one-day gathering on AI safety and security in Istanbul is taking shape. Date, programme and attendance details coming soon.",
    skip: "Skip to content",
    status: "A gathering is taking shape",
    titleOne: "AI safety.",
    titleTwo: "AI security.",
    titleThree: "In Istanbul.",
    intro: "A one-day gathering on AI safety and security. We want to bring together researchers, engineers and people thinking seriously about these questions.",
    explore: "What will we discuss?",
    artLabel: "Common ground",
    focusLabel: "Our focus",
    focusTitle: "Better questions. Stronger assurances.",
    topicOneTitle: "Verification",
    topicOneBody: "How can we independently check the claims made about AI systems?",
    topicTwoTitle: "Security",
    topicTwoBody: "How do we protect powerful models and AI agents from attacks and misuse?",
    topicThreeTitle: "Research & governance",
    topicThreeBody: "How do we evaluate risks and turn the evidence into decisions?",
    announcementLabel: "Event status",
    soonTitle: "Details coming soon.",
    soonBody: "We'll share the date, venue, programme and attendance details here.",
    soonTag: "In preparation",
    footer: "AI safety & security · Istanbul",
    backTop: "Back to top ↑",
  },
};

const controls = document.querySelector(".languages");
const buttons = controls.querySelectorAll("button");

function setLanguage(language) {
  const text = copy[language];
  document.documentElement.lang = language;
  document.title = text.pageTitle;
  document.querySelector('meta[name="description"]').content = text.description;
  document.querySelector('meta[property="og:title"]').content = text.pageTitle;
  document.querySelector('meta[property="og:description"]').content = text.description;
  document.querySelector('meta[property="og:locale"]').content = language === "tr" ? "tr_TR" : "en_GB";
  document.querySelectorAll("[data-copy]").forEach((element) => {
    element.textContent = text[element.dataset.copy];
  });
  document.querySelectorAll("[data-label]").forEach((element) => {
    element.setAttribute("aria-label", text[element.dataset.label]);
  });
  buttons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.lang === language));
  });
}

const initialLanguage = new URL(window.location.href).searchParams.get("lang");
setLanguage(initialLanguage === "en" ? "en" : "tr");
controls.hidden = false;

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const language = button.dataset.lang;
    setLanguage(language);
    const url = new URL(window.location.href);
    if (language === "en") url.searchParams.set("lang", "en");
    else url.searchParams.delete("lang");
    window.history.replaceState(null, "", url);
  });
});
