/**
 * Generator ilustrasi kemasan produk (SVG buatan sendiri, tanpa aset pihak ketiga).
 * Dipakai skrip `npm run art` untuk menulis public/images/produk/<slug>.svg.
 */

export type BentukKemasan =
  | "kantong"
  | "kotak"
  | "sachet"
  | "toples"
  | "botol"
  | "plastik"
  | "kaleng"
  | "tampah"
  | "tas"
  | "cangkir"
  | "saringan";

export type IkonLabel =
  | "biji"
  | "daun"
  | "cabai"
  | "rempah"
  | "kue"
  | "keripik"
  | "kacang"
  | "tetes"
  | "jahe"
  | "garam"
  | "kayumanis"
  | "lumbung";

export type SpesifikasiSeni = {
  bentuk: BentukKemasan;
  /** Warna latar ilustrasi (terang). */
  latar: string;
  /** Warna utama kemasan. */
  kemasan: string;
  /** Warna label. */
  label: string;
  /** Warna ikon dan garis di atas label. */
  aksen: string;
  ikon: IkonLabel;
};

const r = (n: number) => Math.round(n * 10) / 10;

function ikon(jenis: IkonLabel, cx: number, cy: number, skala: number, warna: string, latar: string): string {
  const t = `translate(${r(cx)} ${r(cy)}) scale(${skala})`;
  switch (jenis) {
    case "biji":
      return `<g transform="${t} rotate(-28)"><ellipse rx="25" ry="35" fill="${warna}"/><path d="M0 -31 C -13 -12 13 12 0 31" stroke="${latar}" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
    case "daun":
      return `<g transform="${t}"><path d="M-30 30 C -32 -18 8 -40 36 -38 C 40 -6 18 32 -30 30 Z" fill="${warna}"/><path d="M-26 26 C -6 6 12 -12 30 -32" stroke="${latar}" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
    case "cabai":
      return `<g transform="${t}"><path d="M-30 -14 C -2 -20 34 -2 32 34 C 18 10 -6 2 -32 2 Z" fill="${warna}"/><path d="M-30 -14 C -38 -16 -42 -24 -38 -34 M-31 -6 C -40 -4 -44 2 -42 8" stroke="#4C6A36" stroke-width="6" fill="none" stroke-linecap="round"/></g>`;
    case "rempah": {
      const kelopak = Array.from({ length: 8 }, (_, i) => `<ellipse cx="0" cy="-20" rx="9" ry="19" transform="rotate(${i * 45})" fill="${warna}"/>`).join("");
      return `<g transform="${t}">${kelopak}<circle r="9" fill="${latar}"/><circle r="4" fill="${warna}"/></g>`;
    }
    case "kue":
      return `<g transform="${t}"><circle r="34" fill="${warna}"/><circle r="27" fill="none" stroke="${latar}" stroke-width="3" stroke-dasharray="4 7"/><circle cx="-10" cy="-8" r="4.5" fill="${latar}"/><circle cx="11" cy="-4" r="4.5" fill="${latar}"/><circle cx="-2" cy="12" r="4.5" fill="${latar}"/></g>`;
    case "keripik":
      return `<g transform="${t}"><path d="M-36 6 C -30 -22 -4 -30 12 -18 C 22 -8 6 14 -10 20 C -22 24 -38 20 -36 6 Z" fill="${warna}"/><path d="M-6 10 C 4 -16 30 -20 38 -2 C 42 14 22 30 4 28 C -6 26 -10 18 -6 10 Z" fill="${warna}" opacity="0.8"/><path d="M-28 4 C -18 -6 -6 -10 4 -12 M2 16 C 12 6 24 2 32 0" stroke="${latar}" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
    case "kacang":
      return `<g transform="${t} rotate(-10)"><path d="M-32 4 C -34 -28 18 -42 32 -10 C 38 6 24 14 12 4 C 2 -8 -14 -6 -14 8 C -14 22 -30 28 -32 4 Z" fill="${warna}"/><path d="M-24 2 C -22 -18 6 -28 22 -14" stroke="${latar}" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/></g>`;
    case "tetes":
      return `<g transform="${t}"><path d="M0 -40 C 14 -18 28 -2 28 14 A28 28 0 0 1 -28 14 C -28 -2 -14 -18 0 -40 Z" fill="${warna}"/><path d="M-12 12 A12 12 0 0 0 0 24" stroke="${latar}" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
    case "jahe":
      return `<g transform="${t}"><ellipse cx="-14" cy="6" rx="22" ry="14" fill="${warna}" transform="rotate(-20 -14 6)"/><ellipse cx="14" cy="-2" rx="20" ry="12" fill="${warna}" transform="rotate(25 14 -2)"/><ellipse cx="2" cy="-22" rx="9" ry="14" fill="${warna}"/><ellipse cx="28" cy="18" rx="9" ry="7" fill="${warna}"/><path d="M-26 4 h8 M8 -4 h8 M-2 -26 v6" stroke="${latar}" stroke-width="3" stroke-linecap="round"/></g>`;
    case "garam":
      return `<g transform="${t}"><rect x="-30" y="-6" width="20" height="20" rx="3" fill="${warna}" transform="rotate(15 -20 4)"/><rect x="-4" y="-28" width="18" height="18" rx="3" fill="${warna}" transform="rotate(-12 5 -19)"/><rect x="6" y="2" width="24" height="24" rx="3" fill="${warna}" transform="rotate(30 18 14)"/><rect x="-20" y="18" width="14" height="14" rx="2" fill="${warna}" opacity="0.7"/></g>`;
    case "kayumanis":
      return `<g transform="${t} rotate(-35)"><rect x="-42" y="-16" width="84" height="14" rx="7" fill="${warna}"/><rect x="-38" y="4" width="76" height="14" rx="7" fill="${warna}" opacity="0.85"/><circle cx="-42" cy="-9" r="7" fill="${latar}"/><circle cx="-42" cy="-9" r="3.5" fill="${warna}"/><circle cx="-38" cy="11" r="7" fill="${latar}"/><circle cx="-38" cy="11" r="3.5" fill="${warna}"/></g>`;
    case "lumbung":
      return `<g transform="${t}"><path d="M-40 6 L0 -38 L40 6 Z" fill="${warna}"/><path d="M-22 6 h44 v20 h-44 Z" fill="${warna}" opacity="0.85"/><path d="M-16 26 v12 M16 26 v12" stroke="${warna}" stroke-width="5" stroke-linecap="round"/><path d="M-8 -6 h16" stroke="${latar}" stroke-width="3" stroke-linecap="round"/></g>`;
  }
}

