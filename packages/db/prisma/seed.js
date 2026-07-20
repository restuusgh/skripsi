import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai seed database...");

  // Hapus seluruh data lama (urutan penting karena foreign key)
console.log("Menghapus data lama...");

await prisma.$executeRawUnsafe(`
  TRUNCATE TABLE
    "hasil_prediksi",
    "prediksi_stok",
    "detail_distribusi",
    "distribusi",
    "stok",
    "produk",
    "kendaraan",
    "tujuan_distribusi",
    "notifikasi",
    "laporan",
    "aktivitas_log"
  RESTART IDENTITY CASCADE;
`);

console.log("Data lama berhasil dihapus");

  const hashAdmin = await bcrypt.hash("admin123", 10);
  const hashSupir = await bcrypt.hash("supir123", 10);
  const hashGudang = await bcrypt.hash("gudang123", 10);
  const hashPimpinan = await bcrypt.hash("pimpinan123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@sawit.com" },
    update: { password: hashAdmin, role: "ADMIN", status: "AKTIF" },
    create: {
      nama: "Admin Utama",
      email: "admin@sawit.com",
      password: hashAdmin,
      role: "ADMIN",
      status: "AKTIF",
    },
  });

  console.log("User seeded:", admin.email);

  const supir = await prisma.user.upsert({
    where: { email: "supir@sawit.com" },
    update: { password: hashSupir, role: "SUPIR", status: "AKTIF" },
    create: {
      nama: "Budi Santoso",
      email: "supir@sawit.com",
      password: hashSupir,
      role: "SUPIR",
      status: "AKTIF",
    },
  });

  const gudang = await prisma.user.upsert({
    where: { email: "gudang@sawit.com" },
    update: { password: hashGudang, role: "KEPALA_GUDANG", status: "AKTIF" },
    create: {
      nama: "Rina Wati",
      email: "gudang@sawit.com",
      password: hashGudang,
      role: "KEPALA_GUDANG",
      status: "AKTIF",
    },
  });

  const pimpinan = await prisma.user.upsert({
    where: { email: "pimpinan@sawit.com" },
    update: { password: hashPimpinan, role: "PIMPINAN", status: "AKTIF" },
    create: {
      nama: "Direktur Utama",
      email: "pimpinan@sawit.com",
      password: hashPimpinan,
      role: "PIMPINAN",
      status: "AKTIF",
    },
  });

  console.log("User seeded:", supir.email);
  console.log("User seeded:", gudang.email);
  console.log("User seeded:", pimpinan.email);


  const cpo = await prisma.produk.create({
    data: {
      namaProduk: "Crude Palm Oil (CPO)",
      jenisProduk: "Bahan Baku",
      satuan: "Ton",
      deskripsi: "Crude Palm Oil siap didistribusikan",
    },
  });

  const minyakGoreng = await prisma.produk.create({
    data: {
      namaProduk: "Minyak Goreng",
      jenisProduk: "Produk Olahan",
      satuan: "Ton",
      deskripsi: "Minyak goreng hasil pengolahan CPO",
    },
  });

  console.log("Produk seeded:", cpo.namaProduk);
  console.log("Produk seeded:", minyakGoreng.namaProduk);

  
  await prisma.stok.createMany({
    data: [
      {
        produkId: cpo.id,
        jumlahStok: 1200,
        minimalStok: 200,
      },
      {
        produkId: minyakGoreng.id,
        jumlahStok: 850,
        minimalStok: 150,
      },
    ],
  });

  console.log("Stok CPO: 1200 ton");
  console.log("Stok Minyak Goreng: 850 ton");

  const tujuanData = [
    {
      namaTujuan: "Distributor CPO Bandung",
      alamat: "Jl. Industri No.1 Bandung",
      kontak: "0221234567",
    },
    {
      namaTujuan: "Distributor CPO Cirebon",
      alamat: "Jl. Pelabuhan No.5 Cirebon",
      kontak: "0231876543",
    },
    {
      namaTujuan: "Distributor CPO Garut",
      alamat: "Jl. Raya Garut No.12",
      kontak: "0262765432",
    },
  ];

  const tujuanList = [];

  for (const t of tujuanData) {
    const item = await prisma.tujuanDistribusi.create({
      data: t,
    });
    tujuanList.push(item);
  }

  console.log("Tujuan Distribusi:", tujuanList.length);

  
  const kendaraanData = [
    {
      platNomor: "D 1234 AB",
      namaSupir: "Budi Santoso",
      kapasitas: 10,
      status: "tersedia",
    },
    {
      platNomor: "D 5678 CD",
      namaSupir: "Andi Wijaya",
      kapasitas: 15,
      status: "tersedia",
    },
    {
      platNomor: "D 9012 EF",
      namaSupir: "Rudi Hermawan",
      kapasitas: 8,
      status: "tersedia",
    },
  ];

  const kendaraanList = [];

  for (const k of kendaraanData) {
    const item = await prisma.kendaraan.create({
      data: k,
    });
    kendaraanList.push(item);
  }

  console.log("Kendaraan:", kendaraanList.length);


  const historisData = [
    { bulanOffset: -11, jumlah: 380, tj: 0, kd: 0 },
    { bulanOffset: -10, jumlah: 420, tj: 1, kd: 1 },
    { bulanOffset: -9, jumlah: 395, tj: 2, kd: 2 },
    { bulanOffset: -8, jumlah: 460, tj: 0, kd: 0 },
    { bulanOffset: -7, jumlah: 435, tj: 1, kd: 1 },
    { bulanOffset: -6, jumlah: 475, tj: 2, kd: 2 },
    { bulanOffset: -5, jumlah: 410, tj: 0, kd: 0 },
    { bulanOffset: -4, jumlah: 390, tj: 1, kd: 1 },
    { bulanOffset: -3, jumlah: 445, tj: 2, kd: 2 },
    { bulanOffset: -2, jumlah: 500, tj: 0, kd: 0 },
    { bulanOffset: -1, jumlah: 465, tj: 1, kd: 1 },
    { bulanOffset: 0, jumlah: 310, tj: 2, kd: 2 },
  ];

  const now = new Date();
  let distribusiCount = 0;

  for (const d of historisData) {
    const tgl = new Date(
      now.getFullYear(),
      now.getMonth() + d.bulanOffset,
      15
    );

    const tahun = tgl.getFullYear();
    const bulan = String(tgl.getMonth() + 1).padStart(2, "0");

    // Generate kode unik dengan timestamp
    const timestamp = Date.now().toString().slice(-6);
    const kode = `DIST-${tahun}${bulan}-${String(distribusiCount + 1).padStart(3, "0")}-${timestamp}`;
    const nomorSuratJalan = `SJ-${tahun}${bulan}-${String(distribusiCount + 1).padStart(3, "0")}`;

    // Tentukan status
    let status = "PROSES";
    if (d.bulanOffset < 0) {
      status = "SELESAI";
    } else if (d.bulanOffset === 0) {
      status = "PROSES";
    }

    const distribusi = await prisma.distribusi.create({
      data: {
        kodeDistribusi: kode,
        nomorSuratJalan: nomorSuratJalan,
        tanggalDistribusi: tgl,
        tujuanDistribusiId: tujuanList[d.tj].id,
        kendaraanId: kendaraanList[d.kd].id,
        createdBy: admin.id,
        status: status,
        keterangan: `Distribusi CPO bulan ${tgl.toLocaleString("id-ID", {
          month: "long",
          year: "numeric",
        })}`,
      },
    });

    await prisma.detailDistribusi.create({
      data: {
        distribusiId: distribusi.id,
        produkId: d.bulanOffset % 2 === 0 ? cpo.id : minyakGoreng.id,
        jumlah: d.jumlah,
      },
    });

    distribusiCount++;
  }

  console.log("Distribusi historis:", distribusiCount);

  

  const periode = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;

  // Prediksi kebutuhan CPO
  const prediksiKebutuhan = await prisma.prediksiStok.create({
    data: {
      produkId: cpo.id,
      periode,
      hasilPrediksi: 0,
      metode: "brain.js-neural-network",
      tipe: "kebutuhan",
    },
  });

  // Prediksi stok CPO
  const prediksiStok = await prisma.prediksiStok.create({
    data: {
      produkId: cpo.id,
      periode,
      hasilPrediksi: 0,
      metode: "brain.js-neural-network",
      tipe: "stok",
    },
  });

  console.log("Prediksi seeded");

  // =====================================================================
  // HASIL PREDIKSI (opsional)
  // =====================================================================
  const bulanNames = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];

  for (let i = 1; i <= 6; i++) {
    const bulanIndex = (now.getMonth() + i) % 12;
    const bulanName = bulanNames[bulanIndex];
    const tahunPrediksi =
      now.getFullYear() + (now.getMonth() + i >= 12 ? 1 : 0);

    // Hasil untuk prediksi kebutuhan
    await prisma.hasilPrediksi.create({
      data: {
        prediksiStokId: prediksiKebutuhan.id,
        bulan: `${bulanName} ${tahunPrediksi}`,
        nilaiPrediksi: Math.round(350 + Math.random() * 200),
        tipe: "kebutuhan",
        inputData: JSON.stringify({
          stokSaatIni: 1200,
          permintaanBulanLalu: 310,
          musim: i % 2 === 0 ? 1 : 0,
          wilayah: i % 3,
        }),
      },
    });

    // Hasil untuk prediksi stok
    await prisma.hasilPrediksi.create({
      data: {
        prediksiStokId: prediksiStok.id,
        bulan: `${bulanName} ${tahunPrediksi}`,
        nilaiPrediksi: Math.round(800 + Math.random() * 400),
        tipe: "stok",
        inputData: JSON.stringify({
          stokSaatIni: 1200,
          produksi: 500,
          permintaan: 310,
          hargaTBS: 2800,
        }),
      },
    });
  }

  console.log("Hasil prediksi seeded");

  // =====================================================================
  // AKTIVITAS LOG
  // =====================================================================
  const aktivitasData = [
    {
      userId: admin.id,
      aktivitas: "LOGIN",
      deskripsi: "Admin login ke sistem",
    },
    {
      userId: admin.id,
      aktivitas: "CREATE",
      deskripsi: "Menambahkan data produk CPO",
    },
    {
      userId: admin.id,
      aktivitas: "CREATE",
      deskripsi: "Membuat 12 data distribusi historis",
    },
    {
      userId: admin.id,
      aktivitas: "CREATE",
      deskripsi: "Membuat prediksi stok dan kebutuhan",
    },
  ];

  for (const log of aktivitasData) {
    await prisma.aktivitasLog.create({
      data: log,
    });
  }

  console.log("Aktivitas log seeded");

  console.log("\n======================================");
  console.log("Seed Database Berhasil!");
  console.log("======================================");
  console.log("Produk:");
  console.log(`   - ${cpo.namaProduk}`);
  console.log(`   - ${minyakGoreng.namaProduk}`);
  console.log(`Stok         : 1200 ton`);
  console.log(`Distribusi   : ${distribusiCount} bulan`);
  console.log(`Kendaraan    : ${kendaraanList.length}`);
  console.log(`Tujuan       : ${tujuanList.length}`);
  console.log(`Email Admin  : admin@sawit.com`);
  console.log(`Password     : password123`);
  console.log("======================================");
}

main()
  .catch((e) => {
    console.error("Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
