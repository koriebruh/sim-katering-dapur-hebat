import { describe, expect, test } from "vitest";
import {
  awalanKode, bolehTransisi, jenisGambar, cekPembayaran, geserHari, hitungTotal, minimalDp, pathAman, rekapKomponen,
  rentangHari, selCsv, tanggalSah, tanggalWib, transisiUntuk,
} from "./pesanan";

test("total = jumlah x harga tiap baris (TC-06)", () => {
  expect(hitungTotal([{ hargaSatuan: 30000, jumlah: 50 }, { hargaSatuan: 27000, jumlah: 30 }])).toBe(2_310_000);
  expect(hitungTotal([])).toBe(0);
});

test("uang muka minimal 50% dibulatkan ke atas", () => {
  expect(minimalDp(2_310_000)).toBe(1_155_000);
  expect(minimalDp(25_001)).toBe(12_501);
});

describe("cekPembayaran", () => {
  const dasar = { total: 2_310_000, dibayar: 0, status: "menunggu_dp" as const };
  test("uang muka tepat 50% diterima (TC-08)", () => expect(cekPembayaran({ ...dasar, jumlah: 1_155_000 })).toBeNull());
  test("uang muka di bawah 50% ditolak", () => expect(cekPembayaran({ ...dasar, jumlah: 1_000_000 })).toMatch(/minimal 50%/));
  test("melebihi sisa ditolak (TC-09)", () =>
    expect(cekPembayaran({ total: 2_310_000, dibayar: 1_155_000, status: "diproses", jumlah: 2_000_000 })).toMatch(/melebihi sisa/));
  test("pelunasan tepat sisa diterima", () =>
    expect(cekPembayaran({ total: 2_310_000, dibayar: 1_155_000, status: "diproses", jumlah: 1_155_000 })).toBeNull());
  test("pelunasan sebagian diterima", () =>
    expect(cekPembayaran({ total: 2_310_000, dibayar: 1_155_000, status: "dikirim", jumlah: 1 })).toBeNull());
  test("sudah lunas ditolak", () =>
    expect(cekPembayaran({ total: 100, dibayar: 100, status: "selesai", jumlah: 1 })).toMatch(/lunas/));
  test("nol, negatif, pecahan ditolak", () => {
    for (const j of [0, -5, 1.5, NaN]) expect(cekPembayaran({ ...dasar, jumlah: j })).toMatch(/lebih dari nol/);
  });
  test("pesanan batal ditolak", () => expect(cekPembayaran({ ...dasar, status: "batal", jumlah: 1_155_000 })).toMatch(/dibatalkan/));
});

describe("transisi status", () => {
  test("dapur boleh kirim dan selesaikan (TC-11)", () => {
    expect(bolehTransisi("diproses", "dikirim", "dapur")).toBe(true);
    expect(bolehTransisi("dikirim", "selesai", "dapur")).toBe(true);
  });
  test("dapur tidak boleh membatalkan; manajer dan pemilik tidak boleh mengubah apa pun", () => {
    expect(bolehTransisi("diproses", "batal", "dapur")).toBe(false);
    for (const p of ["manajer", "pemilik"] as const) expect(transisiUntuk("diproses", p)).toEqual([]);
  });
  test("tidak bisa melompat atau mundur", () => {
    expect(bolehTransisi("menunggu_dp", "diproses", "admin")).toBe(false);
    expect(bolehTransisi("menunggu_dp", "dikirim", "admin")).toBe(false);
    expect(bolehTransisi("dikirim", "diproses", "admin")).toBe(false);
    expect(transisiUntuk("selesai", "admin")).toEqual([]);
    expect(transisiUntuk("batal", "admin")).toEqual([]);
  });
  test("admin boleh membatalkan sebelum dikirim saja", () => {
    expect(bolehTransisi("menunggu_dp", "batal", "admin")).toBe(true);
    expect(bolehTransisi("diproses", "batal", "admin")).toBe(true);
    expect(bolehTransisi("dikirim", "batal", "admin")).toBe(false);
  });
});

test("rekap komponen menjumlahkan porsi lintas menu (TC-10)", () => {
  const r = rekapKomponen([
    { komposisi: "Nasi putih, tempe orek, urap kacang panjang", jumlah: 80 },
    { komposisi: "Nasi putih, Tempe Orek , ayam goreng", jumlah: 50 },
  ]);
  expect(r).toEqual([["nasi putih", 130], ["tempe orek", 130], ["urap kacang panjang", 80], ["ayam goreng", 50]]);
  expect(rekapKomponen([{ komposisi: " , ", jumlah: 5 }])).toEqual([]);
});

test("tanggal memakai WIB, bukan UTC", () => {
  // 21 Nov 2026 23.30 UTC sudah 22 Nov di WIB
  const d = new Date("2026-11-21T23:30:00Z");
  expect(tanggalWib(d)).toBe("2026-11-22");
  expect(awalanKode(d)).toBe("PSN-2611");
  expect(awalanKode(new Date("2026-11-30T18:00:00Z"))).toBe("PSN-2612");
  const [awal, akhir] = rentangHari("2026-11-21");
  expect(awal.toISOString()).toBe("2026-11-20T17:00:00.000Z");
  expect(akhir.getTime() - awal.getTime()).toBe(86_400_000);
  expect(geserHari("2026-11-30", 1)).toBe("2026-12-01");
  expect(geserHari("2026-03-01", -1)).toBe("2026-02-28");
});

test("validasi tanggal", () => {
  expect(tanggalSah("2026-11-21")).toBe(true);
  for (const s of [undefined, "", "21/11/2026", "2026-13-40", "2026-11-21; drop"]) expect(tanggalSah(s)).toBe(false);
});

test("sel CSV mengutip dan menetralkan rumus", () => {
  expect(selCsv('Paket "Hebat" 1')).toBe('"Paket ""Hebat"" 1"');
  expect(selCsv("=HYPERLINK(1)")).toBe(`"'=HYPERLINK(1)"`);
  expect(selCsv("+62812")).toBe(`"'+62812"`);
  expect(selCsv(2310000)).toBe('"2310000"');
});

test("redirect hanya ke path internal", () => {
  expect(pathAman("/jadwal?tgl=2026-11-21", "/x")).toBe("/jadwal?tgl=2026-11-21");
  for (const p of ["//evil.example", "/\\evil.example", "https://evil.example", "javascript:alert(1)", undefined, 5]) {
    expect(pathAman(p, "/pesanan")).toBe("/pesanan");
  }
});

test("jenis gambar dikenali dari isi file", () => {
  const isi = (awal: number[]) => Uint8Array.from([...awal, ...Array(16).fill(0)]);
  expect(jenisGambar(isi([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
  expect(jenisGambar(isi([0x89, 0x50, 0x4e, 0x47]))).toBe("image/png");
  expect(jenisGambar(Uint8Array.from([..."RIFF"].map((c) => c.charCodeAt(0)).concat([0, 0, 0, 0], [..."WEBP"].map((c) => c.charCodeAt(0)), [0, 0])))).toBe("image/webp");
  expect(jenisGambar(isi([0x3c, 0x73, 0x76, 0x67]))).toBeNull(); // <svg
  expect(jenisGambar(isi([0x4d, 0x5a]))).toBeNull(); // berkas program
  expect(jenisGambar(new Uint8Array(3))).toBeNull();
  expect(jenisGambar(new Uint8Array(2 * 1024 * 1024 + 1).fill(0xff))).toBeNull();
});
