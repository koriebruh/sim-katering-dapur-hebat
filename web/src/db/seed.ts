// Data contoh untuk demo. Hanya berjalan jika tabel pengguna masih kosong.
// Jalankan: npm run db:seed
import bcrypt from "bcryptjs";
import { client, db } from "./index";
import { detailPesanan, menu, pelanggan, pembayaran, pengguna, pesanan } from "./schema";

const MENU = [
  ["Nasi Box Ayam Serundeng", "nasi-box-ayam-serundeng", "Nasi putih, ayam serundeng, tahu, tempe, timun", 25000],
  ["Nasi Box Ayam Bakar", "nasi-box-ayam-bakar", "Nasi putih, ayam bakar, timun, tahu, tempe, sambal", 27000],
  ["Nasi Box Cumi Cabe Ijo", "nasi-box-cumi-cabe-ijo", "Nasi putih, cumi cabe ijo, tumis brokoli, mie goreng, tempe orek, timun", 32000],
  ["Paket Hebat 1", "paket-hebat-1", "Nasi putih, ayam goreng, urap kacang panjang, tempe orek, kentang balado, telur dadar", 30000],
  ["Paket Hebat 2", "paket-hebat-2", "Nasi putih, tempe orek, soun goreng, urap kacang panjang, telur ceplok balado", 22000],
  ["Paket Hebat 3", "paket-hebat-3", "Nasi putih, ayam teriyaki, tumis buncis jagung manis, tempe orek, mie goreng, sambal", 28000],
  ["Tumpeng Mini", "tumpeng-mini", "Tempe orek, mie goreng, telur rawis, ayam goreng, urap kacang panjang, kentang balado, timun, sambal", 35000],
] as const;

const PELANGGAN = [
  ["PT Maju Bersama", "081255500142", "Jl. Siliwangi No. 12, Pamulang Barat"],
  ["SDN Pamulang 02", "081355500277", "Jl. Pajajaran No. 3, Pamulang"],
  ["Ibu Dewi", "085755500391", "Perum Reni Jaya Blok C2, Pamulang"],
  ["Keluarga Bpk. Hadi", "081955500418", "Jl. Benda Raya No. 40, Pamulang"],
  ["CV Maju Lancar", "082155500563", "Jl. Surya Kencana No. 8, Pamulang"],
  ["Masjid Al-Ikhlas", "081255500684", "Jl. Lamtoro No. 21, Pamulang Timur"],
  ["Ibu Ratna", "087855500725", "Villa Dago Tol Blok F5, Ciputat"],
  ["PT Sinar Abadi", "081155500836", "Jl. Raya Puspiptek No. 17, Setu"],
] as const;

// [pelanggan, selisih hari kirim dari hari ini, jam, [[menu, jumlah]...], bagian yang sudah dibayar, status]
const PESANAN: [number, number, number, [number, number][], number, "menunggu_dp" | "diproses" | "dikirim" | "selesai"][] = [
  [0, 0, 11, [[3, 50], [1, 30]], 0.5, "diproses"],
  [1, 0, 9, [[4, 80]], 1, "selesai"],
  [2, 0, 11, [[1, 30]], 0.5, "diproses"],
  [3, 0, 16, [[6, 70]], 0.5, "diproses"],
  [4, -1, 12, [[2, 40]], 1, "selesai"],
  [5, -1, 17, [[0, 100]], 0.5, "dikirim"],
  [6, -2, 10, [[5, 25]], 1, "selesai"],
  [7, 3, 12, [[3, 60]], 0, "menunggu_dp"],
  [0, 1, 11, [[5, 45]], 0.5, "diproses"],
  [1, 1, 9, [[4, 60]], 0.5, "diproses"],
  [5, 2, 17, [[0, 40]], 0.5, "diproses"],
  [4, -8, 12, [[3, 55]], 1, "selesai"],
  [2, -15, 11, [[6, 35]], 1, "selesai"],
  [7, -22, 12, [[1, 80]], 0.5, "selesai"],
  [3, -35, 16, [[3, 90], [4, 40]], 1, "selesai"],
  [6, -50, 10, [[2, 30]], 1, "selesai"],
  [0, -65, 11, [[5, 70]], 1, "selesai"],
  [1, -95, 9, [[4, 120]], 1, "selesai"],
  [5, -125, 17, [[0, 90]], 1, "selesai"],
];

