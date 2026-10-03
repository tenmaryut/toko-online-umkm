import Link from "next/link";

/** Tanda lumbung (rumah padi panggung) dengan garis kabut. */
export function TandaLumbung({ ukuran = 36, className }: { ukuran?: number; className?: string }) {
  return (
    <svg width={ukuran} height={ukuran} viewBox="0 0 48 48" aria-hidden="true" focusable="false" className={className}>
      <rect width="48" height="48" rx="12" fill="#34503b" />
      <path d="M9 23 24 9l15 14Z" fill="#e3b04b" />
      <path d="M15 23h18v9H15z" fill="#f6f2e9" />
      <path d="M19 32v6M29 32v6" stroke="#f6f2e9" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M8 40c5-2.4 9-2.4 14 0s9 2.4 18 0" stroke="#8a9a93" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M21 18h6" stroke="#9c4524" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="group inline-flex shrink-0 items-center gap-2 rounded-xl sm:gap-2.5">
      <TandaLumbung />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.05rem] font-semibold tracking-tight text-arang min-[400px]:text-lg sm:text-xl">Lumbung Kabut</span>
        <span className="hidden text-[0.7rem] font-medium uppercase tracking-[0.14em] text-arang-2 sm:block">
          Kebun &amp; dapur lereng
        </span>
      </span>
    </Link>
  );
}
