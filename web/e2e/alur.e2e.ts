// Uji alur TC-01 sampai TC-15 dari Bab IV laporan. Jalankan: npm run test:e2e
// Uji ini menulis data contoh ke database lokal; jangan arahkan ke database produksi.
import { expect, test, type Page } from "@playwright/test";

const SANDI = process.env.SEED_PASSWORD ?? "";
const wib = (n: number) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date(Date.now() + n * 864e5));
const TGL = wib(5);
const unik = Date.now().toString().slice(-6);

async function masuk(page: Page, username: string, sandi = SANDI) {
  await page.context().clearCookies();
  await page.goto("/login");
  await page.locator("#username").fill(username);
  await page.locator("#password").fill(sandi);
  await page.locator("main button[type=submit]").click();
}
const pesan = (page: Page) => page.locator("main [role=alert], main [role=status]");
const kartuJadwal = (page: Page, kode: string) => page.locator("ol > li", { hasText: kode });

test.describe.configure({ mode: "serial" });
test.beforeAll(() => expect(SANDI, "SEED_PASSWORD harus ada di .env.local").not.toBe(""));

let kodeLunas = "";
let kodeDp = "";

test("TC-01, TC-02: login benar masuk dashboard, sandi salah ditolak", async ({ page }) => {
  await masuk(page, "wawa", "sandi-salah");
  await expect(pesan(page)).toContainText("Nama pengguna atau kata sandi salah.");
  await expect(page).toHaveURL(/\/login$/);
  await masuk(page, "wawa");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.locator("h1")).toContainText("Halo, Wawa");
});

test("TC-03: hak akses per peran ditegakkan server", async ({ page }) => {
  await masuk(page, "andini");
  await expect(page).toHaveURL(/\/dashboard$/);
  for (const p of ["/laporan", "/pesanan", "/menu-paket", "/pelanggan"]) {
    await page.goto(p);
    await expect(page, `dapur ke ${p}`).toHaveURL(/\/dashboard\?akses=ditolak$/);
  }
  await expect(pesan(page)).toContainText("tidak memiliki akses");
  await masuk(page, "james");
  await expect(page).toHaveURL(/\/dashboard$/);
  for (const p of ["/pesanan/baru", "/jadwal", "/menu-paket"]) {
    await page.goto(p);
    await expect(page, `manajer ke ${p}`).toHaveURL(/\/dashboard\?akses=ditolak$/);
  }
});

test("TC-04: menu baru tersimpan dan muncul di form pesanan; nama ganda ditolak", async ({ page }) => {
  await masuk(page, "wawa");
  await expect(page).toHaveURL(/\/dashboard$/);
  const nama = `Menu Uji ${unik}`;
  const isi = async () => {
    await page.goto("/menu-paket");
    await page.locator("#nama").fill(nama);
    await page.locator("#komposisi").fill("Nasi putih, ayam uji, sambal");
    await page.locator("#harga").fill("28000");
    await page.locator("main form button").first().click();
  };
  await isi();
  await expect(pesan(page)).toContainText("Data tersimpan.");
  await isi();
  await expect(pesan(page)).toContainText("Nama menu sudah dipakai.");
  await page.goto("/pesanan/baru");
  await expect(page.locator("select[name=menuId] option", { hasText: nama })).toHaveCount(1);
});

test("TC-05: pelanggan tanpa nomor HP ditolak oleh server", async ({ page }) => {
  await masuk(page, "wawa");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/pelanggan");
  const sebelum = await page.locator("tbody tr").count();
  await page.locator("#nama").fill(`Tanpa HP ${unik}`);
  // validasi peramban dilepas agar yang diuji validasi server
  await page.locator("#noHp").evaluate((i) => { i.removeAttribute("required"); i.removeAttribute("pattern"); });
  await page.locator("main form button").first().click();
  await expect(pesan(page)).toContainText("nomor HP wajib diisi");
  await expect(page.locator("tbody tr")).toHaveCount(sebelum);
});

