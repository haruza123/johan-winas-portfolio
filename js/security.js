(function () {
  /**
   * Security & Anti-Theft System
   */

  // --- CONFIG ---
  // Ubah ke false jika ingin mematikan fitur anti-screenshot/print screen
  const ENABLE_ANTI_SCREENSHOT = true;
  let violationCount = 0;
  // --------------

  // 1. Prevent Right Click on Images + Dialog
  //   const SECURITY_DIALOG = {
  //     himori: [
  //   "Eh... yang itu jangan diambil ya 😣",
  //   "Hehe~ lihat aja boleh, tapi jangan disimpan ya ✨",
  //   "Aku capek-capek nerjemahin... jadi jangan diambil ya 🥺",
  //   "Yang ini cuma buat dilihat kok, bukan dibawa pulang 😭",
  //   "Kalau suka, bilang aja... jangan langsung diambil 😣",
  // ],
  //     ryou: [
  //   "…serius mau diambil?",
  //   "Jangan.",
  //   "Nggak usah.",
  //   "Itu bukan buat kamu ambil.",
  //   "Kamu tau itu nggak boleh, kan?",
  //   "Cuma dilihat. Bukan disimpan.",
  //   "Kalau harus dibilangin terus, capek juga.",
  //   "Hargai sedikit usaha orang lain.",
  // ]
  //   };

  const SECURITY_DIALOG = {
    himori: {
      common: [
        "Eh... tangannya nakal ya, jangan diambil dong 😣",
        "Hehe~ lihat di sini aja ya? Jangan dibawa pulang ✨",
        "Aku capek nerjemahin ini... jangan diambil ya 🥺",
        "Cukup dilihat aja ya, kalau disimpan aku sedih 😭",
        "Jangan diculik ya gambarnya... biarin di sini aja 😣",
        "Baca di sini aja ya~ nanti aku update lagi ✨",
      ],

      rare: [
        "E-eh... kamu ngetes kesabaran aku ya? Aku beneran sedih loh... 🥺",
        "Tangan kamu nakal banget! Padahal aku udah begadang buat ini... 😭",
        "Ih... masih dicoba juga? Kamu jahat banget kalau beneran diambil 😣",
        "Ketahuan ya! Kamu lebih suka koleksi gambar daripada hargain aku? 🥺",
        "Aku udah kasih semuanya di sini... masa masih mau diculik juga? 😭✨",
        "Plis... jangan bikin aku trauma update lagi ya... 😣💔",
      ],
    },

    ryou: {
      common: [
        "…serius mau curi gambar ini?",
        "Tanganmu jangan sembarangan.",
        "Cuma boleh dilihat. Paham?",
        "Jangan coba-coba dibawa pulang.",
        "Hargai kerja keras orang lain. Jangan jadi maling.",
        "Nggak ada gunanya dicoba terus. Menyerah saja.",
        "Saya nggak suka mengulang kata-kata saya. Jangan.",
        "Lihat pakai mata, bukan pakai klik kanan.",
      ],

      rare: [
        "…masih nekat juga? Ternyata kamu tipe yang nggak bisa dibilangi baik-baik.",
        "Sudah dilarang tapi makin menantang. Kamu mau coba sejauh mana?",
        "Jangan paksa saya buat ambil tindakan lebih jauh. Berhenti sekarang.",
        "Niat banget mau nyuri? Usaha yang sia-sia, saya nggak akan lepasin.",
        "Hargai batas. Jangan sampai rasa hormat saya ke kamu hilang cuma gara-gara ini.",
        "Kamu pikir saya nggak tahu apa yang kamu coba lakukan? Lucu sekali.",
        "Satu klik lagi, dan saya pastikan kamu menyesal sudah mampir ke sini.",
      ],
    },
  };

  function pickDialog(poolObj) {
    const isRare = Math.random() < 0.1;
    const pool = isRare && poolObj.rare?.length ? poolObj.rare : poolObj.common;
    return {
      text: pool[Math.floor(Math.random() * pool.length)],
      isRare: isRare && poolObj.rare?.length > 0,
    };
  }

  function showSecurityDialog() {
    let modal = document.getElementById("security-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "security-modal";
      modal.style.cssText =
        "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;justify-content:center;align-items:center;z-index:9999;backdrop-filter:blur(3px);opacity:0;transition:opacity 0.2s ease;";

      const box = document.createElement("div");
      box.className = "oc-dialog__bubble"; // Reuse existing class logic implicitly
      box.style.cssText =
        "background:var(--bg-panel, #1e1e1e);color:var(--text-main, #ffffff);padding:24px;border-radius:12px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.5);max-width:80%;width:350px;transform:scale(0.9);transition:transform 0.2s ease;border: 1px solid var(--border-color, #333);";

      const nameEl = document.createElement("p");
      nameEl.id = "sec-modal-name";
      nameEl.style.cssText =
        "margin-bottom:12px;font-weight:bold;color:var(--brand-primary, #ffaa00);font-size:1.2rem;";

      const textEl = document.createElement("p");
      textEl.id = "sec-modal-text";
      textEl.style.cssText =
        "font-size:1rem;margin-bottom:24px;line-height:1.5;";

      const btn = document.createElement("button");
      btn.className = "btn btn--primary";
      btn.textContent = "Saya Mengerti";
      btn.style.cssText =
        "width:100%;padding:10px;border-radius:8px;font-weight:bold;cursor:pointer;background:var(--brand-primary, #ffaa00);color:#000;border:none;";

      btn.onclick = () => {
        modal.style.opacity = "0";
        box.style.transform = "scale(0.9)";
        setTimeout(() => (modal.style.display = "none"), 200);
      };

      box.appendChild(nameEl);
      box.appendChild(textEl);
      box.appendChild(btn);
      modal.appendChild(box);
      document.body.appendChild(modal);
    }

    const theme = document.body.dataset.theme || "dark";
    let type = theme === "light" ? "himori" : "ryou";
    let name = theme === "light" ? "Himori 🧡" : "Ryou 🖤";

    // adjust colors if needed based on theme
    const box = modal.querySelector("div");
    if (theme === "light") {
      box.style.background = "#ffffff";
      box.style.color = "#111111";
      box.style.borderColor = "#e0e0e0";
    } else {
      box.style.background = "#1e1e1e";
      box.style.color = "#ffffff";
      box.style.borderColor = "#333333";
    }

    // const pool = SECURITY_DIALOG[type];
    // const text = pool[Math.floor(Math.random() * pool.length)];
    const poolObj = SECURITY_DIALOG[type];
    const { text, isRare } = pickDialog(poolObj);

    document.getElementById("sec-modal-name").textContent = name;
    document.getElementById("sec-modal-text").textContent = text;

    // reset some styles incase it toggles theme
    document.getElementById("sec-modal-name").style.color =
      theme === "light" ? "#ff6b81" : "#ffaa00";
    box.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
    box.style.animation = "";

    if (isRare) {
      // Rare styling
      box.style.border =
        theme === "light" ? "2px solid #ff4757" : "2px solid #ffd700";
      box.style.boxShadow =
        theme === "light"
          ? "0 0 25px rgba(255, 71, 87, 0.5)"
          : "0 0 25px rgba(255, 215, 0, 0.5)";

      if (!document.getElementById("rare-anim-style")) {
        const rareStyle = document.createElement("style");
        rareStyle.id = "rare-anim-style";
        rareStyle.innerHTML = `
          @keyframes popRare {
            0% { transform: scale(0.9) rotate(-3deg); }
            50% { transform: scale(1.05) rotate(2deg); }
            100% { transform: scale(1) rotate(0); }
          }
        `;
        document.head.appendChild(rareStyle);
      }

      box.style.animation =
        "popRare 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      document.getElementById("sec-modal-name").textContent += " ✨ (RARE!)";
      document.getElementById("sec-modal-name").style.color =
        theme === "light" ? "#ff4757" : "#ffd700";
    }

    modal.style.display = "flex";
    // trigger reflow
    void modal.offsetWidth;
    modal.style.opacity = "1";
    box.style.transform = "scale(1)";
  }

  document.addEventListener("contextmenu", function (e) {
    if (e.target.tagName === "IMG") {
      e.preventDefault();
      showSecurityDialog();
    }
  });

  document.addEventListener("dragstart", function (e) {
    if (e.target.tagName === "IMG") {
      e.preventDefault();
    }
  });

  // 2. Anti-XSS & Basic Security (Prevent default Developer Tools shortcuts for casual users)
  // Note: This does not stop real hackers, but stops average users. Real XSS protection is having CSP in HTML.
  // document.addEventListener("keydown", function(e) {
  //   if (e.key === "F12" ||
  //      (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
  //      (e.ctrlKey && e.key === "U")) {
  //     e.preventDefault();
  //   }
  // });

  // 3. Anti-Screenshot (Deterrent)
  if (ENABLE_ANTI_SCREENSHOT) {
    // A. Mencegah screenshot via tombol Print Screen (Desktop)
    // Sulit dicegah 100% dari browser, tapi bisa dipersulit dengan mengosongkan clipboard
    document.addEventListener("keyup", function (e) {
      if (e.key === "PrintScreen") {
        navigator.clipboard.writeText(
          "Manga ini dilindungi. Dilarang mengambil screenshot.",
        );
        // Opsional: Bisa munculkan dialog OC juga di sini
        showSecurityDialog();
      }
    });

    // B. Mencegah touch and hold (Long Press) untuk save image di HP/Mobile
    const style = document.createElement("style");
    style.innerHTML = `
      img {
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
        -khtml-user-select: none; /* Konqueror HTML */
        -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
        pointer-events: auto; /* Bisa klik biasa, tapi long-press/drag dibatasi JS */
      }
    `;
    document.head.appendChild(style);
    // C. Mencegah Snipping Tool (Windows + Shift + S) & Tool Mac
    // Saat Windows Snipping Tool berjalan, browser akan kehilangan fokus (blur).
    // Layar akan di-blur/dihilangkan otomatis.
    // window.addEventListener('blur', function() {
    //   document.body.style.filter = 'blur(20px)';
    //   document.body.style.opacity = '0';
    // });

    // window.addEventListener('focus', function() {
    //   document.body.style.filter = 'none';
    //   document.body.style.opacity = '1';
    // });

    // Deteksi kombinasi tombol (Win+Shift+S / Cmd+Shift+3 atau 4)
    document.addEventListener("keydown", function (e) {
      if (
        (e.metaKey && e.shiftKey && e.key.toLowerCase() === "s") ||
        (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4"))
      ) {
        document.body.style.opacity = "0";
      }
    });

    document.addEventListener("keyup", function () {
      document.body.style.opacity = "1";
    });
  }

  // BFCache (Back/Forward Cache) Fix
  // Saat kembali lewat tombol Back, window bisa tersangkut di state "blur" / "opacity 0" dari listener di atas.
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) {
      document.body.style.filter = "none";
      document.body.style.opacity = "1";

      const loader = document.getElementById("page-loader");
      if (loader) {
        loader.style.opacity = "0";
        loader.style.display = "none";
      }
    }
  });
})();
