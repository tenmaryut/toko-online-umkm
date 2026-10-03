/** Ilustrasi lereng berkabut dengan lumbung panggung dan kebun kopi (SVG buatan sendiri). */
export function IlustrasiHero({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 560 460" className={className} role="img" aria-label="Ilustrasi lumbung kayu di lereng bukit berkabut dengan kebun kopi">
      <defs>
        <linearGradient id="langit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7ebcb" />
          <stop offset="1" stopColor="#efe8da" />
        </linearGradient>
        <linearGradient id="kabut" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="bingkai">
          <rect width="560" height="460" rx="36" />
        </clipPath>
      </defs>
      <g clipPath="url(#bingkai)">
        <rect width="560" height="460" fill="url(#langit)" />
        <circle cx="420" cy="104" r="46" fill="#e3b04b" opacity="0.85" />
        <path d="M0 210c70-40 150-70 230-50s120 40 190 20 110-40 140-30v310H0Z" fill="#8a9a93" opacity="0.55" />
        <rect x="-40" y="196" width="640" height="26" fill="url(#kabut)" />
        <path d="M0 262c90-36 170-40 260-14s180 22 300-12v224H0Z" fill="#5f7b63" />
        <rect x="-40" y="250" width="640" height="22" fill="url(#kabut)" opacity="0.8" />
        <path d="M0 318c120-30 220-26 330-6s160 8 230-8v156H0Z" fill="#34503b" />
        {/* lumbung panggung */}
        <g transform="translate(300 156)">
          <path d="M-74 96 0 18l74 78Z" fill="#9c4524" />
          <path d="M-74 96 0 18l74 78" fill="none" stroke="#7e361b" strokeWidth="4" strokeLinejoin="round" />
          <path d="M-46 96h92v52h-92Z" fill="#c98b4b" />
          <path d="M-46 112h92M-46 128h92" stroke="#9b6a35" strokeWidth="3" />
          <path d="M-14 104h28v30h-28Z" fill="#5b3a22" />
          <path d="M-34 148v34M34 148v34M0 148v34" stroke="#5b3a22" strokeWidth="7" strokeLinecap="round" />
          <path d="M-52 170h104" stroke="#5b3a22" strokeWidth="5" strokeLinecap="round" />
          <path d="M-20 62h40" stroke="#f3e3c3" strokeWidth="5" strokeLinecap="round" />
        </g>
        {/* tanaman kopi */}
        {[
          [70, 344, 1],
          [140, 362, 0.85],
          [452, 346, 1],
          [512, 372, 0.8],
          [210, 388, 0.7],
        ].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M0 40V-26" stroke="#233628" strokeWidth="5" strokeLinecap="round" />
            <path d="M0-20c-26-6-36 6-40 16 18 6 32 0 40-16Zm0 14c26-6 36 6 40 16-18 6-32 0-40-16Zm0 16c-24-4-34 8-36 18 16 4 30-2 36-18Zm0-36c18-10 30-4 34 4-12 8-26 6-34-4Z" fill="#6e8b4e" />
            <circle cx="-8" cy="4" r="4" fill="#b8321f" />
            <circle cx="9" cy="18" r="4" fill="#b8321f" />
            <circle cx="-5" cy="24" r="3.5" fill="#9c4524" />
          </g>
        ))}
        <rect x="-40" y="396" width="640" height="30" fill="url(#kabut)" opacity="0.7" />
        {/* jalan setapak */}
        <path d="M300 338c-20 40 40 60 10 122h46c14-60-40-80-24-122Z" fill="#c9a57a" opacity="0.85" />
      </g>
    </svg>
  );
}

/** Ilustrasi kecil untuk halaman kosong/404: lumbung tersesat di kabut. */
export function IlustrasiKabut({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" className={className} aria-hidden="true" focusable="false">
      <path d="M0 120c50-26 100-30 160-12s110 14 160-6v98H0Z" fill="#8a9a93" opacity="0.5" />
      <g transform="translate(160 40)">
        <path d="M-44 56 0 10l44 46Z" fill="#9c4524" />
        <path d="M-27 56h54v30h-54Z" fill="#c98b4b" />
        <path d="M-18 86v20M18 86v20" stroke="#5b3a22" strokeWidth="5" strokeLinecap="round" />
      </g>
      <rect x="0" y="118" width="320" height="18" fill="#fff" opacity="0.7" />
      <rect x="20" y="150" width="280" height="14" fill="#fff" opacity="0.55" />
      <path d="M0 170c70-20 150-22 220-8s70 6 100 0v38H0Z" fill="#34503b" />
    </svg>
  );
}