test("TC-06, TC-07: tanggal lewat dan DP kurang ditolak; pesanan lengkap tersimpan dengan total benar", async ({ page }) => {
  await masuk(page, "wawa");
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/pesanan/baru");
  await page.locator("#pelangganId").selectOption({ label: "Ibu Dewi" });
  await page.locator("#tgl").evaluate((i) => i.removeAttribute("min"));
  await page.locator("#tgl").fill(wib(-1));
  await page.getByRole("button", { name: "Simpan pesanan" }).click();
  await expect(pesan(page)).toContainText("sudah lewat");

  await page.goto("/pesanan/baru");
  await page.locator("#pelangganId").selectOption({ label: "Ibu Dewi" });
  await page.locator("#tgl").fill(TGL);
  await page.locator("#dp").fill("1000");
  await page.getByRole("button", { name: "Simpan pesanan" }).click();
  await expect(pesan(page)).toContainText("Uang muka minimal 50%");

  await page.goto("/pesanan/baru");
  await page.locator("#pelangganId").selectOption({ label: "PT Maju Bersama" });
  await expect(page.locator("#alamatKirim")).not.toHaveValue("");
  await page.locator("#tgl").fill(TGL);
  await page.locator("select[name=menuId]").nth(0).selectOption({ label: "Paket Hebat 1 — Rp30.000" });
  await page.locator("input[name=jumlah]").nth(0).fill("50");
  await page.getByRole("button", { name: "Tambah menu" }).click();
  await page.locator("select[name=menuId]").nth(1).selectOption({ label: "Nasi Box Ayam Bakar — Rp27.000" });
  await page.locator("input[name=jumlah]").nth(1).fill("30");
  await page.locator("#catatan").fill(`Catatan uji ${unik}`);
  await page.getByRole("button", { name: "50%" }).click();
  await expect(page.locator("#dp")).toHaveValue("1155000");
  await page.getByRole("button", { name: "Simpan pesanan" }).click();
  await expect(page).toHaveURL(/\/pesanan\/PSN-\d{4}-\d{3}(\?|$)/);
  kodeDp = new URL(page.url()).pathname.split("/").pop()!;
  const main = page.locator("main");
  await expect(main).toContainText("Rp2.310.000");
  await expect(main).toContainText("Diproses");
  await expect(main).toContainText(/Sisa tagihan\s*Rp1\.155\.000/);
});

test("TC-08, TC-09: uang muka mengubah status, kelebihan bayar ditolak, pelunasan menutup tagihan", async ({ page }) => {
  await masuk(page, "wawa");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/pesanan/baru");
  await page.locator("#pelangganId").selectOption({ label: "Ibu Dewi" });
  await page.locator("#tgl").fill(TGL);
  await page.locator("select[name=menuId]").nth(0).selectOption({ label: "Tumpeng Mini — Rp35.000" });
  await page.locator("input[name=jumlah]").nth(0).fill("40");
  await page.getByRole("button", { name: "Simpan pesanan" }).click();
  await expect(page).toHaveURL(/\/pesanan\/PSN-\d{4}-\d{3}(\?|$)/);
  kodeLunas = new URL(page.url()).pathname.split("/").pop()!;
  const main = page.locator("main");
  await expect(main).toContainText("Menunggu DP");

  await page.getByRole("button", { name: "Catat pembayaran" }).click();
  await expect(pesan(page)).toContainText("Pembayaran tercatat.");
  await expect(main).toContainText("Diproses");
  await expect(main).toContainText(/Sisa tagihan\s*Rp700\.000/);

  await page.locator("#jumlah").evaluate((i) => i.removeAttribute("max"));
  await page.locator("#jumlah").fill("2000000");
  await page.getByRole("button", { name: "Catat pembayaran" }).click();
  await expect(pesan(page)).toContainText("Jumlah melebihi sisa tagihan.");
  await expect(main).toContainText(/Sisa tagihan\s*Rp700\.000/);

  await page.getByRole("button", { name: "Catat pembayaran" }).click();
  await expect(main).toContainText(/Sisa tagihan\s*Rp0/);
  await expect(page.getByRole("button", { name: "Catat pembayaran" })).toHaveCount(0);
});

test("TC-12: pencarian menurut status, nama, dan kode", async ({ page }) => {
  await masuk(page, "wawa");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/pesanan?status=diproses");
  const status = await page.locator("tbody tr td:last-child").allInnerTexts();
  expect(status.length).toBeGreaterThan(0);
  expect(status.every((s) => s.includes("Diproses"))).toBe(true);
  await page.goto(`/pesanan?q=${kodeDp}`);
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody tr")).not.toContainText("****"); // admin melihat nomor HP utuh
  await page.goto("/pesanan?q=%25"); // "%" tidak boleh menjadi wildcard
  await expect(page.locator("tbody tr")).toHaveCount(0);
});

