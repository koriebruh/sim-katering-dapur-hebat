import { expect, test } from "vitest";
import { formatHp, hpUntuk, kelompokIp, rupiah, samarkanHp } from "./format";

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

test("IPv6 dikelompokkan per /64, IPv4 tidak diubah", () => {
  expect(kelompokIp("203.0.113.7")).toBe("203.0.113.7");
  expect(kelompokIp("::ffff:203.0.113.7")).toBe("203.0.113.7");
  expect(kelompokIp("2001:db8:12:34:aaaa:bbbb:cccc:dddd")).toBe("2001:db8:12:34::/64");
  expect(kelompokIp("2001:0DB8:12:34::1")).toBe("2001:db8:12:34::/64");
  expect(kelompokIp("2001:db8::1")).toBe(kelompokIp("2001:db8::ffff"));
  expect(kelompokIp("tidak-diketahui")).toBe("tidak-diketahui");
});
