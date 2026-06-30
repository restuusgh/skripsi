import express from "express";
import { PrismaClient } from "@prisma/client";
import { predictKebutuhan } from "../../models/kebutuhanModel.js";
import { normalizeInput, denormalize } from "../../data/normalizer.js";

const router = express.Router();
const prisma = new PrismaClient();

const WILAYAH = { 0: "Dalam Kota", 0.5: "Luar Kota", 1: "Antar Provinsi" };
const MUSIM = { 0: "Kemarau", 1: "Hujan" };

async function getPrediksiParentId(produkId) {
  const ps = await prisma.prediksiStok.findFirst({
    where: { produkId, tipe: "kebutuhan" },
    orderBy: { createdAt: "desc" },
  });

  if (ps) return ps.id;

  const produk = await prisma.produk.findFirst();

  const baru = await prisma.prediksiStok.create({
    data: {
      produkId: produkId ?? produk.id,
      periode: new Date().toISOString().slice(0, 7),
      hasilPrediksi: 0,
      metode: "brain.js-neural-network",
      tipe: "kebutuhan",
    },
  });

  return baru.id;
}

/**
 * POST /api/prediksi/kebutuhan
 */
router.post("/kebutuhan", async (req, res) => {
  try {
    const { wilayah, musim, stok, permintaan } = req.body;

    if ([wilayah, musim, stok, permintaan].some((v) => v === undefined)) {
      return res.status(400).json({
        error: "Field wilayah, musim, stok, permintaan wajib diisi.",
      });
    }

    const inputNorm = {
      wilayah: Number(wilayah),
      musim: Number(musim),
      ...normalizeInput(
        {
          stok: Number(stok),
          permintaan: Number(permintaan),
        },
        ["stok", "permintaan"]
      ),
    };

    const outputNorm = predictKebutuhan(inputNorm);

    const kebutuhanTon = Math.round(
      denormalize("kebutuhan", outputNorm.kebutuhan)
    );

    const prediksi = {
      kebutuhanTon,
      kebutuhanNorm: outputNorm.kebutuhan,
      keterangan: getKeterangan(outputNorm.kebutuhan),
    };

    try {
      const produk = await prisma.produk.findFirst();

      const parentId = await getPrediksiParentId(produk?.id);

      const bulan = new Date().toLocaleDateString("id-ID", {
        month: "short",
        year: "numeric",
      });

      await prisma.hasilPrediksi.create({
        data: {
          prediksiStokId: parentId,
          bulan,
          nilaiPrediksi: kebutuhanTon,
          tipe: "kebutuhan",
          inputData: JSON.stringify({
            wilayah,
            musim,
            stok,
            permintaan,
          }),
        },
      });
    } catch (dbErr) {
      console.warn("[kebutuhan] Gagal simpan ke DB:", dbErr.message);
    }

    res.json({
      success: true,
      input: {
        ...req.body,
        wilayahLabel: WILAYAH[wilayah] ?? "-",
        musimLabel: MUSIM[musim] ?? "-",
      },
      prediksi,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

function getKeterangan(norm) {
  if (norm < 0.3) return "rendah — distribusi normal";
  if (norm < 0.6) return "sedang — perlu pemantauan";
  return "tinggi — segera tambah distribusi";
}

export default router;