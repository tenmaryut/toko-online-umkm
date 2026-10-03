import type { SpesifikasiSeni } from "../lib/product-art";

/**
 * Data demo Lumbung Kabut (merek fiktif). Semua produk, harga, dan pelanggan adalah contoh.
 * Deskripsi sengaja netral: tanpa klaim kesehatan dan tanpa nama indikasi geografis terdaftar.
 */

export const DATA_KATEGORI = [
  {
    slug: "kopi",
    name: "Kopi",
    description: "Biji dan bubuk kopi dari kebun di lereng, disangrai dalam jumlah kecil.",
  },
  {
    slug: "teh-rempah",
    name: "Teh & Rempah",
    description: "Teh daun, minuman rempah, dan rempah kering untuk minuman hangat.",
  },
  {
    slug: "camilan",
    name: "Camilan",
    description: "Keripik, kacang, dan kue kering buatan dapur rumahan.",
  },
  {
    slug: "sambal-bumbu",
    name: "Sambal & Bumbu",
    description: "Sambal botol, bumbu siap masak, dan pemanis untuk dapur sehari-hari.",
  },
  {
    slug: "kriya-dapur",
    name: "Kriya Dapur",
    description: "Perlengkapan dapur dan tas belanja buatan perajin sekitar.",
  },
] as const;

export type SlugKategori = (typeof DATA_KATEGORI)[number]["slug"];

export type DataProdukDemo = {
  slug: string;
  name: string;
  kategori: SlugKategori;
  price: number;
  stock: number;
  weightGrams: number;
  isFeatured?: boolean;
  description: string;
  seni: SpesifikasiSeni;
};