test("TC-10, TC-11: jadwal dapur, rekap komponen, dan perubahan status", async ({ page }) => {
  await masuk(page, "andini");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto(`/jadwal?tgl=${TGL}`);
  const kartu = kartuJadwal(page, kodeDp);
  await expect(kartu).toContainText("Paket Hebat 1");
  await expect(kartu).toContainText("50 porsi");
  await expect(kartu).toContainText(`Catatan uji ${unik}`);
  await expect(page.locator("main")).not.toContainText(/08\d{2}-/); // dapur tidak melihat nomor HP
  await expect(page.locator("section", { hasText: "Rekap kebutuhan komponen" })).toContainText(/nasi putih/i);

  // memalsukan tujuan status menjadi "batal" harus ditolak server
  await kartu.locator("input[name=ke]").evaluate((i: HTMLInputElement) => { i.value = "batal"; });
  await kartu.getByRole("button").click();
  await expect(pesan(page)).toContainText("Perubahan status tidak diizinkan.");
  await expect(kartuJadwal(page, kodeDp)).toContainText("Diproses");

  await kartuJadwal(page, kodeDp).getByRole("button", { name: "Kirim" }).click();
  await expect(kartuJadwal(page, kodeDp)).toContainText("Dikirim");
  await kartuJadwal(page, kodeDp).getByRole("button", { name: "Selesai" }).click();
  await expect(kartuJadwal(page, kodeDp)).toContainText("Selesai");
});

test("TC-13: laporan manajer konsisten dengan ekspor CSV dan nomor HP tersamar", async ({ page }) => {
  await masuk(page, "james");
  await expect(page).toHaveURL(/\/dashboard$/);
  const bulan = TGL.slice(0, 7);
  const rentang = `dari=${bulan}-01&sampai=${bulan}-28`;
  await page.goto(`/laporan?${rentang}`);
  const baris = await page.locator("section").first().locator("tbody tr").allInnerTexts();
  const angka = (s: string) => Number(s.split("\t").pop()!.replace(/\D/g, ""));
  const total = angka(baris[baris.length - 1]);
  expect(total).toBeGreaterThan(0);
  expect(baris.slice(0, -1).reduce((a, r) => a + angka(r), 0)).toBe(total);

  const csv = await page.request.get(`/laporan/ekspor?${rentang}`);
  expect(csv.status()).toBe(200);
  expect(csv.headers()["content-type"]).toContain("text/csv");
  const akhir = (await csv.text()).trim().split("\r\n").pop()!;
  expect(Number(akhir.split(",").pop()!.replace(/\D/g, ""))).toBe(total);

  await page.goto(`/pesanan/${kodeLunas}`);
  await expect(page.locator("main")).toContainText("****");
  await expect(page.getByRole("button", { name: "Catat pembayaran" })).toHaveCount(0);
});

test("TC-14: dashboard pemilik memuat ringkasan usaha", async ({ page }) => {
  await masuk(page, "enih");
  await expect(page).toHaveURL(/\/dashboard$/);
  const main = page.locator("main");
  for (const t of ["Omzet bulan ini", "Omzet 6 bulan terakhir", "Menu terlaris bulan ini", "Piutang belum lunas", "Perlu perhatian"]) {
    await expect(main).toContainText(t);
  }
  await expect(page.locator("figure [role=img] > div")).toHaveCount(6);
  await expect(page.locator("aside nav a")).toHaveText(["Dashboard", "Laporan"]);
});

test("TC-15: halaman publik terbuka tanpa login, halaman internal tidak", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/");
  expect(await page.locator("#menu li").count()).toBeGreaterThanOrEqual(7);
  expect(await page.locator('a[href^="https://wa.me/"]').count()).toBeGreaterThanOrEqual(2);
  await expect(page.locator("h1")).toHaveCount(1);
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
  expect(ld["@type"]).toBe("FoodEstablishment");
  expect((await page.request.get("/robots.txt").then((r) => r.text()))).toContain("Disallow: /pesanan");
  for (const p of ["/dashboard", "/pesanan", "/jadwal", "/laporan", "/menu-paket", "/pelanggan", `/pesanan/${kodeDp}`]) {
    await page.goto(p);
    await expect(page, p).toHaveURL(/\/login$/);
  }
  const ekspor = await page.request.get("/laporan/ekspor", { maxRedirects: 0 });
  expect(ekspor.status()).toBe(307);
});

test("tampilan ponsel 390 px tanpa gulir mendatar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  const luber = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.goto("/");
  expect(await luber(), "/").toBe(0);
  await masuk(page, "wawa");
  await expect(page).toHaveURL(/\/dashboard$/);
  for (const p of ["/dashboard", "/pesanan", "/pesanan/baru", `/pesanan/${kodeDp}`, `/jadwal?tgl=${TGL}`, "/menu-paket", "/pelanggan"]) {
    await page.goto(p);
    expect(await luber(), p).toBe(0);
  }
});