async function main() {
  if ((await db.select({ id: pengguna.id }).from(pengguna).limit(1)).length) {
    console.log("Tabel pengguna sudah berisi data; seed dilewati.");
    return;
  }
  const sandi = process.env.SEED_PASSWORD;
  if (!sandi || sandi.length < 10) throw new Error("SEED_PASSWORD minimal 10 karakter");
  const hash = await bcrypt.hash(sandi, 12);

  await db.transaction(async (tx) => {
    const users = await tx.insert(pengguna).values([
      { nama: "Rina Oktaviani", username: "admin.rina", passwordHash: hash, peran: "admin" },
      { nama: "Ibu Sari", username: "dapur.sari", passwordHash: hash, peran: "dapur" },
      { nama: "Budi Santoso", username: "manajer.budi", passwordHash: hash, peran: "manajer" },
      { nama: "Hj. Nurhayati", username: "pemilik.nur", passwordHash: hash, peran: "pemilik" },
    ]).returning({ id: pengguna.id });
    const adminId = users[0].id;

    const menus = await tx.insert(menu).values(
      MENU.map(([nama, slug, komposisi, harga]) => ({ nama, slug, komposisi, harga, foto: `/menu/${slug}.jpg` })),
    ).returning({ id: menu.id, harga: menu.harga });
    const custs = await tx.insert(pelanggan).values(
      PELANGGAN.map(([nama, noHp, alamat]) => ({ nama, noHp, alamat })),
    ).returning({ id: pelanggan.id });

    const urut = new Map<string, number>();
    for (const [c, hari, jam, baris, bagian, status] of PESANAN) {
      const kirim = new Date();
      kirim.setDate(kirim.getDate() + hari);
      kirim.setHours(jam, 0, 0, 0);
      const pesan = new Date(kirim);
      pesan.setDate(pesan.getDate() - 6);
      const awalan = `PSN-${String(kirim.getFullYear()).slice(2)}${String(kirim.getMonth() + 1).padStart(2, "0")}`;
      const n = (urut.get(awalan) ?? 0) + 1;
      urut.set(awalan, n);
      const detail = baris.map(([m, jumlah]) => ({
        menuId: menus[m].id, jumlah, hargaSatuan: menus[m].harga, subtotal: jumlah * menus[m].harga,
      }));
      const total = detail.reduce((a, d) => a + d.subtotal, 0);
      const [p] = await tx.insert(pesanan).values({
        kode: `${awalan}-${String(n).padStart(3, "0")}`, pelangganId: custs[c].id, penggunaId: adminId,
        tglPesan: pesan.toISOString().slice(0, 10), tglKirim: kirim, alamatKirim: PELANGGAN[c][2], total, status,
      }).returning({ id: pesanan.id });
      await tx.insert(detailPesanan).values(detail.map((d) => ({ ...d, pesananId: p.id })));
      if (bagian > 0) {
        const dp = Math.round(total / 2);
        await tx.insert(pembayaran).values({
          pesananId: p.id, penggunaId: adminId, tglBayar: pesan.toISOString().slice(0, 10),
          jenis: "uang_muka", metode: "transfer", jumlah: dp,
        });
        if (bagian === 1) {
          await tx.insert(pembayaran).values({
            pesananId: p.id, penggunaId: adminId, tglBayar: kirim.toISOString().slice(0, 10),
            jenis: "pelunasan", metode: "tunai", jumlah: total - dp,
          });
        }
      }
    }
  });
  console.log("Seed selesai: 4 pengguna, 7 menu, 8 pelanggan,", PESANAN.length, "pesanan.");
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => client.end());
