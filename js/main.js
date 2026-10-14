// =========================================================
// Site ayarları — numara değişince yalnızca burayı güncelleyin
// =========================================================
const SITE = {
  whatsapp: "905320000000", // ülke koduyla, başında + ve 0 olmadan
  waMessage: "Merhaba, yurdunuz hakkında bilgi almak istiyorum.",
};

// Tüm WhatsApp bağlantılarını tek yerden ayarla
document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(SITE.waMessage)}`;
});

// Kaydırınca üst menüye gölge ver
const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Mobil menü
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("ana-menu");
const setMenu = (open) => {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
  nav.classList.toggle("open", open);
};
toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

// Görünen bölümü menüde işaretle
const links = [...document.querySelectorAll('.main-nav ul a[href^="#"]')];
const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${e.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => io.observe(s));
}

// Fotoğraf büyütme
const box = document.getElementById("lightbox");
const boxImg = box.querySelector("img");
const boxCap = box.querySelector(".lightbox-caption");
document.querySelectorAll(".zoomable").forEach((btn) => {
  btn.addEventListener("click", () => {
    boxImg.src = btn.dataset.full;
    boxImg.alt = btn.querySelector("img").alt;
    boxCap.textContent = btn.dataset.caption || "";
    box.showModal();
  });
});
box.querySelector(".lightbox-close").addEventListener("click", () => box.close());
box.addEventListener("click", (e) => { if (e.target === box) box.close(); });

// İletişim formu: bilgileri saklamadan WhatsApp mesajı oluşturur
const form = document.getElementById("wa-form");
const err = document.getElementById("f-error");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const ad = form.ad.value.trim();
  const mesaj = form.mesaj.value.trim();
  if (!ad || !mesaj) {
    err.hidden = false;
    (ad ? form.mesaj : form.ad).focus();
    return;
  }
  err.hidden = true;
  const sinif = form.sinif.value ? `\nÖğrencinin sınıfı: ${form.sinif.value}` : "";
  const text = `Merhaba, ben ${ad}.${sinif}\n\n${mesaj}`;
  window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
});

document.getElementById("yil").textContent = new Date().getFullYear();
