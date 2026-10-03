import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan privasi",
  description: "Data apa yang diproses toko demo Lumbung Kabut, untuk apa, dan kapan dihapus.",
  alternates: { canonical: "/privasi" },
};

export default function HalamanPrivasi() {
  return (
    <div className="wadah max-w-3xl py-10 sm:py-14">
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Kebijakan privasi</h1>
      <p className="mt-2 text-sm text-arang-2">Berlaku untuk situs demo Lumbung Kabut. Diperbarui 2 Oktober 2026.</p>

      <div className="mt-8 space-y-8 leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-semibold">Ringkasnya</h2>
          <p className="mt-2 text-arang-2">
            Ini toko demo. Mohon jangan memasukkan data pribadi asli. Semua data yang Anda masukkan dihapus otomatis setiap pukul
            00.00 WIB, dan tidak pernah dibagikan ke pihak lain.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold">Data yang diproses</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-arang-2">
            <li>Akun: nama, email, dan kata sandi (disimpan dalam bentuk hash, bukan teks asli).</li>
            <li>Pesanan: nama penerima, nomor HP, alamat, kota, provinsi, kode pos, dan catatan yang Anda isi.</li>
            <li>Sesi login: alamat IP dan jenis peramban, untuk keamanan sesi.</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold">Tujuan dan dasar pemrosesan</h2>
          <p className="mt-2 text-arang-2">
            Data hanya dipakai untuk menjalankan fitur demo (masuk, checkout, dan menampilkan status pesanan), atas persetujuan
            yang Anda berikan saat mendaftar, sejalan dengan prinsip Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data
            Pribadi: terbatas pada tujuan, seminimal mungkin, dan tidak disimpan lebih lama dari yang diperlukan.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold">Penyimpanan dan penghapusan</h2>
          <p className="mt-2 text-arang-2">
            Data disimpan di server situs ini dan dihapus otomatis setiap malam bersama seluruh data demo. Karena akun admin demo
            bisa dipakai siapa saja, data pelanggan yang mendaftar sendiri ditampilkan tersamar di dasbor admin demo.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold">Cookie</h2>
          <p className="mt-2 text-arang-2">
            Situs memakai dua cookie fungsional: cookie sesi login dan cookie isi keranjang. Tidak ada cookie iklan, pelacak, atau
            analitik pihak ketiga.
          </p>
        </section>
      </div>
    </div>
  );
}
