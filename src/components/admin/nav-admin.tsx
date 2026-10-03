"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IkonKotak, IkonLabel, IkonOrang, IkonRingkasan, IkonStruk } from "../ikon";

const MENU = [
  { href: "/admin", label: "Ringkasan", Ikon: IkonRingkasan },
  { href: "/admin/pesanan", label: "Pesanan", Ikon: IkonStruk },
  { href: "/admin/produk", label: "Produk", Ikon: IkonKotak },
  { href: "/admin/kategori", label: "Kategori", Ikon: IkonLabel },
  { href: "/admin/pelanggan", label: "Pelanggan", Ikon: IkonOrang },
];

export function NavAdmin({ perluDiproses }: { perluDiproses: number }) {
  const path = usePathname();
  return (
    <nav aria-label="Menu admin">
      <ul className="flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:pb-0">
        {MENU.map(({ href, label, Ikon }) => {
          const aktif = href === "/admin" ? path === "/admin" : path.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={aktif ? "page" : undefined}
                className="flex min-h-11 items-center gap-2.5 whitespace-nowrap rounded-xl px-3 text-sm font-medium text-kertas/85 hover:bg-kertas/10 hover:text-kertas aria-[current=page]:bg-kertas aria-[current=page]:text-lumut-tua"
              >
                <Ikon ukuran={18} />
                {label}
                {href === "/admin/pesanan" && perluDiproses > 0 && (
                  <span className="ml-auto rounded-full bg-kunyit px-1.5 text-xs font-bold text-arang">
                    {perluDiproses}
                    <span className="sr-only"> perlu diproses</span>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
