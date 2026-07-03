import express from "express";
import prisma from "@skripsi/db";

const router = express.Router();

router.get("/konteks", async (req, res) => {
  try {
    // produk dipilih dari frontend
    const produk = await prisma.produk.findFirst({
  orderBy: {
    id: "asc",
  },
});

 if (!produk) {
  return res.status(404).json({
    success: false,
    error: "Produk tidak ditemukan.",
  });
}

const produkId = produk.id;

    const stokRow = await prisma.stok.findFirst({
      where: {
        produkId,
      },
      include: {
        produk: true,
      },
      orderBy: {
        tanggalUpdate: "desc",
      },
    });

    const awalBulanLalu = new Date();
    awalBulanLalu.setMonth(awalBulanLalu.getMonth() - 1);
    awalBulanLalu.setDate(1);
    awalBulanLalu.setHours(0, 0, 0, 0);

    const akhirBulanLalu = new Date();
    akhirBulanLalu.setDate(0);
    akhirBulanLalu.setHours(23, 59, 59, 999);

    const distribusiBulanLalu = await prisma.distribusi.findMany({
      where: {
        status: "SELESAI",
        tanggalDistribusi: {
          gte: awalBulanLalu,
          lte: akhirBulanLalu,
        },
      },
      include: {
        detailDistribusi: {
          where: {
            produkId,
          },
        },
      },
    });

    let permintaanBulanLalu = 0;

    distribusiBulanLalu.forEach((d) => {
      d.detailDistribusi.forEach((item) => {
        permintaanBulanLalu += Number(item.jumlah);
      });
    });

    const awalBulanIni = new Date();
    awalBulanIni.setDate(1);
    awalBulanIni.setHours(0, 0, 0, 0);

    const distribusiBulanIni = await prisma.distribusi.findMany({
      where: {
        status: "SELESAI",
        tanggalDistribusi: {
          gte: awalBulanIni,
        },
      },
      include: {
        detailDistribusi: {
          where: {
            produkId,
          },
        },
      },
    });

    let totalDistribusi = 0;

    distribusiBulanIni.forEach((d) => {
      d.detailDistribusi.forEach((item) => {
        totalDistribusi += Number(item.jumlah);
      });
    });

    const adaData = Boolean(stokRow);

    return res.json({
      success: true,

      ada_data: adaData,

      message: adaData
        ? null
        : "Belum ada data stok untuk produk ini.",

      produkId,

      namaProduk: stokRow?.produk?.namaProduk ?? "-",

      stokSaatIni: Number(stokRow?.jumlahStok ?? 0),

      minimalStok: Number(stokRow?.minimalStok ?? 0),

      permintaanBulanLalu,

      distribusiBulanIni: totalDistribusi,

      produksiEstimasi: Math.round(totalDistribusi * 1.2),

      // ganti dari hargaTBS
      hargaProduk: Number(stokRow?.produk?.harga ?? 0),

      tanggalStok:
        stokRow?.tanggalUpdate?.toISOString() ?? null,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;