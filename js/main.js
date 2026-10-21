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

// Fotoğraf büyütme: galeri içinde ileri/geri, ok tuşları ve kaydırma
const box = document.getElementById("lightbox");
const boxImg = box.querySelector("img");
const boxText = box.querySelector(".lightbox-text");
const boxCount = box.querySelector(".lightbox-count");
const prevBtn = box.querySelector(".lightbox-prev");
const nextBtn = box.querySelector(".lightbox-next");
let group = [];
let index = 0;

const show = (i) => {
  index = (i + group.length) % group.length;
  const btn = group[index];
  boxImg.src = btn.dataset.full;
  boxImg.alt = btn.querySelector("img").alt;
  boxText.textContent = btn.dataset.caption || "";
  boxCount.textContent = group.length > 1 ? `${index + 1} / ${group.length}` : "";
  // Sonraki fotoğrafı önceden yükle
  if (group.length > 1) new Image().src = group[(index + 1) % group.length].dataset.full;
};

document.querySelectorAll(".zoomable").forEach((btn) => {
  btn.addEventListener("click", () => {
    const gallery = btn.closest(".gallery");
    group = gallery ? [...gallery.querySelectorAll(".zoomable")] : [btn];
    prevBtn.hidden = nextBtn.hidden = group.length < 2;
    show(group.indexOf(btn));
    box.showModal();
  });
});
prevBtn.addEventListener("click", () => show(index - 1));
nextBtn.addEventListener("click", () => show(index + 1));
box.querySelector(".lightbox-close").addEventListener("click", () => box.close());
box.addEventListener("click", (e) => { if (e.target === box) box.close(); });
box.addEventListener("keydown", (e) => {
  if (group.length < 2) return;
  if (e.key === "ArrowLeft") show(index - 1);
  if (e.key === "ArrowRight") show(index + 1);
});
let touchX = null;
box.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
box.addEventListener("touchend", (e) => {
  if (touchX === null || group.length < 2) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  touchX = null;
});
// Kapanınca odak, açan fotoğrafa geri döner (dialog bunu kendisi yapar); büyük görseli bırak
box.addEventListener("close", () => { boxImg.removeAttribute("src"); });

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
