const OC_DIALOG = {
  himori: {
    name: "Himori 🧡",
    messages: {
      empty: [
        "Eh... kosong? 😅",
        "Yah belum ada apa-apa nih~",
        "Masih sepi banget di sini 😭",
        "Kayaknya belum diterjemahin deh~",
        "Aku cari-cari juga gak nemu 😵",
        "Hmm... mungkin masih di raw 👀",
        "Belum ada... tapi bisa kita ubah itu 😉",
        "Kosong... tapi bukan berarti gak bisa diisi 😏",
      ],

      search: [
        (q) => `"${q}" belum ada loh 😭`,
        (q) => `Aku juga belum nemu "${q}"...`,
        (q) => `"${q}"? Hmm... belum masuk list 😅`,
        (q) => `Kayaknya "${q}" belum diterjemahin deh~`,
        (q) => `Aku udah cari "${q}"... tapi nihil 😵`,
        (q) => `"${q}" masih bersembunyi dari kita 👀`,
        (q) => `"${q}" belum muncul... mungkin nunggu kamu request 😉`,
        (q) => `Kalau kamu mau "${q}", bilang aja ya~ ✨`,
      ],
    },
  },

  ryou: {
    name: "Ryou 🖤",
    messages: {
      empty: [
        "Kosong.",
        "Tidak ada.",
        "Belum tersedia.",
        "Belum diterjemahkan.",
        "Masih nihil.",
        "Tidak ditemukan apa pun.",
        "Hanya kehampaan.",
        "Belum ada yang layak ditampilkan.",
      ],

      search: [
        (q) => `"${q}" tidak ditemukan.`,
        (q) => `Tidak ada hasil untuk "${q}".`,
        (q) => `"${q}" belum tersedia.`,
        (q) => `Belum ada terjemahan untuk "${q}".`,
        (q) => `"${q}"... tidak ada di sini.`,
        (q) => `Pencarian "${q}" gagal.`,
        (q) => `"${q}" masih di luar jangkauan.`,
        (q) => `Belum saatnya "${q}" muncul.`,
      ],
    },
  },
};

const SHORT_DIALOG = {
  himori: [
    "Ini tempat aku iseng-iseng nerjemahin hal kecil yang menarik~ ✨ Kadang cuma beberapa halaman, tapi tetap seru!",
    "Hehe~ ini kumpulan TL santai aku 😆 Pendek, random, tapi mungkin kamu bakal suka 😉",
    "Gak semua harus panjang kan? Di sini banyak yang ringan tapi tetap fun~ ✨",
  ],

  ryou: [
    "Terjemahan singkat. Tidak semuanya masuk katalog utama.",
    "Proyek kecil. Eksperimen. Tidak untuk semua orang.",
    "Singkat. Padat. Di luar jalur utama.",
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
