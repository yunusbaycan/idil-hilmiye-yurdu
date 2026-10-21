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

// Ön kayıt sihirbazı: 3 adım; bilgiler saklanmaz, WhatsApp mesajı oluşturulur
const form = document.getElementById("wa-form");
const err = document.getElementById("f-error");
const panels = [...form.querySelectorAll(".wz-panel")];
const stepItems = [...form.querySelectorAll(".wz-steps li")];
const bar = form.querySelector(".wz-bar span");
const wzStatus = document.getElementById("wz-status");
const wzBack = form.querySelector(".wz-back");
const wzNext = form.querySelector(".wz-next");
const wzSubmit = form.querySelector(".wz-submit");
const stepNames = ["Veli bilgileri", "Öğrenci bilgileri", "Mesajınız"];
let step = 0;

// Her adımın zorunlu alanı ve hata mesajı
const checks = [
  () => (form.ad.value.trim() ? null : [form.ad, "Lütfen adınızı ve soyadınızı yazın."]),
  () => (form.sinif.value ? null : [form.sinif, "Lütfen öğrencinin sınıfını seçin."]),
  () => (form.kvkk.checked ? null : [form.kvkk, "Devam etmek için KVKK onay kutusunu işaretleyin."]),
];

const showError = (msg) => {
  err.textContent = msg || "";
  err.hidden = !msg;
};

const goTo = (i, focus = true) => {
  step = i;
  panels.forEach((p, k) => { p.hidden = k !== i; });
  stepItems.forEach((li, k) => {
    li.classList.toggle("active", k === i);
    li.classList.toggle("done", k < i);
  });
  bar.style.width = `${((i + 1) / panels.length) * 100}%`;
  wzBack.hidden = i === 0;
  wzNext.hidden = i === panels.length - 1;
  wzSubmit.hidden = i !== panels.length - 1;
  wzStatus.textContent = `Adım ${i + 1} / ${panels.length}: ${stepNames[i]}`;
  showError("");
  if (focus) panels[i].querySelector("input, select, textarea").focus();
};

const validate = () => {
  const fail = checks[step]();
  if (!fail) return true;
  showError(fail[1]);
  fail[0].focus();
  return false;
};

wzNext.addEventListener("click", () => { if (validate()) goTo(step + 1); });
wzBack.addEventListener("click", () => goTo(step - 1));
// Son adım dışında Enter, formu göndermek yerine bir sonraki adıma geçer
form.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && step < panels.length - 1) {
    e.preventDefault();
    wzNext.click();
  }
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validate()) return;
  const lines = [
    "Merhaba, ön kayıt başvurusu yapmak istiyorum.",
    "",
    `Veli: ${form.ad.value.trim()}`,
    `Öğrencinin sınıfı: ${form.sinif.value}`,
  ];
  if (form.okul.value.trim()) lines.push(`Okulu: ${form.okul.value.trim()}`);
  lines.push(`Dönüş tercihi: ${form.donus.value}`);
  if (form.mesaj.value.trim()) lines.push("", form.mesaj.value.trim());
  window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
});
goTo(0, false);

document.getElementById("yil").textContent = new Date().getFullYear();

// =========================================================
// Hareket katmanı
// =========================================================
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.add("js");

// Kaydırma ilerleme çubuğu ve "yukarı çık" butonu
const progress = document.querySelector(".scroll-progress");
const toTop = document.querySelector(".to-top");
const onScrollFx = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.setProperty("--p", max > 0 ? (window.scrollY / max).toFixed(4) : 0);
  toTop.classList.toggle("show", window.scrollY > 700);
};
window.addEventListener("scroll", onScrollFx, { passive: true });
onScrollFx();

// Kaydırınca beliren öğeler; aynı gruptakiler sırayla gelir
if ("IntersectionObserver" in window && !reduceMotion) {
  const groups = [".section-head", ".big-quote", ".parallax-text", ".t-slider", ".about-grid > div", ".values li", ".feature", ".gallery li", ".steps li", ".docs", ".faq details", ".contact-info", ".contact-form"];
  const revealIo = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      revealIo.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  groups.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add("reveal");
      el.style.setProperty("--d", `${(i % 4) * 0.08}s`);
      revealIo.observe(el);
    });
  });

  // Sayaçlar: 0'dan hedef değere sayar
  const countIo = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      countIo.unobserve(e.target);
      const el = e.target;
      const end = Number(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / 1400, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3))) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach((el) => countIo.observe(el));
}

