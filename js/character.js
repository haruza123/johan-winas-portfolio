const OC_DIALOG = {
himori: {
  name: "Himori 🧡",
  messages: {
    empty: [
  "Waaah... kosong ya? 😅",
  "Yah... belum ada apa-apa 😭",
  "Eh? Kok nggak nemu apa-apa ya... 😵",
  "Hehe~ sabar ya, lagi aku isi pelan-pelan ✨",
  "Masih sepi nih... temenin aku dulu aja 😆",
  "Kayaknya belum ada... nanti aku tambahin ya 😉",
],

search: [
  (q) => `"${q}"? Aku cari juga belum nemu 😭`,
  (q) => `"${q}" belum ada di sini 😣`,
  (q) => `"${q}" kayaknya belum diterjemahin deh~`,
  (q) => `"${q}" belum muncul... mungkin nanti ya 👀`,
  (q) => `"${q}" nggak ada... tapi bisa aku usahain 😉`,
  (q) => `"${q}"? Hehe... aku belum ngerjain itu 😅`,
],
  },
},

  ryou: {
    name: "Ryou 🖤",
    messages: {
      empty: [
        "Kosong. Jangan cuma diam, cari yang lain.",
        "Nggak ada apa-apa di sini. Kamu salah tempat?",
        "Masih nihil. Saya belum sempat mengisinya.",
        "Belum ada. Jangan berharap muncul tiba-tiba.",
        "Ruang kosong. Sepertinya kamu datang terlalu awal.",
        "Tidak ada yang bisa dipamerkan untuk sekarang.",
      ],

      search: [
        (q) => `"${q}"? Saya cari juga nggak ketemu.`,
        (q) => `Nggak ada hasil buat "${q}". Coba lebih spesifik.`,
        (q) => `"${q}" tidak ada di katalog saya. Cari yang lain saja.`,
        (q) => `Pencarian "${q}" gagal. Jangan menyerah begitu saja.`,
        (q) => `"${q}" belum tersedia. Sabar sedikit kenapa?`,
        (q) => `Percuma cari "${q}". Memangnya itu layak diterjemahkan?`,
        (q) => `Hasil untuk "${q}" nol besar. Coba tantang saya dengan judul lain.`,
      ],
    },
  },
};

const SHORT_DIALOG = {
  himori: [
  "Eh, eh! Mampir ke FP aku yuk? Banyak yang lucu-lucu di sana ✨",
  "Ini tempat aku iseng sebentar~ tapi aku kerjain serius kok 😆🧡",
  "Nggak lama kok bacanya... coba deh lihat di FB 😉",
  "Kadang cuma satu halaman... tapi gemes banget 😭✨",
  "Hehe~ ini tempat rahasiaku... kamu mampir kan? 😜",
  "Lagi pengen yang ringan? Di sana banyak kok 😆✨",
],

  ryou: [
    "Terjemahan singkat. Cek langsung di Facebook, jangan manja.",
    "Ini cuma proyek sampingan. Ambil atau tinggalkan.",
    "Singkat dan padat. Langsung saja ke intinya.",
    "Cuma potongan kecil, tapi kualitasnya saya jamin.",
    "Kalau berani, coba baca hasil terjemahan saya di FB.",
    "Di luar jalur utama, tapi tetap patut kamu lirik.",
    "Sudah saya kumpulkan di FP. Cari sendiri kalau niat.",
  ]
};

const DONATION_DIALOG = {
    himori: [
  "Uwaaa! Traktir aku es kopi yuk? Biar aku makin semangat ngetiknya ☕✨",
  "Hehe~ kalau kamu support, aku jadi makin rajin 😆",
  "Satu donasi kecil dari kamu... aku bakal seneng banget 🥺✨",
  "Kalau kamu suka hasil terjemahanku... boleh ya bantu sedikit? 🥺",
  "Hehe~ bantu aku beli camilan ya, biar gak bengong pas TL 🍪😋",
  "Gak harus banyak kok... tapi beneran berarti buat aku ✨",
],
  ryou: [
    "Proyek ini butuh bahan bakar. Kamu tahu apa maksud saya.",
    "Suka hasilnya? Jaga ritme saya dengan sedikit dukungan.",
    "Sederhana saja: Ada dukungan, ada kemajuan. Mau?",
    "Saya nggak suka basa-basi. Dukung kalau mau lanjut.",
    "Tanpa dukungan, jangan protes kalau saya melambat.",
    "Kontribusi kamu itu dampak nyata. Jangan cuma jadi penonton.",
    "Mau lihat saya kerja lebih cepat? Tunjukkan dukunganmu.",
  ]
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
