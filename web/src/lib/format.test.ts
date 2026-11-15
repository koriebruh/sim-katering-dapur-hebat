import { expect, test } from "vitest";
import { formatHp, hpUntuk, rupiah, samarkanHp } from "./format";

test("rupiah memakai pemisah ribuan titik", () => {
  expect(rupiah(2310000)).toBe("Rp2.310.000");
  expect(rupiah(0)).toBe("Rp0");
});

test("nomor HP disamarkan di tengah", () => {
  expect(samarkanHp("081255500142")).toBe("0812-****-142");
  expect(samarkanHp("0812-5550-0142")).toBe("0812-****-142");
  expect(samarkanHp("12345")).toBe("*****");
});

test("hanya admin yang melihat nomor HP utuh", () => {
  expect(hpUntuk("admin", "081255500142")).toBe(formatHp("081255500142"));
  for (const p of ["dapur", "manajer", "pemilik"] as const) {
    expect(hpUntuk(p, "081255500142")).toBe("0812-****-142");
  }
});
