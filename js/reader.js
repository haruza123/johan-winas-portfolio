/**
 * Reader — scroll vertikal (webtoon-style) + navigasi halaman/chapter.
 * Query:
 * - id: manga id
 * - ch: nomor chapter (1..n)
 */

const DATA_URL = "data/manga.json";
let readingMode = localStorage.getItem("readingMode") || "scroll";

// Reader preferences (UI settings)
// Stored as JSON in localStorage to keep behavior consistent across sessions.
const READER_SETTINGS_KEY = "jwtl_reader_settings";

function loadReaderSettings() {
  try {
    const raw = localStorage.getItem(READER_SETTINGS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function saveReaderSettings(settings) {
  try {
    localStorage.setItem(READER_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

function normalizeReaderSettings(settings) {
  const s = settings && typeof settings === "object" ? settings : {};

  const zoomPct = Number(s.zoomPct);
  const zoomClamped = Number.isFinite(zoomPct)
    ? Math.min(140, Math.max(80, zoomPct))
    : 100;

  const equalize = s.equalize !== false; // default true
  const fit = s.fit === "cover" ? "cover" : "contain";
  const frameRatioMode = s.frameRatioMode === "uniform" ? "uniform" : "auto";

  return {
    zoomPct: zoomClamped,
    equalize,
    fit,
    frameRatioMode,
  };
}

function applyReaderSettings(settings) {
  const s = normalizeReaderSettings(settings);
  const root = document.documentElement;
  const body = document.body;
  if (!root || !body) return;

  root.style.setProperty("--reader-zoom", String(s.zoomPct / 100));
  root.style.setProperty("--reader-fit", s.fit);
  body.classList.toggle("reader-equalize", Boolean(s.equalize));
  body.classList.toggle(
    "reader-equalize-uniform",
    Boolean(s.equalize && s.frameRatioMode === "uniform"),
  );

  return s;
}

function createReaderSettingsModal(currentSettings, onChange) {
  const overlay = document.createElement("div");
  overlay.className = "reader-settings-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");

  overlay.innerHTML = `
    <div class="reader-settings-panel">
      <div class="reader-settings-head">
        <h2 class="reader-settings-title">Pengaturan Baca</h2>
        <button class="btn btn--ghost" type="button" data-action="close">Tutup</button>
      </div>
      <div class="reader-settings-body">
        <div class="reader-setting-row">
          <div class="reader-setting-row__label">Zoom</div>
          <input type="range" min="80" max="140" step="5" value="${escapeHtml(
            String(currentSettings.zoomPct),
          )}" data-setting="zoomPct" />
          <div class="reader-progress" style="text-align:left;">
            <span data-label="zoomPct">${escapeHtml(String(currentSettings.zoomPct))}</span>%
          </div>
        </div>

        <div class="reader-setting-row reader-setting-row--checkbox">
          <label>
            <input type="checkbox" data-setting="equalize" ${
              currentSettings.equalize ? "checked" : ""
            } />
            Samakan ukuran halaman
          </label>
          <div class="reader-progress" style="text-align:left;">
            Semua halaman ditampilkan pada frame ukuran sama (tanpa crop).
          </div>
        </div>

        <div class="reader-setting-row">
          <div class="reader-setting-row__label">Mode gambar</div>
          <select class="reader-controls__select" data-setting="fit">
            <option value="contain" ${
              currentSettings.fit === "contain" ? "selected" : ""
            }>Contain (tanpa crop)</option>
            <option value="cover" ${
              currentSettings.fit === "cover" ? "selected" : ""
            }>Cover (penuh, bisa terpotong)</option>
          </select>
        </div>

        <div class="reader-setting-row">
          <div class="reader-setting-row__label">Rasio frame</div>
          <select class="reader-controls__select" data-setting="frameRatioMode">
            <option value="auto" ${
              currentSettings.frameRatioMode === "auto" ? "selected" : ""
            }>Auto (ikuti gambar, jarak rapat)</option>
            <option value="uniform" ${
              currentSettings.frameRatioMode === "uniform" ? "selected" : ""
            }>Uniform (semua sama)</option>
          </select>
          <div class="reader-progress" style="text-align:left;">
            Gunakan Auto untuk halaman kotak/lebar agar tidak ada ruang kosong besar.
          </div>
        </div>
      </div>
    </div>
  `;

  function close() {
    overlay.remove();
    document.body.classList.remove("reader-settings-open");
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  overlay.querySelector('[data-action="close"]')?.addEventListener("click", close);

  overlay.querySelector('[data-setting="zoomPct"]')?.addEventListener("input", (e) => {
    const value = Number(e.target.value) || 100;
    overlay.querySelector('[data-label="zoomPct"]').textContent = String(value);
    onChange({ ...currentSettings, zoomPct: value });
  });

  overlay.querySelector('[data-setting="equalize"]')?.addEventListener("change", (e) => {
    onChange({ ...currentSettings, equalize: Boolean(e.target.checked) });
  });

  overlay.querySelector('[data-setting="fit"]')?.addEventListener("change", (e) => {
    onChange({ ...currentSettings, fit: String(e.target.value || "contain") });
  });

  overlay
    .querySelector('[data-setting="frameRatioMode"]')
    ?.addEventListener("change", (e) => {
      onChange({
        ...currentSettings,
        frameRatioMode: String(e.target.value || "auto"),
      });
    });

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") close();
    },
    { once: true },
  );

  return overlay;
}

function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || "";
}

function setYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = String(str ?? "");
  return div.innerHTML;
}

function applyBrandingOcs(data) {
  const ocs = Array.isArray(data?.branding?.ocs) ? data.branding.ocs : [];
  if (!ocs.length) return;

  const left = ocs.find((o) => o.position === "left") || ocs[0];
  const right = ocs.find((o) => o.position === "right") || ocs[1] || ocs[0];

  const brandLeft = document.querySelector(".brand-oc__img--left");
  const brandRight = document.querySelector(".brand-oc__img--right");
  if (brandLeft && left?.image) brandLeft.src = left.image;
  if (brandRight && right?.image) brandRight.src = right.image;
}

async function loadData() {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`Gagal memuat data: ${res.status}`);
  return res.json();
}

function readerHref(id, chapterNumber) {
  const ch = Number(chapterNumber) || 1;
  return `reader.html?id=${encodeURIComponent(id)}&ch=${encodeURIComponent(String(ch))}`;
}

function detailHref(id) {
  return `detail.html?id=${encodeURIComponent(id)}`;
}

function getChapters(manga) {
  return Array.isArray(manga?.chapters) ? manga.chapters : [];
}

function pickRecommendations(list, current) {
  const all = Array.isArray(list) ? list : [];
  if (!current || !current.id) return all.slice(0, 3);

  const curGenres = new Set(Array.isArray(current.genres) ? current.genres : []);
  const curSeries = current.series ? String(current.series) : "";

  function score(m) {
    if (!m || m.id === current.id) return -9999;
    let s = 0;
    if (curSeries && m.series && String(m.series) === curSeries) s += 6;
    const gs = Array.isArray(m.genres) ? m.genres : [];
    let overlap = 0;
    for (const g of gs) if (curGenres.has(g)) overlap += 1;
    s += overlap * 2;
    const t = new Date(m?.updatedAt || 0).getTime();
    if (Number.isFinite(t)) s += Math.min(3, Math.max(0, (t / 1e13) | 0));
    return s;
  }

  return all
    .filter((m) => m && m.id !== current.id)
    .slice()
    .sort((a, b) => score(b) - score(a))
    .slice(0, 3);
}

function renderRecommendations(current, list) {
  const section = document.getElementById("reader-reco");
  const grid = document.getElementById("reader-reco-grid");
  const meta = document.getElementById("reader-reco-meta");
  if (!section || !grid) return;

  const picks = pickRecommendations(list, current);
  if (!picks.length) {
    section.hidden = true;
    grid.innerHTML = "";
    return;
  }

  section.hidden = false;
  if (meta) meta.textContent = "Kalau masih ingin lanjut baca, coba ini.";

  grid.innerHTML = picks
    .map((m) => {
      const title = escapeHtml(m.title || "Manga");
      const href = detailHref(m.id);
      const cover = escapeHtml(m.cover || "");
      return `
        <article class="reco-card">
          <a class="reco-card__link" href="${href}"
            data-manga-id="${escapeHtml(m.id)}"
            data-manga-title="${escapeHtml(m.title)}"
            data-track-source="reader_reco"
            aria-label="${title}">
            <div class="reco-card__cover">
              <img src="${cover}" alt="" loading="lazy" />
            </div>
            <div class="reco-card__body">
              <h3 class="reco-card__title">${title}</h3>
            </div>
          </a>
        </article>
      `;
    })
    .join("");
}

function filterSuggestions(list, query) {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((m) => String(m.title).toLowerCase().includes(q));
}

function setupSearch(mangaList) {
  const input = document.getElementById("manga-search");
  if (!input || !mangaList.length) return;

  const wrap = input.closest(".navbar__search-wrap");
  if (wrap) wrap.classList.add("navbar__search-wrap--dropdown");

  let box = document.getElementById("search-suggest");
  if (!box && wrap) {
    box = document.createElement("div");
    box.id = "search-suggest";
    box.className = "search-suggest";
    box.setAttribute("role", "listbox");
    wrap.appendChild(box);
  }

  function closeBox() {
    if (!box) return;
    box.classList.remove("is-open");
    box.innerHTML = "";
  }

  function openBox(html) {
    if (!box) return;
    box.innerHTML = html;
    box.classList.toggle("is-open", Boolean(html));
  }

  input.addEventListener("input", () => {
    const q = input.value;
    const hits = filterSuggestions(mangaList, q).slice(0, 8);
    if (!q.trim() || !hits.length) {
      closeBox();
      return;
    }
    const html = hits
      .map(
        (m) =>
          `<a class="search-suggest__item" role="option" href="${detailHref(
            m.id,
          )}" data-manga-id="${escapeHtml(m.id)}" data-manga-title="${escapeHtml(
            m.title,
          )}" data-track-source="search_suggest">${escapeHtml(m.title)}</a>`,
      )
      .join("");
    openBox(html);
  });

  document.addEventListener("click", (e) => {
    if (box && !box.contains(e.target) && e.target !== input) closeBox();
  });
}

function clampChapter(ch, chapters) {
  const numbers = chapters
    .map((c) => Number(c?.number))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
  if (!numbers.length) return 1;

  const requested = Number(ch);
  if (Number.isFinite(requested) && numbers.includes(requested))
    return requested;
  return numbers[0];
}

function buildImageUrl(manga, chapterNumber, pageNumber) {
  const chapter = manga.chapters.find(
    (c) => Number(c.number) === Number(chapterNumber),
  );

  if (!chapter || !chapter.folder) return "";

  // kalau file kamu 1.png, 2.png
  // return `${chapter.folder}${pageNumber}.png`;
  // return `${chapter.folder}${pageNumber}.png`;
  // return `${chapter.folder}${pageNumber - 1}.png`;
  // kalau kamu pakai p01.png, aktifkan ini:
  // return `${chapter.folder}p${String(pageNumber).padStart(2, "0")}.png`;
}

function renderPages(container, manga, chapterNumber, pages) {
  container.innerHTML = "";

  const chapter = manga.chapters.find(
    (c) => Number(c.number) === Number(chapterNumber),
  );

  const base = chapter.folder;

  // DETECT apakah 0.png ada
  const testImg = new Image();
  testImg.src = `${base}0.png`;

  testImg.onload = () => {
    // ✅ mulai dari 0
    renderWithStart(0);
  };

  testImg.onerror = () => {
    // ❌ mulai dari 1
    renderWithStart(1);
  };

  const formats = ["png", "jpg", "jpeg", "webp"];

  function getImageSrc(base, pageNumber) {
    return new Promise((resolve) => {
      let i = 0;

      function tryNext() {
        if (i >= formats.length) {
          resolve(""); // kalau semua gagal
          return;
        }

        const ext = formats[i];
        const test = new Image();
        test.src = `${base}${pageNumber}.${ext}`;

        test.onload = () => resolve(test.src);
        test.onerror = () => {
          i++;
          tryNext();
        };
      }

      tryNext();
    });
  }

  function renderWithStart(start) {
    for (let i = 0; i < pages; i++) {
      const pageNumber = i + start;

      const frame = document.createElement("div");
      frame.className = "reader-page-frame";

      const img = document.createElement("img");
      img.loading = "lazy";
      img.className = "reader-page-img is-loading";
      img.id = `page-${i + 1}`;
      img.dataset.page = i + 1;
      img.alt = `Halaman ${i + 1}`;

      const msg = document.createElement("div");
      msg.className = "reader-page-msg";
      msg.textContent = "Gagal memuat gambar.";

      img.addEventListener("load", () => {
        img.classList.remove("is-loading");
        img.classList.remove("is-error");

        // Auto ratio: sesuaikan frame dengan rasio gambar agar tidak ada ruang kosong besar
        // saat halaman tidak portrait (kotak / landscape).
        // Uniform ratio tetap menggunakan CSS aspect-ratio global.
        if (
          document.body.classList.contains("reader-equalize") &&
          !document.body.classList.contains("reader-equalize-uniform") &&
          img.naturalWidth &&
          img.naturalHeight
        ) {
          frame.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
        }
      });

      img.addEventListener("error", () => {
        img.classList.remove("is-loading");
        img.classList.add("is-error");
      });

      getImageSrc(base, pageNumber).then((src) => {
        if (!src) {
          img.classList.remove("is-loading");
          img.classList.add("is-error");
          img.removeAttribute("src");
          return;
        }
        img.src = src;
      });

      frame.appendChild(img);
      frame.appendChild(msg);
      container.appendChild(frame);
    }
  }
}

// ✅ TARUH DI SINI
function enablePageMode(container) {
  const imgs = Array.from(container.querySelectorAll("img"));

  let current = 0;

function showPage(index) {
  imgs.forEach((img, i) => {
    img.style.display = i === index ? "block" : "none";
  });

  current = index;

  // ✅ UPDATE PROGRESS BAR
  const percent = ((index + 1) / imgs.length) * 100;
  const bar = document.getElementById("reader-progress-fill");
  if (bar) bar.style.width = percent + "%";

  // ✅ UPDATE TEXT PAGE
  const progressText = document.getElementById("reader-progress");
  if (progressText) {
    progressText.textContent = `Page ${index + 1} / ${imgs.length}`;
  }
}

  showPage(0);

  container.addEventListener("click", (e) => {
    const half = window.innerWidth / 2;

    if (e.clientX > half) {
      if (current < imgs.length - 1) showPage(current + 1);
    } else {
      if (current > 0) showPage(current - 1);
    }
  });
}

function setupPageNavigator(container) {
  let currentPage = 1;

  const imgs = Array.from(container.querySelectorAll(".reader-page-img"));

  function updateCurrentPage() {
    let closest = 0;
    let minOffset = Infinity;

    imgs.forEach((img, i) => {
      const rect = img.getBoundingClientRect();
      const offset = Math.abs(rect.top);

      if (offset < minOffset) {
        minOffset = offset;
        closest = i + 1;
      }
    });

    currentPage = closest;
  }

  window.addEventListener("scroll", updateCurrentPage, { passive: true });

  function scrollToPage(page) {
    const target = imgs[page - 1];
    if (!target) return;

    currentPage = page;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return {
    getCurrentPage: () => currentPage,
    scrollToPage,
  };
}

function renderError(message) {
  const container = document.getElementById("reader-pages");
  const hint = document.getElementById("reader-hint");
  if (container) {
    container.innerHTML = `<p class="empty-state">${escapeHtml(message)}</p>`;
  }
  if (hint) hint.textContent = "Gunakan server lokal untuk membuka proyek ini.";
}

function init() {
  setYear();
  const initialSettings = normalizeReaderSettings(loadReaderSettings());
  let currentSettings = applyReaderSettings(initialSettings) || initialSettings;

  const id = getParam("id");
  const chParam = getParam("ch");

  const pagesEl = document.getElementById("reader-pages");
  const titleEl = document.getElementById("reader-title");
  const hintEl = document.getElementById("reader-hint");
  const backEl = document.getElementById("reader-back");

  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");
  const actionBackBtn = document.getElementById("action-back");
  const nextChapterBtn = document.getElementById("next-chapter");
  const chapterSelect = document.getElementById("chapter-select");
  const modeBtn = document.getElementById("mode-toggle");
  const settingsBtn = document.getElementById("reader-settings-open");

  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      document.body.classList.add("reader-settings-open");

      const overlay = createReaderSettingsModal(currentSettings, (next) => {
        currentSettings = applyReaderSettings(next) || currentSettings;
        saveReaderSettings(currentSettings);
      });

      document.body.appendChild(overlay);
    });
  }

  if (modeBtn) {
    modeBtn.textContent = `Mode: ${readingMode === "scroll" ? "Scroll" : "Page"}`;

    modeBtn.addEventListener("click", () => {
      readingMode = readingMode === "scroll" ? "page" : "scroll";

      localStorage.setItem("readingMode", readingMode);

      location.reload(); // biar simpel
    });
  }

  if (!pagesEl || !titleEl || !hintEl || !backEl || !chapterSelect) return;

  if (!id) {
    renderError("Manga tidak ditemukan (parameter id kosong).");
    return;
  }

  loadData()
    .then((data) => {
      applyBrandingOcs(data);

      const list = Array.isArray(data?.manga) ? data.manga : [];
      setupSearch(list);
      const manga = list.find((m) => m.id === id);
      if (!manga) {
        renderError("Manga tidak ada di katalog.");
        return;
      }

      const chapters = getChapters(manga);
      const chapterNumber = clampChapter(chParam, chapters);

      if (
        window.MangaAnalytics &&
        typeof window.MangaAnalytics.trackChapterRead === "function"
      ) {
        window.MangaAnalytics.trackChapterRead({
          mangaId: manga.id,
          mangaTitle: manga.title,
          chapter: chapterNumber,
        });
      }
      const chapter =
        chapters.find((c) => Number(c?.number) === Number(chapterNumber)) ||
        chapters[0];
      const pages = Number(chapter?.pages) || 0;

      document.title = `${manga.title} — Chapter ${chapterNumber} — Reader`;
      titleEl.textContent = `${manga.title} — Chapter ${chapterNumber}`;
      hintEl.textContent =
        "Scroll vertikal untuk membaca. Gunakan tombol untuk lompat halaman/chapter.";

      backEl.href = detailHref(manga.id);
      if (actionBackBtn) {
        actionBackBtn.href = detailHref(manga.id);
      }

      // Chapter select
      chapterSelect.innerHTML = chapters
        .slice()
        .sort((a, b) => Number(a?.number) - Number(b?.number))
        .map((c) => {
          const n = Number(c?.number) || 1;
          const selected = n === Number(chapterNumber) ? " selected" : "";
          return `<option value="${escapeHtml(String(n))}"${selected}>Chapter ${escapeHtml(
            String(n),
          )}</option>`;
        })
        .join("");

      chapterSelect.addEventListener("change", () => {
        const nextCh = Number(chapterSelect.value) || 1;
        window.location.href = readerHref(manga.id, nextCh);
      });

      if (!pages) {
        renderError("Chapter tidak memiliki halaman.");
        return;
      }

      renderPages(pagesEl, manga, chapterNumber, pages);
      renderRecommendations(manga, list);
      setTimeout(() => {
        if (readingMode === "page") {
          enablePageMode(pagesEl);
        }
      }, 300);

      setTimeout(() => {
        const nav = setupPageNavigator(pagesEl);
        const progressEl = document.getElementById("reader-progress");

        function updateUI() {
          const cur = nav.getCurrentPage();

          titleEl.textContent = `${manga.title} — Chapter ${chapterNumber} (Page ${cur}/${pages})`;

          if (progressEl) {
            progressEl.textContent = `Page ${cur} / ${pages}`;
          }
        }

        updateUI();

        window.addEventListener("scroll", updateUI, { passive: true });

        if (prevBtn) {
          prevBtn.addEventListener("click", () => {
            const cur = nav.getCurrentPage();
            nav.scrollToPage(Math.max(1, cur - 1));
          });
        }

        if (nextBtn) {
          nextBtn.addEventListener("click", () => {
            const cur = nav.getCurrentPage();
            nav.scrollToPage(Math.min(pages, cur + 1));
          });
        }
      }, 300);

      const sortedChapters = chapters
        .map((c) => Number(c?.number))
        .filter((n) => Number.isFinite(n))
        .sort((a, b) => a - b);
        
      const currentIndex = sortedChapters.indexOf(Number(chapterNumber));
      const prevChapterNum = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
      const nextChapterNum = currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null;



      if (nextChapterBtn) {
        if (nextChapterNum !== null) {
          nextChapterBtn.style.display = "inline-flex";
          nextChapterBtn.addEventListener("click", () => {
            window.location.href = readerHref(manga.id, nextChapterNum);
          });
        } else {
          nextChapterBtn.style.display = "none";
        }
      }
    })
    .catch((err) => {
      console.error(err);
      renderError(
        "Tidak dapat memuat data. Gunakan server lokal untuk membuka proyek ini.",
      );
    });

    window.addEventListener("scroll", updateProgressBar);
}

