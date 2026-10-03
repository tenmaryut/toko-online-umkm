"use client";

/** Galat 500 di tingkat paling atas (layout utama gagal). Gaya ditulis inline karena CSS situs mungkin tidak termuat. */
export default function GalatGlobal({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f6f2e9", color: "#241c15" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem", textAlign: "center" }}>
          <div style={{ maxWidth: 480 }}>
            <p style={{ fontFamily: "monospace", color: "#9c4524", fontWeight: 600 }}>Galat 500</p>
            <h1 style={{ fontSize: "1.9rem", margin: "0.5rem 0" }}>Lumbung Kabut sedang bermasalah</h1>
            <p style={{ color: "#574b40", lineHeight: 1.6 }}>
              Server gagal menyiapkan halaman. Ini toko demo, jadi tidak ada data transaksi nyata yang terdampak.
            </p>
            {error.digest && <p style={{ fontFamily: "monospace", fontSize: 12, color: "#574b40" }}>Kode: {error.digest}</p>}
            <button
              type="button"
              onClick={() => reset()}
              style={{ marginTop: 16, padding: "0.75rem 1.5rem", borderRadius: 999, border: 0, background: "#9c4524", color: "#fff", fontWeight: 600, cursor: "pointer" }}
            >
              Coba lagi
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
