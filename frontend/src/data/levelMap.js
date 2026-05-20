export const babList = [
  {
    key: "bab1",
    label: "BAB 1",
    title: "Kata Dasar",
    description: "Jenis-jenis kata dasar Bahasa Kaili",
    color: "green",
  },
  {
    key: "bab2",
    label: "BAB 2",
    title: "Kalimat",
    description: "Menyusun dan memahami kalimat",
    color: "blue",
  },
  {
    key: "bab3",
    label: "BAB 3",
    title: "Gambar",
    description: "Belajar kosakata melalui gambar",
    color: "purple",
  },
];

export const levelMap = {
  bab1: [
    {
      key: "kata-benda",
      title: "Kata benda",
      description: "Nama orang, tempat, benda, dan hal",
      keywords: ["kata benda", "benda", "barang", "adat", "rumah"],
    },
    {
      key: "kata-kerja",
      title: "Kata kerja",
      description: "Kata untuk tindakan atau aktivitas",
      keywords: ["kata kerja", "makan", "minum", "pergi", "ngande", "noinu", "nalau"],
    },
    {
      key: "kata-sifat",
      title: "Kata sifat",
      description: "Kata untuk keadaan atau sifat",
      keywords: ["kata sifat", "sopan", "baik", "besar", "kecil"],
    },
    {
      key: "kata-keterangan",
      title: "Kata keterangan",
      description: "Kata yang menerangkan waktu, tempat, atau cara",
      keywords: ["kata keterangan", "pagi", "malam", "di sini"],
    },
    {
      key: "kata-ganti",
      title: "Kata ganti",
      description: "Saya, kamu, dia, dan sejenisnya",
      keywords: ["kata ganti", "saya", "aku", "kamu", "dia", "yaku"],
    },
    {
      key: "kata-depan",
      title: "Kata depan",
      description: "Kata penghubung posisi atau arah",
      keywords: ["kata depan", "di", "ke", "dari"],
    },
    {
      key: "kata-sambung",
      title: "Kata sambung",
      description: "Kata penghubung antar kata atau kalimat",
      keywords: ["kata sambung", "dan", "atau", "tetapi"],
    },
    {
      key: "kata-bilangan",
      title: "Kata bilangan",
      description: "Angka dan jumlah",
      keywords: ["kata bilangan", "satu", "dua", "tiga"],
    },
    {
      key: "kata-seru",
      title: "Kata seru",
      description: "Kata untuk ungkapan emosi atau panggilan",
      keywords: ["kata seru", "halo", "wah"],
    },
    {
      key: "kata-sandang",
      title: "Kata Sandang",
      description: "Kata penentu atau pelengkap nomina",
      keywords: ["kata sandang", "si", "sang"],
    },
  ],
  bab2: [
    {
      key: "kalimat-sederhana",
      title: "Kalimat sederhana",
      description: "Mengenal pola kalimat dasar",
      keywords: ["kalimat", "nama saya", "apa kabar"],
    },
  ],
  bab3: [
    {
      key: "gambar-kosakata",
      title: "Gambar kosakata",
      description: "Menjawab kosakata berdasarkan gambar",
      keywords: ["gambar", "makan", "minum", "benda"],
    },
  ],
};

export const getBab = (babKey) => babList.find((bab) => bab.key === babKey);

export const getLevels = (babKey) => levelMap[babKey] || [];

export const getLevel = (babKey, levelKey) =>
  getLevels(babKey).find((level) => level.key === levelKey);

export const filterByLevel = (items, babKey, levelKey) => {
  const level = getLevel(babKey, levelKey);

  if (!level || !Array.isArray(items)) return items;

  // Khusus untuk BAB 1, lakukan pencocokan ketat (strict match) berdasarkan tipe/kategorinya
  if (babKey === "bab1") {
    const targetCategory = level.title.toLowerCase();
    const matched = items.filter(
      (item) => item.category && item.category.toLowerCase() === targetCategory
    );
    return matched.length > 0 ? matched : items;
  }

  // Untuk BAB lainnya, gunakan pencarian global berdasarkan kata kunci (keywords)
  const keywords = level.keywords.map((keyword) => keyword.toLowerCase());
  const matched = items.filter((item) => {
    const searchable = [
      item.indo,
      item.indonesia,
      item.kaili,
      item.tipe,
      item.category,
      item.question,
      item.answer,
      ...(item.options || []),
      ...(item.blocks || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return keywords.some((keyword) => searchable.includes(keyword));
  });

  return matched.length > 0 ? matched : items;
};
