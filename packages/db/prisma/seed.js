// packages/db/prisma/seed.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai seed database...");

  // Hapus seluruh data lama (urutan penting karena foreign key)
  console.log("Menghapus data lama...");
  await prisma.hasilPrediksi.deleteMany();
  await prisma.detailDistribusi.deleteMany();
  await prisma.distribusi.deleteMany();
  await prisma.stok.deleteMany();
  await prisma.produk.deleteMany();
  await prisma.kendaraan.deleteMany();
  await prisma.tujuanDistribusi.deleteMany();
  await prisma.notifikasi.deleteMany();
  await prisma.laporan.deleteMany();
  await prisma.aktivitasLog.deleteMany();
  await prisma.prediksiStok.deleteMany();
  console.log("Data lama berhasil dihapus");

  // =====================================================================
  // USER
  // =====================================================================
  const admin = await prisma.user.upsert({
    where: { email: "admin@sawit.com" },
    update: {},
    create: {
      nama: "Admin Utama",
      email: "admin@sawit.com",
      password:
        "$2b$10$abcdefghijklmnopqrstuuVGZzZ7Q5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y",
      role: "ADMIN",
      status: "AKTIF",
    },
  });

  console.log("✅ User seeded:", admin.email);

  // =====================================================================
  // PRODUK
  // =====================================================================
  const produk = await prisma.produk.create({
    data: {
      namaProduk: "Crude Palm Oil (CPO)",
      jenisProduk: "Produk Olahan",
      satuan: "Ton",
      deskripsi: "Crude Palm Oil siap didistribusikan",
    },
  });

  console.log("✅ Produk seeded:", produk.namaProduk);

  // =====================================================================
  // STOK
  // =====================================================================
  await prisma.stok.create({
    data: {
      produkId: produk.id,
      jumlahStok: 1200,
      minimalStok: 200,
    },
  });

  console.log("✅ Stok CPO seeded: 1200 ton");

  // =====================================================================
  // TUJUAN DISTRIBUSI
  // =====================================================================
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

  console.log("✅ Tujuan Distribusi:", tujuanList.length);

  // =====================================================================
  // KENDARAAN
  // =====================================================================
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

  console.log("✅ Kendaraan:", kendaraanList.length);

  // =====================================================================
  // HISTORIS DISTRIBUSI 12 BULAN
  // =====================================================================
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
        keterangan: `Distribusi CPO bulan ${tgl.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`,
      },
    });

    await prisma.detailDistribusi.create({
      data: {
        distribusiId: distribusi.id,
        produkId: produk.id,
        jumlah: d.jumlah,
      },
    });

    distribusiCount++;
  }

  console.log("✅ Distribusi historis:", distribusiCount);

  // =====================================================================
  // PREDIKSI - PERBAIKAN: menggunakan enum yang benar
  // =====================================================================
  const periode = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;

  // Prediksi untuk kebutuhan distribusi
  const prediksiKebutuhan = await prisma.prediksiStok.create({
    data: {
      produkId: produk.id,
      periode: periode,
      hasilPrediksi: 0,
      metode: "brain.js-neural-network",
      tipe: "kebutuhan", // ← menggunakan enum yang benar
    },
  });

  // Prediksi untuk stok
  const prediksiStok = await prisma.prediksiStok.create({
    data: {
      produkId: produk.id,
      periode: periode,
      hasilPrediksi: 0,
      metode: "brain.js-neural-network",
      tipe: "stok", // ← menggunakan enum yang benar
    },
  });

  console.log("✅ Prediksi seeded");

  // =====================================================================
  // HASIL PREDIKSI (opsional)
  // =====================================================================
  // Tambahkan hasil prediksi dummy jika diperlukan
  const bulanNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  for (let i = 1; i <= 6; i++) {
    const bulanIndex = (now.getMonth() + i) % 12;
    const bulanName = bulanNames[bulanIndex];
    const tahunPrediksi = now.getFullYear() + (now.getMonth() + i >= 12 ? 1 : 0);
    
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

  console.log("✅ Hasil prediksi seeded");

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

  console.log("✅ Aktivitas log seeded");

  console.log("\n======================================");
  console.log("✅ Seed Database Berhasil!");
  console.log("======================================");
  console.log(`📦 Produk       : ${produk.namaProduk}`);
  console.log(`📊 Stok         : 1200 ton`);
  console.log(`🚚 Distribusi   : ${distribusiCount} bulan`);
  console.log(`🚗 Kendaraan    : ${kendaraanList.length}`);
  console.log(`📍 Tujuan       : ${tujuanList.length}`);
  console.log(`📧 Email Admin  : admin@sawit.com`);
  console.log(`🔑 Password     : password123`);
  console.log("======================================");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });