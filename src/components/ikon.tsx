import type { SVGProps } from "react";

/** Ikon garis 24×24 buatan sendiri. Dekoratif secara default (aria-hidden). */
type Props = SVGProps<SVGSVGElement> & { ukuran?: number };

function Dasar({ ukuran = 20, children, ...props }: Props) {
  return (
    <svg
      width={ukuran}
      height={ukuran}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IkonKeranjang = (p: Props) => (
  <Dasar {...p}>
    <path d="M3 9h18l-1.6 9.2a2 2 0 0 1-2 1.8H6.6a2 2 0 0 1-2-1.8L3 9Z" />
    <path d="M8 9 11 4M16 9l-3-5M7.5 13v3M12 13v3M16.5 13v3" />
  </Dasar>
);

export const IkonCari = (p: Props) => (
  <Dasar {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Dasar>
);

export const IkonPengguna = (p: Props) => (
  <Dasar {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" />
  </Dasar>
);

export const IkonMenu = (p: Props) => (
  <Dasar {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Dasar>
);

export const IkonTutup = (p: Props) => (
  <Dasar {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Dasar>
);

export const IkonPanahKanan = (p: Props) => (
  <Dasar {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Dasar>
);

export const IkonChevronKiri = (p: Props) => (
  <Dasar {...p}>
    <path d="m15 6-6 6 6 6" />
  </Dasar>
);

export const IkonChevronKanan = (p: Props) => (
  <Dasar {...p}>
    <path d="m9 6 6 6-6 6" />
  </Dasar>
);

export const IkonTambah = (p: Props) => (
  <Dasar {...p}>
    <path d="M12 5v14M5 12h14" />
  </Dasar>
);

export const IkonKurang = (p: Props) => (
  <Dasar {...p}>
    <path d="M5 12h14" />
  </Dasar>
);

export const IkonSampah = (p: Props) => (
  <Dasar {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </Dasar>
);

export const IkonTruk = (p: Props) => (
  <Dasar {...p}>
    <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" />
    <circle cx="7" cy="18" r="1.8" />
    <circle cx="17" cy="18" r="1.8" />
  </Dasar>
);

export const IkonCentang = (p: Props) => (
  <Dasar {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Dasar>
);

export const IkonInfo = (p: Props) => (
  <Dasar {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Dasar>
);

export const IkonPeringatan = (p: Props) => (
  <Dasar {...p}>
    <path d="M12 4 2.8 19.5h18.4L12 4Z" />
    <path d="M12 10v4M12 17h.01" />
  </Dasar>
);

export const IkonKeluar = (p: Props) => (
  <Dasar {...p}>
    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10" />
  </Dasar>
);

export const IkonRingkasan = (p: Props) => (
  <Dasar {...p}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Dasar>
);

export const IkonStruk = (p: Props) => (
  <Dasar {...p}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
    <path d="M9 8h6M9 12h6M9 16h3" />
  </Dasar>
);

export const IkonKotak = (p: Props) => (
  <Dasar {...p}>
    <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z" />
    <path d="M3 7.5 12 12l9-4.5M12 12v9" />
  </Dasar>
);

export const IkonLabel = (p: Props) => (
  <Dasar {...p}>
    <path d="M3 12V4h8l10 10-8 8L3 12Z" />
    <circle cx="7.5" cy="8" r="1.4" />
  </Dasar>
);

export const IkonOrang = (p: Props) => (
  <Dasar {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.9-3.3 3.4-5 6.5-5s5.6 1.7 6.5 5M16 4.5a3.5 3.5 0 0 1 0 7M18.5 15.3c1.5.7 2.6 2.2 3 4.7" />
  </Dasar>
);

export const IkonToko = (p: Props) => (
  <Dasar {...p}>
    <path d="M3 10 12 3l9 7M5 9v11h14V9M10 20v-6h4v6" />
  </Dasar>
);
