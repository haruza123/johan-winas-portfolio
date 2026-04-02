/**
 * Reader — scroll vertikal (webtoon-style) + navigasi halaman/chapter.
 * Query:
 * - id: manga id
 * - ch: nomor chapter (1..n)
 */

const DATA_URL = "data/manga.json";

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
          `<a class="search-suggest__item" role="option" href="${detailHref(m.id)}">${escapeHtml(
            m.title,
          )}</a>`,
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

      const img = document.createElement("img");
      img.className = "reader-page-img";
      img.id = `page-${i + 1}`;
      img.dataset.page = i + 1;

      img.alt = `Halaman ${i + 1}`;
      getImageSrc(base, pageNumber).then((src) => {
        img.src = src;
      });

      container.appendChild(img);
    }
  }
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

  const id = getParam("id");
  const chParam = getParam("ch");

  const pagesEl = document.getElementById("reader-pages");
  const titleEl = document.getElementById("reader-title");
  const hintEl = document.getElementById("reader-hint");
  const backEl = document.getElementById("reader-back");

  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");
  const nextChapterBtn = document.getElementById("next-chapter");
  const chapterSelect = document.getElementById("chapter-select");

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
      const chapter =
        chapters.find((c) => Number(c?.number) === Number(chapterNumber)) ||
        chapters[0];
      const pages = Number(chapter?.pages) || 0;

      document.title = `${manga.title} — Chapter ${chapterNumber} — Reader`;
      titleEl.textContent = `${manga.title} — Chapter ${chapterNumber}`;
      hintEl.textContent =
        "Scroll vertikal untuk membaca. Gunakan tombol untuk lompat halaman/chapter.";

      backEl.href = detailHref(manga.id);

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

      // ⏳ tunggu gambar ke-render dulu
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

        // update awal
        updateUI();

        // update saat scroll
        window.addEventListener("scroll", updateUI, { passive: true });
      }, 300);

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

      if (nextChapterBtn) {
        const maxChapter = chapters.reduce(
          (acc, c) => Math.max(acc, Number(c?.number) || 0),
          0,
        );
        const nextChapter = Number(chapterNumber) + 1;
        nextChapterBtn.disabled = nextChapter > maxChapter;
        nextChapterBtn.addEventListener("click", () => {
          if (nextChapter > maxChapter) return;
          window.location.href = readerHref(manga.id, nextChapter);
        });
      }

      // Optional: update title when scrolling page
      window.addEventListener(
        "scroll",
        () => {
          const cur = nav.getCurrentPage();
          titleEl.textContent = `${manga.title} — Chapter ${chapterNumber} (Page ${cur}/${pages})`;
        },
        { passive: true },
      );
    })
    .catch((err) => {
      console.error(err);
      renderError(
        "Tidak dapat memuat data. Gunakan server lokal untuk membuka proyek ini.",
      );
    });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

console.log(`${chapter.folder}/${page}.png`);
