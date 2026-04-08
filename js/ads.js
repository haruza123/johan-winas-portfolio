/**
 * Ads popup (entry modal)
 * - Tampil saat user pertama masuk (sekali per hari)
 * - Klik gambar membuka link sponsor
 * - Mengikuti tema (pakai CSS variables)
 */

(function () {
  const STORAGE_KEY = "jwtl_ad_hide_until";

  /**
   * Toggle iklan (true = ON, false = OFF)
   * Kamu bisa matikan kapan saja tanpa hapus kode.
   */
  const ADS_ENABLED = true;

  // Data iklan (sesuai yang kamu kasih)
  const AD = {
    imageUrl: "./image/ads/iklan.png",
    linkUrl: "https://mrbigbarbershop.my.id/",
    delayMs: 900,
  };

  function now() {
    return Date.now();
  }

  function getHideUntil() {
    try {
      return Number(localStorage.getItem(STORAGE_KEY)) || 0;
    } catch {
      return 0;
    }
  }

  function setHideUntil(untilMs) {
    try {
      localStorage.setItem(STORAGE_KEY, String(untilMs));
    } catch {
      // ignore
    }
  }

  function endOfTodayMs() {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }

  function shouldShow() {
    if (!ADS_ENABLED) return false;
    if (!AD.imageUrl || !AD.linkUrl) return false;

    const path = String(window.location?.pathname || "").toLowerCase();

    // Hanya tampil di homepage.
    const isHome =
      path.endsWith("/") ||
      path.endsWith("/index.html") ||
      path === "index.html" ||
      path === "/index.html";
    if (!isHome) return false;

    return getHideUntil() < now();
  }

  function closeModal(overlay) {
    overlay?.remove();
    document.body?.classList.remove("ad-open");
  }

  function openModal() {
    if (document.getElementById("ad-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "ad-overlay";
    overlay.className = "ad-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Iklan sponsor");

    overlay.innerHTML = `
      <div class="ad-modal" role="document">
        <div class="ad-modal__head">
          <div class="ad-modal__badge">Sponsor</div>
          <button class="ad-modal__close" type="button" aria-label="Tutup iklan" data-action="close">×</button>
        </div>

        <a class="ad-modal__link" href="${AD.linkUrl}" target="_blank" rel="noopener noreferrer">
          <img class="ad-modal__img" src="${AD.imageUrl}" alt="Iklan sponsor" loading="eager" />
        </a>

        <div class="ad-modal__footer">
          <label class="ad-modal__check">
            <input type="checkbox" id="ad-hide-today" />
            Jangan tampilkan lagi hari ini
          </label>
          <div class="ad-modal__actions">
            <a class="btn btn--primary" href="${AD.linkUrl}" target="_blank" rel="noopener noreferrer">Kunjungi</a>
            <button class="btn btn--ghost" type="button" data-action="close">Tutup</button>
          </div>
        </div>
      </div>
    `;

    function onCloseRequested() {
      const hideToday = overlay.querySelector("#ad-hide-today")?.checked;
      if (hideToday) setHideUntil(endOfTodayMs());
      closeModal(overlay);
    }

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) onCloseRequested();
    });

    overlay.querySelectorAll('[data-action="close"]').forEach((btn) => {
      btn.addEventListener("click", onCloseRequested);
    });

    document.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Escape") onCloseRequested();
      },
      { once: true },
    );

    document.body.classList.add("ad-open");
    document.body.appendChild(overlay);
  }

  function init() {
    if (!shouldShow()) return;
    window.setTimeout(openModal, AD.delayMs);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
