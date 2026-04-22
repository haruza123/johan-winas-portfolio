(function () {
  /**
   * Security & Anti-Theft System
   */

  // --- CONFIG ---
  // Ubah ke false jika ingin mematikan fitur anti-screenshot/print screen
  const ENABLE_ANTI_SCREENSHOT = false;
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
        "Eh! Tangannya nakal ya, mau 'foto' aku diem-diem? 😜",
        "Waaah! Jangan di-screenshot dong, nanti aku malu dilihat di luar... 🥺✨",
        "Hehe~ klik kanannya buat elus aku aja, jangan buat ambil gambar ya? 😉",
        "Aduhh! Jangan diculik lewat screenshot dong, biarin aku di sini aja... 😣",
        "Cukup dilihat pakai mata ya, jangan dibawa pulang ke galeri HP kamu... ✨🥺",
      ],
      rare: [
        "Kamu lebih suka koleksi gambar daripada hargain perasaan aku yang udah begadang? Jahat... 😭💔",
        "Kalau kamu curi terus, nanti aku trauma mau update lagi... Kamu mau aku pergi? 😣💔",
        "Plis... usaha aku jangan cuma dijadiin tumpukan file di HP kamu tanpa izin... sedih tau 🥺💔",
        "H-hey! Ketahuan ya! Ternyata kamu tipe yang suka 'ambil' paksa tanpa bilang-bilang? 😜🧡",
        "Setiap kali kamu coba save, semangat aku buat lanjutin bab depan rasanya hilang... 🥺💔",
      ],
    },

    ryou: {
      common: [
        "Simpan jarimu. Screenshot tidak akan bekerja di sini.",
        "Mau coba download? Usaha yang sia-sia di depanku.",
        "Lihat pakai mata, bukan pakai klik kanan. Paham?",
        "Hargai kerja keras orang lain. Jangan jadi maling rendahan.",
        "Jangan coba-coba membawa pulang apa yang sudah aku kunci.",
      ],
      rare: [
        "Kamu pikir sistemku selemah itu? Jangan meremehkan diriku. 🖤",
        "Satu percobaan lagi, dan aku pastikan akses kamu ke sini akan berakhir.",
        "Sudah dilarang tapi masih nekat? Ternyata kamu butuh 'disiplin' lebih keras. 💢",
        "Niat sekali mau mencuri? Percuma, aku tidak akan melepaskannya untukmu.",
        "Hargai batas yang aku buat, atau kamu akan menyesal sudah mampir ke sini.",
        "Kamu tipe yang tidak bisa dibilangi baik-baik, ya? Menarik... tapi berhenti sekarang. 🖤",
      ],
    },
  };

  // function pickDialog(poolObj) {
  //   const isRare = Math.random() < 0.1;
  //   const pool = isRare && poolObj.rare?.length ? poolObj.rare : poolObj.common;

  //   return {
  //     text: pool[Math.floor(Math.random() * pool.length)],
  //     isRare: isRare && poolObj.rare?.length > 0,
  //   };
  // }

  function pickDialog(poolObj) {
    violationCount++; // Setiap klik, counter naik

    let isRare = false;
    let pool = poolObj.common;

    // Logika Bertahap:
    // 1. Peluang acak murni (10%)
    const luckyShot = Math.random() < 0.1;

    // 2. Batas paksa (Pity system): Jika sudah klik 5x tapi belum dapat rare, paksa jadi rare
    if (luckyShot || violationCount >= 5) {
      if (poolObj.rare && poolObj.rare.length > 0) {
        isRare = true;
        pool = poolObj.rare;

        // --- BAGIAN RESET ---
        // Karena user sudah mendapatkan "Rare", kita reset hitungannya ke 0
        violationCount = 0;
        // --------------------
      }
    } else {
      // Jika belum beruntung dan belum 5x, kasih yang common
      isRare = false;
      pool = poolObj.common;
    }

    return {
      text: pool[Math.floor(Math.random() * pool.length)],
      isRare: isRare,
    };
  }

  function showSecurityDialog() {
    let modal = document.getElementById("security-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "security-modal";
      modal.className = "security-modal";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.setAttribute("aria-labelledby", "sec-modal-name");
      modal.style.display = "none";

      const box = document.createElement("div");
      box.className = "security-box";

      const nameEl = document.createElement("p");
      nameEl.id = "sec-modal-name";
      nameEl.className = "security-box__name";

      const rarityEl = document.createElement("p");
      rarityEl.id = "sec-modal-rarity";
      rarityEl.className = "security-box__rarity";

      const textEl = document.createElement("p");
      textEl.id = "sec-modal-text";
      textEl.className = "security-box__text";

      const btn = document.createElement("button");
      btn.className = "btn btn--primary";
      btn.textContent = "Saya Mengerti";
      btn.classList.add("security-box__btn");

      const close = () => {
        modal.classList.remove("is-open");
        window.setTimeout(() => {
          modal.style.display = "none";
        }, 220);
      };

      btn.onclick = close;

      modal.addEventListener("click", (e) => {
        if (e.target === modal) close();
      });

      box.appendChild(nameEl);
      box.appendChild(rarityEl);
      box.appendChild(textEl);
      box.appendChild(btn);
      modal.appendChild(box);
      document.body.appendChild(modal);
    }

    const theme = document.body.dataset.theme || "dark";
    let type = theme === "light" ? "himori" : "ryou";
    let name = theme === "light" ? "Himori \uD83E\uDDE1" : "Ryou \uD83D\uDDA4";

    // const pool = SECURITY_DIALOG[type];
    // const text = pool[Math.floor(Math.random() * pool.length)];
    const poolObj = SECURITY_DIALOG[type];
    const { text, isRare } = pickDialog(poolObj);

    document.getElementById("sec-modal-name").textContent = name;
    document.getElementById("sec-modal-text").textContent = text;

    const box =
      modal.querySelector(".security-box") || modal.querySelector("div");
    const rarityEl = document.getElementById("sec-modal-rarity");

    if (box) {
      box.dataset.rarity = isRare ? "rare" : "common";
      box.classList.remove("is-animating");
      void box.offsetWidth;
      box.classList.add("is-animating");
    }

    if (rarityEl) {
      rarityEl.textContent = isRare ? "RARE DROP \u2728" : "COMMON";
    }

    modal.style.display = "flex";
    // trigger reflow
    void modal.offsetWidth;
    modal.classList.add("is-open");
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
