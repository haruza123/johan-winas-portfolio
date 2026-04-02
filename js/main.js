/**
 * Johan Winas TL — Beranda
 * Memuat data JSON, mengisi hero, latest, katalog, branding OC, dan pencarian.
 */

const DATA_URL = "data/manga.json";

let mangaList = [];
let latestSorted = [];

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = String(str ?? "");
  return div.innerHTML;
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(iso);
  }
}
function getAllSeries(list) {
  return [...new Set(list.map((m) => m.series).filter(Boolean))];
}

function getAllGenres(list) {
  return [...new Set(list.flatMap((m) => m.genres || []))];
}

function detailHref(id) {
  return `detail.html?id=${encodeURIComponent(id)}`;
}

function readerHref(id, chapterNumber) {
  const ch = Number(chapterNumber) || 1;
  return `reader.html?id=${encodeURIComponent(id)}&ch=${encodeURIComponent(String(ch))}`;
}

function getLatestChapterNumber(manga) {
  const chapters = Array.isArray(manga?.chapters) ? manga.chapters : [];
  const max = chapters.reduce((acc, ch) => {
    const n = Number(ch?.number);
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return max || 0;
}

function applyTranslatorCopy(data) {
  const translator = data?.translator;
  if (!translator) return;

  const titleEl = document.querySelector(".hero__title");
  const subtitleEl = document.querySelector('[data-field="heroSubtitle"]');
  const descEl = document.querySelector('[data-field="heroDescription"]');

  if (titleEl && translator.name) titleEl.textContent = translator.name;
  if (subtitleEl) subtitleEl.textContent = translator.tagline || "";
  if (descEl) descEl.textContent = translator.heroDescription || "";

  if (translator.name) {
    document.title = `${translator.name} — Portfolio Penerjemah Manga`;
  }
}

function applyBrandingOcs(data) {
  const ocs = Array.isArray(data?.branding?.ocs) ? data.branding.ocs : [];
  if (!ocs.length) return;

  // Background OCs (fixed)
  const left = ocs.find((o) => o.position === "left") || ocs[0];
  const right = ocs.find((o) => o.position === "right") || ocs[1] || ocs[0];

  const brandLeft = document.querySelector(".brand-oc__img--left");
  const brandRight = document.querySelector(".brand-oc__img--right");
  if (brandLeft && left?.image) brandLeft.src = left.image;
  if (brandRight && right?.image) brandRight.src = right.image;

  // Hero OCs (cinematic scene)
  const heroLeft = document.querySelector(".hero__oc--left");
  const heroRight = document.querySelector(".hero__oc--right");
  if (heroLeft && left?.image) heroLeft.src = left.image;
  if (heroRight && right?.image) heroRight.src = right.image;
}

function renderBrandingGrid(data) {
  const grid = document.getElementById("branding-grid");
  if (!grid) return;

  const ocs = Array.isArray(data?.branding?.ocs) ? data.branding.ocs : [];
  if (!ocs.length) {
    grid.innerHTML = "";
    return;
  }

  grid.innerHTML = ocs
    .map((oc) => {
      const name = escapeHtml(oc?.name || "OC");
      const tagline = escapeHtml(oc?.tagline || "");
      const lore = escapeHtml(oc?.lore || "");
      const role = escapeHtml(oc?.role || "");
      const personality = Array.isArray(oc?.personality) ? oc.personality : [];
      const themeColor = escapeHtml(oc?.themeColor || "");
      const img = escapeHtml(oc?.image || "");

      const chips = [role, ...personality.slice(0, 2).map((p) => escapeHtml(p))]
        .filter(Boolean)
        .map((label) => `<span class="chip">${label}</span>`)
        .join("");

      return `
        <article class="branding-card" style="${themeColor ? `--oc-color: ${themeColor};` : ""}">
          <img class="branding-card__img" src="${img}" alt="${name}" loading="lazy" />
          <div class="branding-card__body">
            <h3 class="branding-card__name">${name}</h3>
            ${tagline ? `<p class="branding-card__tagline">${tagline}</p>` : ""}
            ${lore ? `<p class="branding-card__lore">${lore}</p>` : ""}
            ${chips ? `<div class="branding-card__chips">${chips}</div>` : ""}
          </div>
        </article>
      `;
    })
    .join("");
}

document
  .getElementById("filter-series")
  .addEventListener("change", updateFilter);
document
  .getElementById("filter-genre")
  .addEventListener("change", updateFilter);

function updateFilter() {
  const filtered = mangaList.filter((m) => {
    const matchSeries = !selectedSeries || m.series === selectedSeries;
    const matchGenre =
      !selectedGenre || (m.genres || []).includes(selectedGenre);
    return matchSeries && matchGenre;
  });

  const grid = document.getElementById("manga-grid");

  renderGrid(grid, filtered);

  // 🔥 TAMBAH INI
  showEmptyState(filtered, `${selectedSeries || ""} ${selectedGenre || ""}`);
}

function initHeroTyping() {
  const el = document.getElementById("hero-typed");
  if (!el) return;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  // Typing effect ringan untuk headline (tanpa library).
  const full = el.textContent.trim();
  if (!full) return;

  el.textContent = "";
  const speedMs = 18;
  let i = 0;

  const timer = window.setInterval(() => {
    i += 1;
    el.textContent = full.slice(0, i);
    if (i >= full.length) window.clearInterval(timer);
  }, speedMs);
}

function buildLatestCard(item) {
  const title = escapeHtml(item.title);
  const href = detailHref(item.id);

  const latestChapter = getLatestChapterNumber(item);
  const ch = latestChapter ? `Bab ${latestChapter}` : "";
  const date = formatDate(item.updatedAt);

  return `
    <article class="latest-card">
      <a class="latest-card__link" href="${href}">
        <div class="latest-card__cover-wrap">
          <img class="latest-card__cover" src="${escapeHtml(item.cover)}" alt="" loading="lazy" width="120" height="160" />
        </div>
        <div class="latest-card__body">
          <h3 class="latest-card__title">${title}</h3>
          <p class="latest-card__meta">${escapeHtml(ch)}${ch && date ? " · " : ""}${escapeHtml(date)}</p>
        </div>
      </a>
    </article>
  `;
}

function buildGridCard(item) {
  const title = escapeHtml(item.title);
  const href = detailHref(item.id);

  return `
    <article class="manga-card">
      <a class="manga-card__link" href="${href}" aria-label="${title}">
        <img class="manga-card__cover" src="${escapeHtml(item.cover)}" alt="" loading="lazy" />
        <span class="manga-card__overlay" aria-hidden="true"></span>
        <h3 class="manga-card__title">${title}</h3>
      </a>
    </article>
  `;
}

function sortByUpdated(items) {
  return [...items].sort((a, b) => {
    const ta = new Date(a?.updatedAt || 0).getTime();
    const tb = new Date(b?.updatedAt || 0).getTime();
    return tb - ta;
  });
}

function renderLatest(trackEl, items) {
  if (!trackEl) return;
  trackEl.innerHTML = items.map(buildLatestCard).join("");
}

function renderGrid(gridEl, items) {
  if (!gridEl) return;
  gridEl.innerHTML = items.map(buildGridCard).join("");
}

function updateCatalogCount(countEl, visible, total) {
  if (!countEl) return;
  if (visible === total) {
    countEl.textContent = `${total} judul`;
  } else {
    countEl.textContent = `${visible} dari ${total} judul`;
  }
}

function filterByTitle(query) {
  const q = query.trim().toLowerCase();
  if (!q) return mangaList;
  return mangaList.filter((m) => String(m.title).toLowerCase().includes(q));
}

function onSearchInput(gridEl, countEl, emptyEl, query) {
  const filtered = filterByTitle(query);

  renderGrid(gridEl, filtered);
  updateCatalogCount(countEl, filtered.length, mangaList.length);

  // 🔥 INI YANG KAMU LUPA
  showEmptyState(filtered, query);
}
async function loadData() {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`Gagal memuat data: ${res.status}`);
  return res.json();
}

function setStartReadingCta() {
  const cta = document.getElementById("cta-read");
  if (!cta) return;
  const pick = latestSorted[0] || mangaList[0];
  if (!pick?.id) return;
  cta.href = readerHref(pick.id, 1);
}
function populateFilters(list) {
  const seriesEl = document.getElementById("filter-series");
  const genreEl = document.getElementById("filter-genre");

  seriesEl.innerHTML = `<button class="filter-chip active" data-series="">Semua Series</button>`;
  genreEl.innerHTML = `<button class="filter-chip active" data-genre="">Semua Genre</button>`;

  getAllSeries(list).forEach((s) => {
    seriesEl.innerHTML += `<button class="filter-chip" data-series="${s}">${s}</button>`;
  });

  getAllGenres(list).forEach((g) => {
    genreEl.innerHTML += `<button class="filter-chip" data-genre="${g}">${g}</button>`;
  });
}
let selectedSeries = "";
let selectedGenre = "";

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("filter-chip")) {
    // reset active
    const group = e.target.parentElement;
    group
      .querySelectorAll(".filter-chip")
      .forEach((btn) => btn.classList.remove("active"));

    e.target.classList.add("active");

    if (e.target.dataset.series !== undefined) {
      selectedSeries = e.target.dataset.series;
    }

    if (e.target.dataset.genre !== undefined) {
      selectedGenre = e.target.dataset.genre;
    }

    updateFilter();
  }
});