export const DATA_PRODUK: DataProdukDemo[] = [
  // ---------------- Kopi ----------------
  {
    slug: "kopi-arabika-lereng-pagi",
    name: "Kopi Arabika Lereng Pagi 200 g",
    kategori: "kopi",
    price: 78_000,
    stock: 24,
    weightGrams: 200,
    isFeatured: true,
    description:
      "Biji arabika sangrai sedang dengan aroma gula merah dan rasa asam segar yang ringan. Cocok diseduh manual dengan V60, tubruk, atau french press. Dikemas dalam kantong berkatup satu arah agar aromanya terjaga.",
    seni: { bentuk: "kantong", latar: "#DCE5D5", kemasan: "#C9A57A", label: "#34503B", aksen: "#F3E3C3", ikon: "biji" },
  },
  {
    slug: "kopi-robusta-kabut-tebal",
    name: "Kopi Robusta Kabut Tebal 250 g",
    kategori: "kopi",
    price: 52_000,
    stock: 40,
    weightGrams: 250,
    description:
      "Bubuk robusta sangrai gelap dengan rasa pahit cokelat yang tegas dan badan tebal. Pas untuk kopi susu atau kopi tubruk pagi hari. Digiling sedang.",
    seni: { bentuk: "kantong", latar: "#E9DCCB", kemasan: "#3B2A20", label: "#C98B4B", aksen: "#3B2A20", ikon: "biji" },
  },
  {
    slug: "kopi-tubruk-lumbung",
    name: "Kopi Tubruk Lumbung 500 g",
    kategori: "kopi",
    price: 68_000,
    stock: 18,
    weightGrams: 500,
    description:
      "Campuran robusta dan arabika yang digiling halus untuk seduhan tubruk. Kemasan besar untuk keluarga atau warung kopi kecil.",
    seni: { bentuk: "kantong", latar: "#F1E1D2", kemasan: "#9C4524", label: "#F6F2E9", aksen: "#9C4524", ikon: "lumbung" },
  },
  {
    slug: "kopi-arabika-proses-madu",
    name: "Kopi Arabika Proses Madu 200 g",
    kategori: "kopi",
    price: 92_000,
    stock: 6,
    weightGrams: 200,
    isFeatured: true,
    description:
      "Arabika proses madu (honey process) dengan rasa manis seperti karamel dan buah kering. Disangrai terang-sedang. Stoknya terbatas karena diproses dalam jumlah kecil.",
    seni: { bentuk: "kantong", latar: "#F5E6C4", kemasan: "#EFE6D2", label: "#D99A2B", aksen: "#5A3A1A", ikon: "biji" },
  },
  {
    slug: "drip-bag-arabika-isi-10",
    name: "Drip Bag Arabika isi 10",
    kategori: "kopi",
    price: 65_000,
    stock: 30,
    weightGrams: 120,
    description:
      "Sepuluh kantong saring sekali seduh, masing-masing berisi 12 g arabika giling. Tinggal sobek, gantungkan di cangkir, lalu tuang air panas sedikit demi sedikit.",
    seni: { bentuk: "kotak", latar: "#DDE3E6", kemasan: "#F6F2E9", label: "#34503B", aksen: "#F6F2E9", ikon: "biji" },
  },
  {
    slug: "kopi-gula-aren-siap-seduh",
    name: "Kopi Gula Aren Siap Seduh isi 10",
    kategori: "kopi",
    price: 45_000,
    stock: 0,
    weightGrams: 250,
    description:
      "Sepuluh sachet kopi bubuk dengan gula aren, cukup diseduh dengan air panas. Rasa manisnya tidak berlebihan.",
    seni: { bentuk: "sachet", latar: "#EADBC6", kemasan: "#7A4A2A", label: "#E8C07A", aksen: "#7A4A2A", ikon: "tetes" },
  },
  // ---------------- Teh & Rempah ----------------
  {
    slug: "teh-serai-jahe",
    name: "Teh Serai Jahe isi 20",
    kategori: "teh-rempah",
    price: 32_000,
    stock: 35,
    weightGrams: 60,
    isFeatured: true,
    description:
      "Teh celup berisi campuran serai dan jahe kering. Aromanya segar dan hangat, enak diminum sore hari dengan sedikit madu atau gula batu.",
    seni: { bentuk: "kotak", latar: "#E4ECD9", kemasan: "#6E8B4E", label: "#F6F2E9", aksen: "#4C6A36", ikon: "daun" },
  },
  {
    slug: "wedang-rempah-kering",
    name: "Wedang Rempah Kering isi 5",
    kategori: "teh-rempah",
    price: 38_000,
    stock: 20,
    weightGrams: 150,
    description:
      "Paket rempah kering berisi jahe, kayu manis, cengkih, kapulaga, kayu secang, dan serai untuk lima kali seduh. Rebus satu paket dengan 500 ml air selama 10 menit.",
    seni: { bentuk: "plastik", latar: "#F2DCD0", kemasan: "#B4492F", label: "#F6F2E9", aksen: "#8A2F1C", ikon: "rempah" },
  },
  {
    slug: "jahe-merah-instan",
    name: "Jahe Merah Instan 250 g",
    kategori: "teh-rempah",
    price: 35_000,
    stock: 28,
    weightGrams: 250,
    description:
      "Serbuk jahe merah dengan gula tebu. Larutkan dua sendok teh dalam segelas air panas. Rasa pedas jahenya cukup kuat.",
    seni: { bentuk: "toples", latar: "#F4E2D8", kemasan: "#C4703F", label: "#7E361B", aksen: "#F6F2E9", ikon: "jahe" },
  },
  {
    slug: "teh-hijau-daun-kabut",
    name: "Teh Hijau Daun Kabut 100 g",
    kategori: "teh-rempah",
    price: 42_000,
    stock: 15,
    weightGrams: 100,
    description:
      "Daun teh hijau kering yang digulung, dari kebun di dataran tinggi. Seduh dengan air sekitar 80°C selama dua menit agar tidak pahit.",
    seni: { bentuk: "kaleng", latar: "#DCE8E1", kemasan: "#2F5D50", label: "#E3EFE7", aksen: "#2F5D50", ikon: "daun" },
  },
  {
    slug: "kayu-manis-batang",
    name: "Kayu Manis Batang 100 g",
    kategori: "teh-rempah",
    price: 24_000,
    stock: 50,
    weightGrams: 100,
    description:
      "Batang kayu manis kering untuk minuman, kolak, atau rendaman teh. Simpan di wadah tertutup agar aromanya awet.",
    seni: { bentuk: "kantong", latar: "#EFE0CF", kemasan: "#B98552", label: "#5B3A22", aksen: "#F3E3C3", ikon: "kayumanis" },
  },
  // ---------------- Camilan ----------------
  {
    slug: "keripik-singkong-balado",
    name: "Keripik Singkong Balado 200 g",
    kategori: "camilan",
    price: 22_000,
    stock: 60,
    weightGrams: 200,
    isFeatured: true,
    description:
      "Keripik singkong tipis dengan bumbu balado pedas manis. Digoreng dalam jumlah kecil supaya tetap renyah.",
    seni: { bentuk: "plastik", latar: "#F6DED6", kemasan: "#C8372D", label: "#FFF4E0", aksen: "#C8372D", ikon: "cabai" },
  },
  {
    slug: "keripik-pisang-manis",
    name: "Keripik Pisang Manis 200 g",
    kategori: "camilan",
    price: 25_000,
    stock: 45,
    weightGrams: 200,
    description:
      "Irisan pisang tanduk yang digoreng lalu dilapisi gula aren tipis. Manis, renyah, dan tidak terlalu berminyak.",
    seni: { bentuk: "plastik", latar: "#F7EDCB", kemasan: "#E2B13C", label: "#5A3A1A", aksen: "#F7EDCB", ikon: "keripik" },
  },
  {
    slug: "rempeyek-kacang",
    name: "Rempeyek Kacang 150 g",
    kategori: "camilan",
    price: 20_000,
    stock: 3,
    weightGrams: 150,
    description: "Rempeyek tipis berisi kacang tanah dan irisan daun jeruk. Teman makan nasi atau camilan sore.",
    seni: { bentuk: "plastik", latar: "#EFE6D2", kemasan: "#D9C08F", label: "#34503B", aksen: "#F6F2E9", ikon: "kacang" },
  },
  {
    slug: "kacang-mete-panggang-bawang",
    name: "Kacang Mete Panggang Bawang 250 g",
    kategori: "camilan",
    price: 85_000,
    stock: 22,
    weightGrams: 250,
    isFeatured: true,
    description:
      "Kacang mete utuh yang dipanggang dengan bawang putih dan sedikit garam. Dikemas dalam toples agar tetap renyah.",
    seni: { bentuk: "toples", latar: "#EFE5D6", kemasan: "#E3C79A", label: "#34503B", aksen: "#F6F2E9", ikon: "kacang" },
  },
  {
    slug: "kue-kering-jahe",
    name: "Kue Kering Jahe 300 g",
    kategori: "camilan",
    price: 58_000,
    stock: 12,
    weightGrams: 300,
    description:
      "Kue kering renyah beraroma jahe dan kayu manis dalam toples plastik. Cocok untuk suguhan tamu.",
    seni: { bentuk: "toples", latar: "#F3E4D6", kemasan: "#B9773E", label: "#9C4524", aksen: "#F6F2E9", ikon: "kue" },
  },
  {
    slug: "emping-melinjo-pedas-manis",
    name: "Emping Melinjo Pedas Manis 200 g",
    kategori: "camilan",
    price: 30_000,
    stock: 33,
    weightGrams: 200,
    description:
      "Emping melinjo tipis berbalur gula merah dan cabai. Rasa pedas manis dengan sedikit pahit khas melinjo.",
    seni: { bentuk: "plastik", latar: "#F2E3CF", kemasan: "#C9822E", label: "#F6F2E9", aksen: "#7E361B", ikon: "keripik" },
  },
  // ---------------- Sambal & Bumbu ----------------
  {
    slug: "sambal-bawang-lereng",
    name: "Sambal Bawang Lereng 190 ml",
    kategori: "sambal-bumbu",
    price: 35_000,
    stock: 38,
    weightGrams: 250,
    isFeatured: true,
    description:
      "Sambal bawang putih dan cabai rawit yang ditumis dengan minyak kelapa. Tingkat pedas sedang sampai tinggi. Simpan di kulkas setelah dibuka.",
    seni: { bentuk: "botol", latar: "#F6DCD3", kemasan: "#B8321F", label: "#F6F2E9", aksen: "#B8321F", ikon: "cabai" },
  },
  {
    slug: "sambal-ijo-teri",
    name: "Sambal Ijo Teri 190 ml",
    kategori: "sambal-bumbu",
    price: 42_000,
    stock: 16,
    weightGrams: 250,
    description: "Sambal cabai hijau dengan ikan teri goreng. Gurih dan tidak terlalu pedas.",
    seni: { bentuk: "botol", latar: "#E2EBD6", kemasan: "#5E8A3A", label: "#F6F2E9", aksen: "#3F6326", ikon: "cabai" },
  },
  {
    slug: "bumbu-rendang-kering",
    name: "Bumbu Rendang Kering 100 g",
    kategori: "sambal-bumbu",
    price: 28_000,
    stock: 25,
    weightGrams: 100,
    description:
      "Bumbu rendang siap masak untuk 1 kg daging. Tambahkan santan, lalu masak dengan api kecil sampai bumbu meresap.",
    seni: { bentuk: "sachet", latar: "#EFDCCB", kemasan: "#6B3A22", label: "#E9B26A", aksen: "#6B3A22", ikon: "rempah" },
  },
  {
    slug: "gula-aren-cair",
    name: "Gula Aren Cair 350 ml",
    kategori: "sambal-bumbu",
    price: 38_000,
    stock: 30,
    weightGrams: 450,
    description:
      "Gula aren cair untuk kopi susu, es teh, atau kue. Kental, manis legit, dengan aroma karamel.",
    seni: { bentuk: "botol", latar: "#F3E6CF", kemasan: "#8A4B17", label: "#F3E3C3", aksen: "#8A4B17", ikon: "tetes" },
  },
  {
    slug: "garam-rempah-dapur",
    name: "Garam Rempah Dapur 150 g",
    kategori: "sambal-bumbu",
    price: 26_000,
    stock: 40,
    weightGrams: 150,
    description:
      "Garam kasar yang dicampur bawang putih kering, merica, dan daun jeruk. Taburkan pada telur, sayur tumis, atau kentang goreng.",
    seni: { bentuk: "toples", latar: "#E6E9E4", kemasan: "#EDEBE4", label: "#34503B", aksen: "#F6F2E9", ikon: "garam" },
  },
  // ---------------- Kriya Dapur ----------------
  {
    slug: "tampah-anyaman-bambu",
    name: "Tampah Anyaman Bambu 40 cm",
    kategori: "kriya-dapur",
    price: 45_000,
    stock: 14,
    weightGrams: 400,
    description:
      "Tampah bambu anyaman tangan berdiameter sekitar 40 cm. Bisa dipakai menampi beras, alas sajian, atau hiasan dinding. Ukuran tiap tampah sedikit berbeda karena dibuat manual.",
    seni: { bentuk: "tampah", latar: "#E7E1D3", kemasan: "#C9A46B", label: "#9B7440", aksen: "#7A5A2E", ikon: "lumbung" },
  },
  {
    slug: "tas-belanja-kain-lurik",
    name: "Tas Belanja Kain Lurik",
    kategori: "kriya-dapur",
    price: 75_000,
    stock: 20,
    weightGrams: 300,
    isFeatured: true,
    description:
      "Tas belanja dari kain tenun lurik bergaris dengan lapisan dalam katun. Muat sekitar 8 kg belanjaan dan bisa dilipat kecil.",
    seni: { bentuk: "tas", latar: "#DCE5D5", kemasan: "#34503B", label: "#C98B4B", aksen: "#F3E3C3", ikon: "lumbung" },
  },
  {
    slug: "cangkir-enamel-lumbung-kabut",
    name: "Cangkir Enamel Lumbung Kabut",
    kategori: "kriya-dapur",
    price: 55_000,
    stock: 26,
    weightGrams: 250,
    description:
      "Cangkir enamel 350 ml bergambar lumbung dan bukit berkabut. Ringan dan tidak mudah pecah, cocok dibawa berkemah.",
    seni: { bentuk: "cangkir", latar: "#DDE5EA", kemasan: "#F6F2E9", label: "#2E4A5C", aksen: "#34503B", ikon: "lumbung" },
  },
  {
    slug: "saringan-kopi-kain-isi-2",
    name: "Saringan Kopi Kain isi 2",
    kategori: "kriya-dapur",
    price: 30_000,
    stock: 2,
    weightGrams: 60,
    description:
      "Dua saringan kain katun bergagang kayu untuk menyeduh kopi gaya tradisional. Bilas dengan air panas setelah dipakai.",
    seni: { bentuk: "saringan", latar: "#EFE6D8", kemasan: "#F3EBDC", label: "#8A5A33", aksen: "#5B3A22", ikon: "biji" },
  },
];

/** Pelanggan contoh untuk mengisi dashboard admin. Email memakai domain .test (khusus pengujian). */
export const PELANGGAN_CONTOH = [
  { nama: "Ayu Lestari", email: "ayu@contoh.test", kota: "Semarang", provinsi: "Jawa Tengah" },
  { nama: "Bagus Pratama", email: "bagus@contoh.test", kota: "Bandung", provinsi: "Jawa Barat" },
  { nama: "Citra Maharani", email: "citra@contoh.test", kota: "Denpasar", provinsi: "Bali" },
  { nama: "Dimas Saputra", email: "dimas@contoh.test", kota: "Makassar", provinsi: "Sulawesi Selatan" },
  { nama: "Endah Wulandari", email: "endah@contoh.test", kota: "Medan", provinsi: "Sumatera Utara" },
  { nama: "Fajar Nugroho", email: "fajar@contoh.test", kota: "Jayapura", provinsi: "Papua" },
  { nama: "Gita Paramitha", email: "gita@contoh.test", kota: "Surabaya", provinsi: "Jawa Timur" },
  { nama: "Hendra Wijaya", email: "hendra@contoh.test", kota: "Balikpapan", provinsi: "Kalimantan Timur" },
] as const;
