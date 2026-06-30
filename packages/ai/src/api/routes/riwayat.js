import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/prediksi/riwayat
 * Query: ?tipe=kebutuhan|stok&limit=20
 */
router.get("/riwayat", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const where = req.query.tipe ? { tipe: req.query.tipe } : {};

    const rows = await prisma.hasilPrediksi.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        prediksiStok: {
          include: {
            produk: true,
          },
        },
      },
    });

    const riwayat = rows.map((r) => ({
      id: r.id.toString(),
      tipe: r.tipe,
      bulan: r.bulan,
      nilaiPrediksi: Number(r.nilaiPrediksi),
      produk: r.prediksiStok?.produk?.namaProduk ?? "-",
      input: r.inputData ? JSON.parse(r.inputData) : {},
      prediksi: buildPrediksi(r),
      timestamp: r.createdAt?.toISOString() ?? new Date().toISOString(),
    }));

    res.json({
      success: true,
      total: riwayat.length,
      riwayat,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

/**
 * DELETE /api/prediksi/riwayat/:id
 */
router.delete("/riwayat/:id", async (req, res) => {
  try {
    await prisma.hasilPrediksi.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    res.json({
      success: true,
      message: `Riwayat id ${req.params.id} dihapus.`,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// Reconstruct objek prediksi dari data DB untuk frontend
function buildPrediksi(r) {
  const nilai = Number(r.nilaiPrediksi);

  if (r.tipe === "kebutuhan") {
    return {
      kebutuhanTon: nilai,
      keterangan:
        nilai < 300
          ? "rendah — distribusi normal"
          : nilai < 600
          ? "sedang — perlu pemantauan"
          : "tinggi — segera tambah distribusi",
    };
  }

  return {
    stokPeriodeBerikutnyaTon: nilai,
    status:
      nilai < 600
        ? "Kritis — stok diperkirakan sangat rendah"
        : nilai < 1200
        ? "Cukup — stok dalam batas aman"
        : "Surplus — stok periode berikutnya melimpah",
  };
}

export default router;