/** Pola validasi kecil yang dipakai server (Zod) dan klien (indikator progres checkout). */
export const POLA_HP = /^(?:\+62|62|0)8[1-9]\d{6,11}$/;
export const POLA_KODE_POS = /^\d{5}$/;

export function normalkanHp(nilai: string): string {
  return nilai.replace(/[\s-]/g, "");
}
