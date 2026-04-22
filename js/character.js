const OC_DIALOG = {
  himori: {
    name: "Himori 🧡",
    messages: {
      empty: [
        "Wah, masih kosong... Tapi tenang, aku bakal 'isi' kok pelan-pelan ✨",
        "Yah, belum ada apa-apa... Tapi ada aku di sini, nggak mau temenin dulu? 🥺🧡",
        "Hehe~ sabar ya, aku lagi nyiapin kejutan buat kamu di sini ✨",
        "Masih sepi... apa kita bikin 'rame' berdua aja di sini? 😜✨",
        "Kayaknya kamu datang terlalu cepat... aku belum siap pakai baju—eh, siapin konten! 😵",
        "Kosong ya? Sini, biar aku kasih senyuman aku dulu biar kamu nggak kecewa 😉🧡",
      ],

      search: [
        (q) =>
          `"${q}"? Aku cari ke mana-mana tetap nggak ada, kayak cintamu padaku... eh? 😭`,
        (q) =>
          `Duh, "${q}" belum ketemu. Apa mau aku usahain 'khusus' buat kamu? 😉✨`,
        (q) =>
          `"${q}" nggak ada... Tapi kalau kamu cari aku, aku selalu ada di sini kok 🧡`,
        (q) =>
          `Hmm, "${q}" ya? Hehe, aku belum ngerjain itu, tapi kalau kamu maksa... 😅✨`,
        (q) =>
          `Belum nemu "${q}"... Gimana kalau kita cari yang lain aja sambil berduaan? 😜`,
      ],
    },
  },

  ryou: {
    name: "Ryou 🖤",
    messages: {
      empty: [
        "Kosong. Jangan cuma bengong, cari sesuatu yang bisa aku kerjakan.",
        "Tidak ada apa-apa di sini. Kamu berharap menemukan sesuatu yang 'terlarang', ya?",
        "Masih nihil. Sabar sedikit, atau kamu mau aku 'disiplinkan' karena tidak sabar? 🖤",
        "Ruang kosong. Sepertinya kamu lebih suka menunggu daripada mencari yang lain.",
        "Tidak ada yang bisa dipamerkan sekarang. Kamu mau pamerkan sesuatu ke aku?",
        "Hasilnya nol. Sama seperti harapan kamu untuk menang dariku.",
      ],

      search: [
        (q) =>
          `"${q}"? Aku cari juga nggak ketemu. Memangnya itu penting buat kamu?`,
        (q) =>
          `Nol besar untuk "${q}". Coba cari judul yang lebih 'menantang' buatku.`,
        (q) =>
          `"${q}" tidak ada di katalogku. Kenapa tidak coba minta baik-baik ke ku? 🖤`,
        (q) => `Percuma cari "${q}". Apa menurutmu itu layak aku terjemahkan?`,
        (q) =>
          `Hasil pencarian "${q}" kosong. Jangan menyerah, aku suka orang yang gigih.`,
        (q) => `"${q}"? Sepertinya seleramu cukup sulit ya. Menarik juga.`,
      ],
    },
  },
};

const SHORT_DIALOG = {
  himori: [
    "Cuma satu halaman kok... tapi bisa bikin kamu kepikiran semalaman~ 😜🧡",
    "Lagi pengen yang 'singkat' tapi berkesan? Cek koleksi rahasiaku di FB yuk! ✨",
    "Ini tempat aku iseng sebentar... tapi aku ngerjainnya sambil bayangin kamu loh~ 😆🧡",
    "Jangan buru-buru, lihat yang pendek-pendek dulu di sini. Gemes banget tau! 😭✨",
    "Mampir ke FP aku yuk? Ada banyak yang 'lucu' dan mungkin... sedikit nakal? Hehe~ 😜",
    "Satu halaman aja nggak cukup kan? Sini, aku kasih lebih banyak di Facebook ✨",
  ],

  ryou: [
    "Singkat dan padat. Sama seperti waktu yang aku punya untuk melayani kamu.",
    "Hanya potongan kecil. Tapi kalau kamu nggak kuat, jangan coba-coba lihat.",
    "Cek di Facebook. Jangan manja, aku nggak akan menyuapi kamu terus-menerus.",
    "Kualitasnya aku jamin, meski cuma satu halaman. Mau bukti? Klik saja.",
    "Ini cuma proyek sampingan, tapi kalau kamu berani, coba intip isinya di FP. 🖤",
    "Sudah aku kumpulkan di sana. Cari sendiri kalau kamu memang punya niat.",
    "Sedikit tapi mematikan. Jangan protes kalau kamu ketagihan setelah membacanya.",
  ],
};

const DONATION_DIALOG = {
  himori: [
    "Uwaaa! Traktir aku es kopi yuk? Biar aku makin semangat ngetik buat kamu... ☕✨",
    "Satu donasi kecil dari kamu... bakal bikin aku senyum-senyum sendirian seharian loh 🥺✨",
    "Hehe~ kalau kamu support, aku janji bakal lebih 'rajin' lagi manjain kamu lewat konten baru 😆🧡",
    "Bantu aku beli camilan ya? Biar aku nggak bengong pas bayangin—eh, pas lagi TL maksudnya! 🍪😋",
    "Gak harus banyak kok... asal dari kamu, aku pasti bakal seneng banget menerimanya ✨🥺",
    "Kamu suka kan sama hasilnya? Kalau gitu, kasih aku sedikit 'imbalan' boleh ya? 🧡✨",
  ],
  ryou: [
    "Proyek ini butuh bahan bakar. Kamu tahu kan cara kerja dunia ini? Dukung kami.",
    "Suka hasilnya? Kalau begitu jaga ritme ku dengan sedikit dukungan. Jangan cuma gratisan.",
    "Sederhana saja: Ada dukungan, ada kemajuan. Kamu mau aku lanjut atau berhenti di sini?",
    "aku nggak suka basa-basi. Dukung kalau kamu memang ingin melihat lebih banyak dariku.",
    "Tanpa dukungan, jangan protes kalau aku mendadak hilang atau melambat. Paham?",
    "Mau lihat aku kerja lebih cepat? Tunjukkan loyalitasmu lewat kontribusi nyata.",
    "Jangan cuma jadi penonton pasif. Kontribusi kamu menentukan seberapa jauh aku akan melangkah.",
  ],
};

function getRandomOC() {
  const keys = Object.keys(OC_DIALOG);
  return OC_DIALOG[keys[Math.floor(Math.random() * keys.length)]];
}

function getDialog(type, query = "") {
  const oc = getRandomOC();
  const pool = oc.messages[type] || [];

  const msg = pool[Math.floor(Math.random() * pool.length)];

  return {
    name: oc.name,
    text: typeof msg === "function" ? msg(query) : msg,
  };
}