function handleControlsPosition() {
  const controls = document.querySelector(".reader-controls");
  const stopEl = document.getElementById("reader-end");
  const footer = document.querySelector(".site-footer");

  if (!controls || (!stopEl && !footer)) return;
  if (controls.classList.contains("is-hidden")) return;

  const stopRect = stopEl ? stopEl.getBoundingClientRect() : null;
  const footerRect = footer ? footer.getBoundingClientRect() : null;
  const windowHeight = window.innerHeight;

  const topTarget = stopRect ? stopRect.top : footerRect ? footerRect.top : windowHeight + 9999;
  if (topTarget < windowHeight) {
    const overlap = windowHeight - topTarget;
    controls.style.setProperty("--reader-y-offset", `-${overlap + 16}px`);
  } else {
    controls.style.setProperty("--reader-y-offset", "0px");
  }
}

window.addEventListener("scroll", handleControlsPosition, { passive: true });
window.addEventListener("resize", handleControlsPosition);

// Hide controls when scrolling down for comfortable reading.
// Press `Esc` to force-show (anti-bug / recovery).
let lastScrollY = window.scrollY;
let controlsHidden = false;

function updateControlsVisibilityOnScroll() {
  const controls = document.querySelector(".reader-controls");
  if (!controls) return;

  const y = window.scrollY || 0;
  const scrollingDown = y > lastScrollY;
  const shouldHide = scrollingDown && y > 180;

  if (shouldHide && !controlsHidden) {
    controlsHidden = true;
    controls.classList.add("is-hidden");
  } else if (!shouldHide && controlsHidden) {
    controlsHidden = false;
    controls.classList.remove("is-hidden");
    // reset offset so it doesn't stay shifted
    controls.style.setProperty("--reader-y-offset", "0px");
    handleControlsPosition();
  }

  lastScrollY = y;
}

window.addEventListener("scroll", updateControlsVisibilityOnScroll, { passive: true });
window.addEventListener("resize", updateControlsVisibilityOnScroll);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const controls = document.querySelector(".reader-controls");
    if (!controls) return;
    controlsHidden = false;
    controls.classList.remove("is-hidden");
    controls.style.setProperty("--reader-y-offset", "0px");
    handleControlsPosition();
  }
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

function updateProgressBar() {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;

  const percent = (scrollTop / docHeight) * 100;

  const bar = document.getElementById("reader-progress-fill");
  if (bar) bar.style.width = percent + "%";
}
