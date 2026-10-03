import { FooterToko } from "@/components/footer-toko";
import { HeaderToko } from "@/components/header-toko";
import { PenyediaUmpanBalik } from "@/components/umpan-balik";

export default function LayoutToko({ children }: LayoutProps<"/">) {
  return (
    <PenyediaUmpanBalik>
      <HeaderToko />
      <main id="konten" className="flex-1">
        {children}
      </main>
      <FooterToko />
    </PenyediaUmpanBalik>
  );
}
