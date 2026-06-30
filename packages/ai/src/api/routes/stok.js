import express from "express";
import { PrismaClient } from "@prisma/client";
import { predictStok } from "../../models/stokModel.js";
import { normalizeInput, denormalize } from "../../data/normalizer.js";

const router = express.Router();
const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getPrediksiParentId(produkId) {
  const ps = await prisma.prediksiStok.findFirst({
    where: { produkId, tipe: "stok" },
    orderBy: { createdAt: "desc" },
  });

  if (ps) return ps.id;

  const baru = await prisma.prediksiStok.create({
    data: {
      produkId,
      periode: new Date().toISOString().slice(0, 7),
      hasilPrediksi: 0,
      metode: "brain.js-neural-network",
      tipe: "stok",
    },
  });

  return baru.id;
}

function getStatus(norm) {
  if (norm < 0.3) return "Kritis — stok diperkirakan sangat rendah";
  if (norm < 0.6) return "Cukup — stok dalam batas aman";
  return "Surplus — stok periode berikutnya melimpah";
}

/**
 * Normalisasi + prediksi ANN + denormalisasi
 * @returns {{ inputNorm, outputNorm, stokPrediksi, status }}
 */
function runPrediksi({ stok, produksi, permintaan, hargaTBS }) {
  const inputNorm = normalizeInput(
    {
      stok: Number(stok),
      produksi: Number(produksi),
      permintaan: Number(permintaan),
      hargaTBS: Number(hargaTBS),
    },
    ["stok", "produksi", "permintaan", "hargaTBS"]
  );

  const outputNorm = predictStok(inputNorm);

  const stokPrediksi = Math.round(
    denormalize("stokBerikutnya", outputNorm.stokBerikutnya)
  );

  const status = getStatus(outputNorm.stokBerikutnya);

  return { inputNorm, outputNorm, stokPrediksi, status };
}

function buildNormalisasiDetail(input, inputNorm) {
  const { stok, produksi, permintaan, hargaTBS } = input;
  return {
    rumus: "(nilai - minimum) / (maksimum - minimum)",
    stok: {
      perhitungan: `${stok} / 2000`,
      hasil: inputNorm.stok,
    },
    produksi: {
      perhitungan: `${produksi} / 1000`,
      hasil: inputNorm.produksi,
    },
    permintaan: {
      perhitungan: `${permintaan} / 1000`,
      hasil: inputNorm.permintaan,
    },
    hargaTBS: {
      perhitungan: `(${hargaTBS}-1000)/(5000-1000)`,
      hasil: inputNorm.hargaTBS,
    },
  };
}

function buildPenjelasan(input, outputNorm, stokPrediksi, status) {
  const { stok, produksi, permintaan, hargaTBS } = input;
  const outputNormVal = outputNorm.stokBerikutnya;

  // ── Analisis dinamis berdasarkan hubungan input ──────────────────────────
  const alasan = [];

  // 1. Perbandingan produksi vs permintaan
  if (produksi > permintaan) {
    alasan.push(
      `Produksi (${produksi} ton) lebih besar dibandingkan permintaan (${permintaan} ton) sehingga stok diperkirakan meningkat.`
    );
  } else if (produksi < permintaan) {
    alasan.push(
      `Permintaan (${permintaan} ton) lebih besar dibandingkan produksi (${produksi} ton) sehingga stok diperkirakan menurun.`
    );
  } else {
    alasan.push(
      `Produksi dan permintaan seimbang (${produksi} ton) sehingga stok diperkirakan relatif stabil.`
    );
  }

  // 2. Kondisi stok awal
  if (stok > 1500) {
    alasan.push(
      `Stok awal sebesar ${stok} ton tergolong tinggi sehingga persediaan masih sangat aman.`
    );
  } else if (stok > 700) {
    alasan.push(
      `Stok awal sebesar ${stok} ton berada pada tingkat sedang dan menjadi dasar perhitungan prediksi.`
    );
  } else {
    alasan.push(
      `Stok awal sebesar ${stok} ton tergolong rendah sehingga perlu mendapat perhatian lebih.`
    );
  }

  // 3. Pengaruh harga TBS
  if (hargaTBS > 3500) {
    alasan.push(
      `Harga TBS sebesar Rp${Number(hargaTBS).toLocaleString("id-ID")}/kg tergolong tinggi sehingga dapat memengaruhi keputusan distribusi.`
    );
  } else if (hargaTBS < 1500) {
    alasan.push(
      `Harga TBS sebesar Rp${Number(hargaTBS).toLocaleString("id-ID")}/kg tergolong rendah sehingga dapat memengaruhi profitabilitas distribusi.`
    );
  } else {
    alasan.push(
      `Harga TBS sebesar Rp${Number(hargaTBS).toLocaleString("id-ID")}/kg berada pada kisaran normal sehingga tidak memberikan pengaruh ekstrem terhadap prediksi.`
    );
  }

  // 4. Selisih produksi vs permintaan (kuantitatif)
  const selisih = Math.abs(produksi - permintaan);
  if (selisih > 0) {
    alasan.push(
      produksi > permintaan
        ? `Selisih produksi dan permintaan sebesar ${selisih} ton memperkuat estimasi kenaikan stok.`
        : `Selisih permintaan dan produksi sebesar ${selisih} ton memperkuat estimasi penurunan stok.`
    );
  }

  // ── Kesimpulan dinamis ───────────────────────────────────────────────────
  const arahStok = stokPrediksi > stok ? "meningkat" : stokPrediksi < stok ? "menurun" : "stabil";
  const selisihStok = Math.abs(stokPrediksi - stok);

  const kesimpulan =
    `Karena produksi (${produksi} ton) ${produksi >= permintaan ? "lebih besar dari" : "lebih kecil dari"} permintaan ` +
    `(${permintaan} ton), AI memperkirakan stok akan ${arahStok} dari ${stok} ton menjadi sekitar ` +
    `${stokPrediksi} ton pada periode berikutnya (${arahStok === "stabil" ? "tidak ada perubahan signifikan" : `${arahStok === "meningkat" ? "naik" : "turun"} ${selisihStok} ton`}).`;

  // ── Rekomendasi berdasarkan status ───────────────────────────────────────
  const rekomendasi = status.includes("Surplus")
    ? `Stok diperkirakan berada pada kondisi Surplus. Produksi dapat dipertahankan sambil tetap memantau perubahan permintaan pasar.`
    : status.includes("Cukup")
    ? `Stok masih dalam batas aman. Disarankan tetap memantau tren produksi dan permintaan agar stok tidak turun ke kondisi kritis.`
    : `Stok diprediksi mendekati kondisi Kritis. Produksi perlu segera ditingkatkan atau permintaan dikendalikan untuk menghindari kekurangan stok.`;

  return {
    ringkasan:
      `AI memprediksi stok periode berikutnya sebesar ${stokPrediksi} ton.`,

    analisis: {
      stokSaatIni: `${stok} ton`,
      produksi:    `${produksi} ton`,
      permintaan:  `${permintaan} ton`,
      hargaTBS:    `Rp${Number(hargaTBS).toLocaleString("id-ID")}/kg`,
    },

    alasan,

    prosesAI: [
      "Data dinormalisasi ke rentang 0–1.",
      "Artificial Neural Network memproses hubungan antara stok, produksi, permintaan, dan harga TBS berdasarkan pola data historis.",
      `Model menghasilkan output normalisasi sebesar ${outputNormVal.toFixed(6)}.`,
      "Output tersebut dikembalikan ke satuan ton menggunakan proses denormalisasi.",
    ],

    kesimpulan,
    rekomendasi,
  };
}


