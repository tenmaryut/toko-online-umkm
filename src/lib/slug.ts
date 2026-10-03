export const POLA_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** "Kopi Arabika Lereng Pagi (200 g)" → "kopi-arabika-lereng-pagi-200-g" */
export function buatSlug(teks: string, maks = 80): string {
  return teks
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " dan ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maks)
    .replace(/-+$/g, "");
}