/** Segmen path bergerigi dari x1 ke x2 pada garis y (amplitudo negatif = gigi ke atas). */
function zigzag(x1: number, x2: number, y: number, amplitudo: number, jumlah: number): string {
  const langkah = (x2 - x1) / jumlah;
  let d = "";
  for (let i = 0; i < jumlah; i++) {
    d += ` L${r(x1 + langkah * (i + 0.5))} ${y + amplitudo} L${r(x1 + langkah * (i + 1))} ${y}`;
  }
  return d;
}

/** Garis-garis "teks" pada label, supaya kemasan tidak kosong tanpa memakai huruf. */
function garisLabel(cx: number, y: number, lebar: number, warna: string): string {
  return `<rect x="${r(cx - lebar / 2)}" y="${y}" width="${lebar}" height="9" rx="4.5" fill="${warna}" opacity="0.85"/><rect x="${r(cx - lebar * 0.35)}" y="${y + 16}" width="${r(lebar * 0.7)}" height="7" rx="3.5" fill="${warna}" opacity="0.55"/>`;
}

function kemasan(s: SpesifikasiSeni): string {
  const { kemasan: k, label: l, aksen: a } = s;
  switch (s.bentuk) {
    case "kantong":
      return `
  <path d="M190 160 L410 160 L422 492 Q300 514 178 492 Z" fill="${k}"/>
  <rect x="186" y="134" width="228" height="38" rx="5" fill="${k}"/>
  <rect x="186" y="134" width="228" height="38" rx="5" fill="#000" opacity="0.13"/>
  <path d="M194 182 H406" stroke="#000" stroke-opacity="0.18" stroke-width="3" stroke-dasharray="7 6"/>
  <path d="M208 200 L218 470" stroke="#fff" stroke-opacity="0.22" stroke-width="12" stroke-linecap="round"/>
  <circle cx="300" cy="222" r="10" fill="#000" opacity="0.14"/>
  <rect x="218" y="252" width="164" height="176" rx="16" fill="${l}"/>
  ${ikon(s.ikon, 300, 316, 1.05, a, l)}
  ${garisLabel(300, 382, 112, a)}`;
    case "kotak":
      return `
  <path d="M200 196 L252 162 L432 162 L380 196 Z" fill="${k}"/>
  <path d="M200 196 L252 162 L432 162 L380 196 Z" fill="#fff" opacity="0.25"/>
  <path d="M380 196 L432 162 L432 462 L380 496 Z" fill="${k}"/>
  <path d="M380 196 L432 162 L432 462 L380 496 Z" fill="#000" opacity="0.16"/>
  <rect x="200" y="196" width="180" height="300" fill="${k}"/>
  <rect x="200" y="276" width="180" height="140" fill="${l}"/>
  <path d="M380 276 L432 242 L432 382 L380 416 Z" fill="${l}"/>
  <path d="M380 276 L432 242 L432 382 L380 416 Z" fill="#000" opacity="0.16"/>
  ${ikon(s.ikon, 290, 330, 0.95, a, l)}
  ${garisLabel(290, 380, 104, a)}
  <rect x="218" y="214" width="70" height="10" rx="5" fill="${l}" opacity="0.8"/>`;
    case "sachet": {
      return `
  <path d="M200 150${zigzag(200, 400, 150, -8, 14)} L400 482${zigzag(400, 200, 482, 8, 14)} Z" fill="${k}"/>
  <rect x="200" y="170" width="200" height="14" fill="#000" opacity="0.12"/>
  <rect x="200" y="448" width="200" height="14" fill="#000" opacity="0.12"/>
  <path d="M220 200 L224 440" stroke="#fff" stroke-opacity="0.2" stroke-width="10" stroke-linecap="round"/>
  <circle cx="300" cy="310" r="74" fill="${l}"/>
  ${ikon(s.ikon, 300, 306, 1.05, a, l)}
  ${garisLabel(300, 404, 120, l)}`;
    }
    case "toples":
      return `
  <rect x="206" y="146" width="188" height="54" rx="12" fill="${l}"/>
  <rect x="206" y="146" width="188" height="54" rx="12" fill="#000" opacity="0.12"/>
  <path d="M214 162 H386 M214 176 H386" stroke="#fff" stroke-opacity="0.25" stroke-width="3"/>
  <rect x="216" y="196" width="168" height="18" rx="6" fill="#fff" opacity="0.55"/>
  <rect x="194" y="210" width="212" height="288" rx="40" fill="${k}"/>
  <g fill="#000" opacity="0.1"><circle cx="230" cy="250" r="16"/><circle cx="276" cy="236" r="14"/><circle cx="330" cy="252" r="17"/><circle cx="372" cy="238" r="12"/><circle cx="236" cy="462" r="15"/><circle cx="292" cy="474" r="12"/><circle cx="344" cy="462" r="16"/></g>
  <rect x="194" y="210" width="212" height="288" rx="40" fill="#fff" opacity="0.16"/>
  <path d="M214 250 C 210 330 212 410 222 466" stroke="#fff" stroke-opacity="0.5" stroke-width="9" fill="none" stroke-linecap="round"/>
  <rect x="194" y="296" width="212" height="116" fill="${l}"/>
  ${ikon(s.ikon, 300, 338, 0.9, a, l)}
  ${garisLabel(300, 380, 100, a)}`;
    case "botol":
      return `
  <rect x="266" y="116" width="68" height="44" rx="8" fill="${a}"/>
  <rect x="266" y="116" width="68" height="44" rx="8" fill="#000" opacity="0.2"/>
  <path d="M276 158 H324 V206 C 324 232 380 240 380 286 V474 Q380 498 356 498 H244 Q220 498 220 474 V286 C 220 240 276 232 276 206 Z" fill="${k}"/>
  <path d="M276 158 H324 V206 C 324 232 380 240 380 286 V474 Q380 498 356 498 H244 Q220 498 220 474 V286 C 220 240 276 232 276 206 Z" fill="#fff" opacity="0.14"/>
  <path d="M236 292 V466" stroke="#fff" stroke-opacity="0.45" stroke-width="9" stroke-linecap="round"/>
  <rect x="220" y="318" width="160" height="118" fill="${l}"/>
  ${ikon(s.ikon, 300, 360, 0.85, a, l)}
  ${garisLabel(300, 404, 96, a)}`;
    case "plastik":
      return `
  <path d="M196 158 L206 146 L216 158 L226 146 L236 158 L246 146 L256 158 L266 146 L276 158 L286 146 L296 158 L306 146 L316 158 L326 146 L336 158 L346 146 L356 158 L366 146 L376 158 L386 146 L396 158 L404 150
    C 418 250 418 390 404 486 L396 494 L386 482 L376 494 L366 482 L356 494 L346 482 L336 494 L326 482 L316 494 L306 482 L296 494 L286 482 L276 494 L266 482 L256 494 L246 482 L236 494 L226 482 L216 494 L206 482 L196 490
    C 182 390 182 250 196 158 Z" fill="${k}"/>
  <path d="M196 170 H404 M196 470 H404" stroke="#000" stroke-opacity="0.14" stroke-width="10"/>
  <path d="M220 200 C 214 280 214 360 222 440" stroke="#fff" stroke-opacity="0.35" stroke-width="12" fill="none" stroke-linecap="round"/>
  <path d="M378 210 C 384 260 384 300 380 330" stroke="#fff" stroke-opacity="0.25" stroke-width="7" fill="none" stroke-linecap="round"/>
  <rect x="226" y="236" width="148" height="150" rx="74" fill="${l}"/>
  ${ikon(s.ikon, 300, 300, 1.05, a, l)}
  ${garisLabel(300, 408, 118, l)}`;
    case "kaleng":
      return `
  <rect x="196" y="176" width="208" height="306" fill="${k}"/>
  <ellipse cx="300" cy="482" rx="104" ry="22" fill="${k}"/>
  <rect x="196" y="176" width="208" height="306" fill="#000" opacity="0.06"/>
  <rect x="190" y="160" width="220" height="60" rx="8" fill="${a}"/>
  <ellipse cx="300" cy="160" rx="110" ry="24" fill="${a}"/>
  <ellipse cx="300" cy="160" rx="110" ry="24" fill="#fff" opacity="0.2"/>
  <rect x="196" y="270" width="208" height="140" fill="${l}"/>
  <path d="M214 232 V462" stroke="#fff" stroke-opacity="0.25" stroke-width="10" stroke-linecap="round"/>
  ${ikon(s.ikon, 300, 318, 1, a, l)}
  ${garisLabel(300, 366, 110, a)}`;
    case "tampah": {
      const anyaman = Array.from({ length: 16 }, (_, i) => {
        const x = 70 + i * 32;
        return `<path d="M${x} 170 L${x + 180} 510" /><path d="M${x + 180} 170 L${x} 510" />`;
      }).join("");
      return `
  <defs><clipPath id="tampah"><ellipse cx="300" cy="340" rx="196" ry="138"/></clipPath></defs>
  <ellipse cx="300" cy="352" rx="214" ry="152" fill="${a}"/>
  <ellipse cx="300" cy="340" rx="212" ry="150" fill="${l}"/>
  <ellipse cx="300" cy="340" rx="196" ry="138" fill="${k}"/>
  <g clip-path="url(#tampah)" stroke="${l}" stroke-width="7" stroke-opacity="0.55">${anyaman}</g>
  <ellipse cx="300" cy="340" rx="196" ry="138" fill="none" stroke="${a}" stroke-width="6" opacity="0.5"/>
  <ellipse cx="300" cy="340" rx="212" ry="150" fill="none" stroke="${a}" stroke-width="3" opacity="0.6"/>`;
    }
    case "tas": {
      const garis = Array.from({ length: 12 }, (_, i) => {
        const x = 180 + i * 22;
        const w = i % 3 === 0 ? 6 : 3;
        const c = i % 2 === 0 ? l : a;
        return `<rect x="${x}" y="230" width="${w}" height="280" fill="${c}" opacity="0.85"/>`;
      }).join("");
      return `
  <defs><clipPath id="tas"><path d="M188 240 H412 L428 496 H172 Z"/></clipPath></defs>
  <path d="M236 246 C 236 150 290 140 300 140 C 310 140 364 150 364 246" fill="none" stroke="${k}" stroke-width="16" stroke-linecap="round"/>
  <path d="M236 246 C 236 150 290 140 300 140 C 310 140 364 150 364 246" fill="none" stroke="#000" stroke-opacity="0.15" stroke-width="16" stroke-linecap="round"/>
  <path d="M188 240 H412 L428 496 H172 Z" fill="${k}"/>
  <g clip-path="url(#tas)">${garis}</g>
  <rect x="188" y="240" width="224" height="20" fill="#000" opacity="0.14"/>
  <rect x="318" y="392" width="68" height="76" rx="8" fill="${a}"/>
  ${ikon("lumbung", 352, 432, 0.6, k, a)}`;
    }
    case "cangkir":
      return `
  <path d="M398 290 C 460 290 462 400 396 404" fill="none" stroke="${k}" stroke-width="22" stroke-linecap="round"/>
  <path d="M398 290 C 460 290 462 400 396 404" fill="none" stroke="${l}" stroke-width="6" stroke-linecap="round" opacity="0.5"/>
  <path d="M194 236 H406 L392 470 Q390 494 366 494 H234 Q210 494 208 470 Z" fill="${k}"/>
  <path d="M208 470 Q210 494 234 494 H366 Q390 494 392 470" fill="none" stroke="${l}" stroke-width="8"/>
  <ellipse cx="300" cy="236" rx="106" ry="24" fill="${l}"/>
  <ellipse cx="300" cy="238" rx="94" ry="17" fill="#3B2A20"/>
  <path d="M222 268 L232 456" stroke="#fff" stroke-opacity="0.5" stroke-width="10" stroke-linecap="round"/>
  <path d="M244 402 C 270 380 300 392 326 372 C 340 362 356 366 368 360 L366 430 H246 Z" fill="${a}" opacity="0.35"/>
  ${ikon("lumbung", 304, 352, 0.85, a, k)}`;
    case "saringan":
      return `
  <path d="M368 196 L456 118" stroke="${l}" stroke-width="18" stroke-linecap="round"/>
  <path d="M368 196 L456 118" stroke="#000" stroke-opacity="0.15" stroke-width="18" stroke-linecap="round"/>
  <path d="M222 204 C 228 300 268 420 300 470 C 332 420 372 300 378 204 Z" fill="${k}"/>
  <path d="M244 300 C 262 380 286 440 300 470 C 314 440 338 380 356 300 C 330 330 270 330 244 300 Z" fill="${a}" opacity="0.35"/>
  <path d="M248 228 C 254 300 274 380 296 440" stroke="#fff" stroke-opacity="0.5" stroke-width="8" fill="none" stroke-linecap="round"/>
  <ellipse cx="300" cy="202" rx="80" ry="22" fill="none" stroke="#6E6A64" stroke-width="7"/>
  ${ikon(s.ikon, 300, 330, 0.55, a, k)}`;
  }
}

/** SVG lengkap 600×600 dengan latar bukit berkabut khas Lumbung Kabut. */
export function buatSvgProduk(spek: SpesifikasiSeni, judul: string): string {
  const aman = judul.replace(/[<>&"]/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" role="img" aria-label="${aman}">
  <title>${aman}</title>
  <rect width="600" height="600" fill="${spek.latar}"/>
  <circle cx="474" cy="132" r="54" fill="#fff" opacity="0.4"/>
  <path d="M0 400 C 110 352 210 380 320 344 C 420 312 520 330 600 360 V600 H0 Z" fill="#fff" opacity="0.32"/>
  <path d="M0 456 C 150 424 270 446 380 420 C 470 400 550 410 600 424 V600 H0 Z" fill="#fff" opacity="0.3"/>
  <ellipse cx="300" cy="508" rx="160" ry="18" fill="#2B2118" opacity="0.13"/>
  ${kemasan(spek).trim()}
</svg>
`;
}