function validateBody(body) {
  const { stok, produksi, permintaan, hargaTBS } = body;
  return ![stok, produksi, permintaan, hargaTBS].some((v) => v === undefined);
}

async function autoSaveToDB({
  stok,
  produksi,
  permintaan,
  hargaTBS,
  stokPrediksi,
}) {
  const produk = await prisma.produk.findFirst();

  if (!produk) {
    console.warn("Produk belum tersedia, hasil prediksi tidak disimpan.");
    return;
  }

  const parentId = await getPrediksiParentId(produk.id);

  const bulan = new Date().toLocaleDateString("id-ID", {
    month: "short",
    year: "numeric",
  });

  await prisma.hasilPrediksi.create({
    data: {
      prediksiStokId: parentId,
      bulan,
      nilaiPrediksi: stokPrediksi,
      tipe: "stok",
      inputData: JSON.stringify({
        stok,
        produksi,
        permintaan,
        hargaTBS,
      }),
    },
  });
}

// ─── Routes ─────────────────────────────────────────────────────────────────

/**
 * POST /api/prediksi/stok
 */
router.post("/stok", async (req, res) => {
  try {
    if (!validateBody(req.body)) {
      return res.status(400).json({
        error: "Field stok, produksi, permintaan, hargaTBS wajib diisi.",
      });
    }

    const { stok, produksi, permintaan, hargaTBS } = req.body;
    const { outputNorm, stokPrediksi, status } = runPrediksi(req.body);

    const prediksi = {
      stokPeriodeBerikutnyaTon: stokPrediksi,
      stokNorm: outputNorm.stokBerikutnya,
      status,
      penjelasan: buildPenjelasan(
        { stok: Number(stok), produksi: Number(produksi), permintaan: Number(permintaan), hargaTBS: Number(hargaTBS) },
        outputNorm,
        stokPrediksi,
        status
      ),
    };

    try {
      await autoSaveToDB({ stok, produksi, permintaan, hargaTBS, stokPrediksi });
    } catch (dbErr) {
      console.warn("[stok] Gagal simpan ke DB:", dbErr.message);
    }

    res.json({
      success: true,
      input: req.body,
      prediksi,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/prediksi/stok/explain
 */
router.post("/stok/explain", async (req, res) => {
  try {
    if (!validateBody(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi.",
      });
    }

    const { stok, produksi, permintaan, hargaTBS } = req.body;
    const input = {
      stok:       Number(stok),
      produksi:   Number(produksi),
      permintaan: Number(permintaan),
      hargaTBS:   Number(hargaTBS),
    };

    const { inputNorm, outputNorm, stokPrediksi, status } = runPrediksi(input);

    res.json({
      success: true,
      metode: {
        nama:        "Artificial Neural Network",
        library:     "Brain.js",
        hiddenLayer: [8, 4],
        activation:  "Sigmoid",
      },
      input,
      normalisasi:  buildNormalisasiDetail(input, inputNorm),
      prosesANN: {
        inputNeuron: [
          inputNorm.stok,
          inputNorm.produksi,
          inputNorm.permintaan,
          inputNorm.hargaTBS,
        ],
        hiddenLayer:        "[8,4]",
        persamaanNeuron:    "z = Σ(w × x) + b",
        fungsiAktivasi:     "σ(z) = 1 / (1 + e^-z)",
        outputNormalisasi:  outputNorm.stokBerikutnya,
      },
      denormalisasi: {
        rumus:        "(output × (maksimum-minimum)) + minimum",
        perhitungan:  `${outputNorm.stokBerikutnya.toFixed(6)} × 2000`,
        hasil:        stokPrediksi,
      },
      prediksi: {
        stokPeriodeBerikutnya: `${stokPrediksi} ton`,
        status,
      },
      penjelasan: buildPenjelasan(input, outputNorm, stokPrediksi, status),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;