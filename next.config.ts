import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build mandiri untuk systemd: hasil di .next/standalone dijalankan dengan `node server.js`.
  output: "standalone",
  poweredByHeader: false,
  // Pengaman: data lokal, test, dan sumber tidak pernah ikut ke folder deploy.
  outputFileTracingExcludes: {
    "*": ["./data/**", "./tests/**", "./docs/**", "./scripts/**", "./src/**", "./.env*", "./*.md"],
  },
  images: {
    // Gambar produk sudah berukuran pas: ilustrasi SVG buatan sendiri, dan unggahan admin
    // dikonversi sharp ke WebP maks. 1000 px. Optimizer bawaan tidak dipakai karena folder
    // build di server bersifat read-only.
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      // Batas unggah gambar produk 2 MB + data form lain.
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
