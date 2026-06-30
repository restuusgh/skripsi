import express from "express";
import { PrismaClient } from "@prisma/client";
import { predictStok } from "../../models/stokModel.js";
import { normalizeInput, denormalize } from "../../data/normalizer.js";

const router = express.Router();
const prisma = new PrismaClient();

const BULAN_LABEL = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/**
 * GET /api/prediksi/tren?bulan=6
 */
router.get("/tren", async (req, res) => {
  try {
    const bulanPrediksi = Number(req.query.bulan) || 6;

    // ── Ambil distribusi historis dari DB ───────────────────────────────
    const distribusiRows = await prisma.distribusi.findMany({
      where: { status: "SELESAI" },
      orderBy: { tanggalDistribusi: "asc" },
      include: {
        detailDistribusi: true,
      },
    });

    // Kelompokkan per bulan
    const perBulan = {};

    for (const d of distribusiRows) {
      const tgl = d.tanggalDistribusi;

      const key = `${tgl.getFullYear()}-${String(tgl.getMonth()).padStart(
        2,
        "0"
      )}`;

      if (!perBulan[key]) {
        perBulan[key] = {
          label: `${BULAN_LABEL[tgl.getMonth()]} ${tgl.getFullYear()}`,
          bulanIdx: tgl.getMonth(),
          tahun: tgl.getFullYear(),
          distribusi: 0,
          permintaan: 0,
          stok: 0,
        };
      }

      for (const dd of d.detailDistribusi) {
        perBulan[key].distribusi += Number(dd.jumlah);
      }
    }

    // Ambil stok terakhir
    const stokRow = await prisma.stok.findFirst({
      orderBy: {
        tanggalUpdate: "desc",
      },
    });

    const stokTerkini = Number(stokRow?.jumlahStok ?? 1000);

    // Isi estimasi historis
    const keys = Object.keys(perBulan).sort();

    keys.forEach((k, i) => {
      perBulan[k].stok = Math.max(
        0,
        stokTerkini - (keys.length - 1 - i) * 50
      );

      perBulan[k].permintaan = Math.round(
        perBulan[k].distribusi * 1.05
      );
    });

    const historis = Object.values(perBulan)
      .sort((a, b) =>
        a.tahun !== b.tahun
          ? a.tahun - b.tahun
          : a.bulanIdx - b.bulanIdx
      )
      .map(({ label, distribusi, permintaan, stok }) => ({
        bulan: label,
        distribusi,
        permintaan,
        stok,
      }));

    // ── Prediksi ────────────────────────────────────────────────────────

    const avgDistribusi = historis.length
      ? historis.reduce((s, h) => s + h.distribusi, 0) /
        historis.length
      : 400;

    const prediksi = [];

    let stokSaatIni = stokTerkini;

    const now = new Date();

    for (let i = 0; i < bulanPrediksi; i++) {
      const bulanKe = (now.getMonth() + i) % 12;

      const tahunKe =
        now.getFullYear() +
        Math.floor((now.getMonth() + i) / 12);

      const inputNorm = normalizeInput(
        {
          stok: stokSaatIni,
          produksi: avgDistribusi * 1.2,
          permintaan: avgDistribusi,
          hargaTBS: 2800,
        },
        ["stok", "produksi", "permintaan", "hargaTBS"]
      );

      const out = predictStok(inputNorm);

      const stokBaru = Math.round(
        denormalize("stokBerikutnya", out.stokBerikutnya)
      );

      const distribusiPrediksi = Math.round(
        avgDistribusi * (0.9 + Math.random() * 0.2)
      );

      prediksi.push({
        bulan: `${BULAN_LABEL[bulanKe]} ${tahunKe}`,
        stokPrediksi: stokBaru,
        distribusiPrediksi,
        isPrediksi: true,
      });

      stokSaatIni = stokBaru;
    }

    // ── Summary ─────────────────────────────────────────────────────────

    const totalDistribusi = historis.reduce(
      (s, h) => s + h.distribusi,
      0
    );

    res.json({
      success: true,
      historis,
      prediksi,
      summary: {
        totalDistribusiHistoris: totalDistribusi,
        rataRataDistribusiBulanan: historis.length
          ? Math.round(totalDistribusi / historis.length)
          : 0,
        stokTerkini,
        jumlahBulanHistoris: historis.length,
      },
    });
  } catch (err) {
    console.error("[tren]", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

export default router;