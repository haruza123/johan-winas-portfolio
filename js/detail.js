/**
 * Halaman detail — membaca ?id= dari URL dan menampilkan entri dari manga.json
 * Terhubung ke reader: reader.html?id=xxx&ch=1
 */

(function () {
  const DATA_URL = "data/manga.json";

  function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

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
        month: "long",
        year: "numeric",
      });
    } catch {
      return String(iso);
    }
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

  function renderError(message) {
    return `
      <div class="detail-error">
        <p>${escapeHtml(message)}</p>
        <p><a href="index.html">Buka katalog</a></p>
      </div>
    `;
  }

  function renderTags(tags) {
    if (!Array.isArray(tags) || !tags.length) return "";
    const html = tags.map((t) => `<li>${escapeHtml(t)}</li>`).join("");
    return `<ul class="detail-tags">${html}</ul>`;
  }

  function renderChapters(manga) {
    const chapters = Array.isArray(manga?.chapters) ? manga.chapters : [];
    if (!chapters.length) return "";

    const listHtml = chapters
      .slice()
      .sort((a, b) => Number(a?.number) - Number(b?.number))
      .map((ch) => {
        const number = Number(ch?.number) || 0;
        const pages = Number(ch?.pages) || 0;
        return `
          <a class="chapter-item" href="${readerHref(manga.id, number)}">
            <div class="chapter-item__left">
              <p class="chapter-item__title">Chapter ${escapeHtml(String(number))}</p>
              <p class="chapter-item__meta">${escapeHtml(String(pages))} halaman</p>
            </div>
            <span class="detail-badge detail-badge--accent">Baca</span>
          </a>
        `;
      })
      .join("");

    return `
      <section class="chapter-panel" id="chapters" aria-labelledby="chapters-title">
        <div class="chapter-panel__head">
          <h2 class="chapter-panel__title" id="chapters-title">Chapter</h2>
          <p class="chapter-panel__meta">${escapeHtml(String(chapters.length))} chapter</p>
        </div>
        <div class="chapter-list">${listHtml}</div>
      </section>
    `;
  }
  function renderMetaExtra(m) {
    const series = m.series
      ? `<span class="detail-badge detail-badge--accent">${escapeHtml(m.series)}</span>`
      : "";

    const genres = Array.isArray(m.genres)
      ? m.genres
          .map((g) => `<span class="detail-badge">${escapeHtml(g)}</span>`)
          .join("")
      : "";

    return `<div style="margin:8px 0; display:flex; gap:6px; flex-wrap:wrap;">
    ${series}
    ${genres}
  </div>`;
  }

  function renderDetail(m) {
    const status = m.status
      ? `<span class="detail-badge">${escapeHtml(m.status)}</span>`
      : "";
    const latest = getLatestChapterNumber(m);
    const chBadge = latest
      ? `<span class="detail-badge detail-badge--accent">Bab ${escapeHtml(String(latest))}</span>`
      : "";
    const updated = m.updatedAt
      ? `<span class="detail-badge">Diperbarui ${escapeHtml(formatDate(m.updatedAt))}</span>`
      : "";

    return `
      <article class="detail-hero">
        <div class="detail-cover">
          <img src="${escapeHtml(m.cover)}" alt="" width="240" height="320" />
        </div>
        <div class="detail-body">
          <h1 class="detail-title">${escapeHtml(m.title)}</h1>
          <div class="detail-meta">${status}${chBadge}${updated}</div>
          ${renderTags(m.tags)}
          <p class="detail-desc">${escapeHtml(m.description || "")}</p>
          ${
            m.artist
              ? `
  <p class="detail-artist">
    🎨 Art by 
    <a href="${m.artist.url}" target="_blank">
      ${escapeHtml(m.artist.name)}
    </a>
  </p>
`
              : ""
          }
          <div class="detail-actions">
            <a class="btn btn--primary" href="${readerHref(m.id, 1)}">Mulai Baca</a>
            <a class="btn btn--ghost" href="#chapters">Lihat Chapter</a>
          </div>
        </div>
      </article>
      ${renderChapters(m)}
      ${renderMetaExtra(m)}
    `;
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
            `<a class="search-suggest__item" role="option" href="detail.html?id=${encodeURIComponent(
              m.id,
            )}">${escapeHtml(m.title)}</a>`,
        )
        .join("");
      openBox(html);
    });

    document.addEventListener("click", (e) => {
      if (box && !box.contains(e.target) && e.target !== input) closeBox();
    });
  }

  function init() {
    const root = document.getElementById("detail-root");
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    const id = getParam("id");
    if (!id) {
      if (root) root.innerHTML = renderError("Judul tidak ditemukan.");
      return;
    }

    fetch(DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error("Gagal memuat data");
        return r.json();
      })
      .then((data) => {
        applyBrandingOcs(data);

        const list = Array.isArray(data?.manga) ? data.manga : [];
        setupSearch(list);

        const found = list.find((m) => m.id === id);
        if (!found) {
          if (root) root.innerHTML = renderError("Judul tidak ada di katalog.");
          return;
        }

        document.title = `${found.title} — Johan Winas TL`;
        const meta = document.querySelector('meta[name="description"]');
        if (meta && found.description) {
          meta.setAttribute(
            "content",
            found.description.slice(0, 160).replace(/\s+/g, " ").trim(),
          );
        }

        if (root) root.innerHTML = renderDetail(found);
      })
      .catch(() => {
        if (root) {
          root.innerHTML = renderError(
            "Tidak dapat memuat data. Gunakan server lokal untuk membuka proyek ini.",
          );
        }
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

console.log(`${chapter.folder}/${page}.png`);