// Altın süslemeler görünür olunca kendini çizer
const ornaments = document.querySelectorAll(".ornament");
if ("IntersectionObserver" in window && !reduceMotion) {
  const ornIo = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      ornIo.unobserve(e.target);
    });
  }, { threshold: 0.6 });
  ornaments.forEach((o) => ornIo.observe(o));
} else {
  ornaments.forEach((o) => o.classList.add("in"));
}

// Paralaks fotoğraf şeritleri: görsel, sayfadan daha yavaş kayar
const strips = [...document.querySelectorAll(".parallax")];
if (strips.length && !reduceMotion) {
  let ticking = false;
  const update = () => {
    const vh = window.innerHeight;
    strips.forEach((s) => {
      const r = s.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const offset = (r.top + r.height / 2 - vh / 2) * -0.18;
      s.querySelector(".parallax-media img").style.setProperty("--py", `${offset.toFixed(1)}px`);
    });
    ticking = false;
  };
  const request = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  update();
}

// Veli görüşleri kaydırıcısı
const slider = document.querySelector(".t-slider");
if (slider) {
  const track = slider.querySelector(".t-track");
  const cards = [...track.children];
  const dotsWrap = slider.querySelector(".t-dots");
  const dots = cards.map((_, i) => {
    const d = document.createElement("button");
    d.type = "button";
    d.className = "t-dot";
    d.setAttribute("aria-label", `${i + 1}. görüş`);
    d.addEventListener("click", () => { scrollToCard(i); stopAuto(); });
    dotsWrap.append(d);
    return d;
  });
  const current = () => {
    const left = track.scrollLeft;
    let best = 0;
    cards.forEach((c, i) => {
      if (Math.abs(c.offsetLeft - track.offsetLeft - left) < Math.abs(cards[best].offsetLeft - track.offsetLeft - left)) best = i;
    });
    return best;
  };
  const maxScroll = () => track.scrollWidth - track.clientWidth;
  const scrollToCard = (i) => {
    const target = Math.min(cards[(i + cards.length) % cards.length].offsetLeft - track.offsetLeft, maxScroll());
    track.scrollTo({ left: target });
  };
  const markDots = () => {
    // Sona gelindiyse son nokta işaretlenir
    const i = track.scrollLeft >= maxScroll() - 4 ? cards.length - 1 : current();
    dots.forEach((d, k) => d.setAttribute("aria-current", String(k === i)));
  };
  const shift = (dir) => {
    const atEnd = track.scrollLeft >= maxScroll() - 4;
    if (dir > 0 && atEnd) scrollToCard(0);
    else if (dir < 0 && track.scrollLeft <= 4) track.scrollTo({ left: maxScroll() });
    else scrollToCard(current() + dir);
  };
  slider.querySelector(".t-prev").addEventListener("click", () => { shift(-1); stopAuto(); });
  slider.querySelector(".t-next").addEventListener("click", () => { shift(1); stopAuto(); });
  track.addEventListener("scroll", () => requestAnimationFrame(markDots), { passive: true });
  markDots();

  // Otomatik ilerleme: görünürken, üzerine gelinmemişken ve hareket azaltma kapalıyken
  let auto = null;
  let hovering = false;
  let stopped = reduceMotion;
  const stopAuto = () => { stopped = true; clearInterval(auto); };
  const startAuto = () => {
    clearInterval(auto);
    if (!stopped) auto = setInterval(() => { if (!hovering) shift(1); }, 6000);
  };
  slider.addEventListener("mouseenter", () => { hovering = true; });
  slider.addEventListener("mouseleave", () => { hovering = false; });
  slider.addEventListener("focusin", stopAuto);
  track.addEventListener("touchstart", stopAuto, { passive: true });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => (e.isIntersecting ? startAuto() : clearInterval(auto)), { threshold: 0.4 }).observe(slider);
  }
}

// Galeri imleci: fareli cihazlarda fotoğrafın üzerinde "Büyüt" yazan altın daire
if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const cursor = document.createElement("div");
  cursor.className = "cursor-zoom";
  cursor.setAttribute("aria-hidden", "true");
  cursor.textContent = "Büyüt";
  document.body.append(cursor);
  document.documentElement.classList.add("has-cursor");
  const move = (e) => {
    cursor.style.setProperty("--cx", `${e.clientX}px`);
    cursor.style.setProperty("--cy", `${e.clientY}px`);
  };
  document.querySelectorAll(".gallery .zoomable").forEach((z) => {
    z.addEventListener("mouseenter", (e) => { move(e); cursor.classList.add("on"); });
    z.addEventListener("mouseleave", () => cursor.classList.remove("on"));
    z.addEventListener("mousemove", move);
    z.addEventListener("click", () => cursor.classList.remove("on"));
  });
}