function filterManga(list) {
  const series = document.getElementById("filter-series").value;
  const genre = document.getElementById("filter-genre").value;

  return list.filter((m) => {
    const matchSeries = !series || m.series === series;
    const matchGenre = !genre || (m.genres || []).includes(genre);
    return matchSeries && matchGenre;
  });
}

function init() {
  const gridEl = document.getElementById("manga-grid");
  const trackEl = document.getElementById("latest-track");
  const searchInput = document.getElementById("manga-search");
  const countEl = document.getElementById("catalog-count");
  const emptyEl = document.getElementById("empty-state");
  const yearEl = document.getElementById("year");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  initHeroTyping();

  loadData()
    .then((data) => {
      mangaList = Array.isArray(data?.manga) ? data.manga : [];
      populateFilters(mangaList);
      latestSorted = sortByUpdated(mangaList);

      applyTranslatorCopy(data);
      applyHeroPersonality();
      applyBrandingOcs(data);
      renderBrandingGrid(data);
      applyShortSectionPersonality();

      renderLatest(trackEl, latestSorted);
      renderGrid(gridEl, mangaList);
      updateCatalogCount(countEl, mangaList.length, mangaList.length);

      setStartReadingCta();

      if (searchInput) {
        searchInput.addEventListener("input", () => {
          onSearchInput(gridEl, countEl, emptyEl, searchInput.value);
        });
      }
    })
    .catch((err) => {
      console.error(err);
      if (gridEl) {
        gridEl.innerHTML =
          '<p class="empty-state">Tidak dapat memuat katalog. Pastikan Anda membuka situs lewat server lokal (bukan file langsung).</p>';
      }
      if (countEl) countEl.textContent = "";
    });
  applyHeroPersonality();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

window.addEventListener("load", () => {
  const loader = document.getElementById("page-loader");
  loader.style.opacity = "0";

  setTimeout(() => {
    loader.style.display = "none";
  }, 400);
});

const theme = document.body.dataset.theme;
const img = document.getElementById("loader-img");

if (theme === "light") {
  img.src = "image/Wm2_putih.png";
} else {
  img.src = "image/Wm2.png";
}

function showEmptyState(list, query) {
  const emptyState = document.getElementById("empty-state");
  if (!emptyState) return;

  if (!list.length) {
    emptyState.hidden = false;

    const dialog = getDialog(query ? "search" : "empty", query);

    emptyState.innerHTML = `
      <div class="oc-dialog">
        <div class="oc-dialog__bubble">
          <p class="oc-dialog__name">${dialog.name}</p>
          <p class="oc-dialog__text">${dialog.text}</p>

          <div class="oc-dialog__cta">
            <a class="btn btn--primary" href="#work-with-me">
              Request Manga
            </a>
            <a class="btn btn--ghost" href="https://saweria.co/JohanWinas" target="_blank">
              ☕ Support
            </a>
          </div>
        </div>
      </div>
    `;
  } else {
    emptyState.hidden = true;
  }
}

function applyHeroPersonality() {
  const theme = document.body.dataset.theme;

  const subtitleEl = document.querySelector('[data-field="heroSubtitle"]');
  const titleEl = document.querySelector(".hero__headline-text");
  const descEl = document.querySelector('[data-field="heroDescription"]');

  if (theme === "light") {
    // 🌞 HIMORI MODE
    if (subtitleEl)
      subtitleEl.textContent = "Manga Translator • Bringing Stories to Life ✨";

    if (titleEl)
      titleEl.textContent = "Terjemahan yang terasa asli—ritmenya tetap hidup~";

    if (descEl)
      descEl.textContent =
        "Aku menerjemahkan dengan gaya natural dan penuh rasa~ Yuk baca atau request judul favoritmu!";
  } else {
    // 🌙 RYOU MODE
    if (subtitleEl)
      subtitleEl.textContent = "Manga Translator • Precision & Consistency";

    if (titleEl) titleEl.textContent = "Terjemahan akurat—ritme tetap terjaga.";

    if (descEl)
      descEl.textContent =
        "Menerjemahkan dengan presisi tinggi, menjaga makna dan nuansa tetap utuh.";
  }
}

function applyShortSectionPersonality() {
  const textEl = document.querySelector(".short-card__text");
  const authorEl = document.querySelector(".short-card__author");

  if (!textEl || !authorEl) return;

  const theme = document.body.dataset.theme;

  let type, name;

  if (theme === "light") {
    type = "himori";
    name = "Himori 🧡";
  } else {
    type = "ryou";
    name = "Ryou 🖤";
  }

  const pool = SHORT_DIALOG[type];
  const text = pool[Math.floor(Math.random() * pool.length)];

  textEl.textContent = text;
  authorEl.textContent = "— " + name;
}
