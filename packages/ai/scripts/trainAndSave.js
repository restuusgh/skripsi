import { PrismaClient } from "@prisma/client";
import { trainKebutuhan } from "../src/models/kebutuhanModel.js";
import { trainStok } from "../src/models/stokModel.js";
import {
  kebutuhanFallback,
  stokFallback,
} from "../src/data/trainingData.js";
import { normalize } from "../src/data/normalizer.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Petakan bulan ke musim: Apr–Sep = kemarau (0), Okt–Mar = hujan (1)
const toMusim = (month) => (month >= 3 && month <= 8 ? 0 : 1);

// Petakan TujuanDistribusi ke kategori wilayah 0/0.5/1
// Sesuaikan dengan data tujuan kamu
function toWilayah(namaTujuan = '') {
  const n = namaTujuan.toLowerCase();
  if (n.includes('kota') || n.includes('lokal'))    return 0;
  if (n.includes('provinsi') || n.includes('antar')) return 1;
  return 0.5; // default: luar kota
}

async function buildTrainingData() {
  console.log('📡 Mengambil data distribusi dari database...');

  const rows = await prisma.distribusi.findMany({
    where:   { status: 'SELESAI' },
    orderBy: { tanggalDistribusi: 'asc' },
    include: {
      detailDistribusi: true,
      tujuanDistribusi: true,
    },
  });

  if (rows.length < 3) {
    console.warn(`⚠️  Hanya ${rows.length} data di DB. Menggunakan fallback data.`);
    return { kebutuhanTraining: kebutuhanFallback, stokTraining: stokFallback };
  }

  // Ambil stok terkini
  const stokRow = await prisma.stok.findFirst({
    orderBy: { tanggalUpdate: 'desc' },
  });
  const stokSaatIni = Number(stokRow?.jumlahStok ?? 1000);

  // Kelompokkan distribusi per bulan
  const perBulan = {};
  for (const r of rows) {
    const tgl = r.tanggalDistribusi;
    const key = `${tgl.getFullYear()}-${tgl.getMonth()}`;
    if (!perBulan[key]) {
      perBulan[key] = {
        bulan:    tgl.getMonth(),
        tahun:    tgl.getFullYear(),
        jumlah:   0,
        wilayah:  toWilayah(r.tujuanDistribusi?.namaTujuan),
      };
    }
    for (const dd of r.detailDistribusi) {
      perBulan[key].jumlah += Number(dd.jumlah);
    }
  }

  const bulanArr = Object.values(perBulan).sort(
    (a, b) => a.tahun !== b.tahun ? a.tahun - b.tahun : a.bulan - b.bulan
  );

  console.log(`📊 ${bulanArr.length} bulan data ditemukan`);

  // ── Training data Kebutuhan ───────────────────────────────────────────────
  const kebutuhanTraining = [];
  for (let i = 1; i < bulanArr.length; i++) {
    const prev = bulanArr[i - 1];
    const curr = bulanArr[i];
    kebutuhanTraining.push({
      input: {
        wilayah:    curr.wilayah,
        musim:      toMusim(curr.bulan),
        stok:       normalize('stok', stokSaatIni),
        permintaan: normalize('permintaan', prev.jumlah),
      },
      output: {
        kebutuhan: normalize('kebutuhan', curr.jumlah),
      },
    });
  }

  // ── Training data Stok ────────────────────────────────────────────────────
  const stokTraining = [];
  for (let i = 0; i < bulanArr.length - 1; i++) {
    const curr = bulanArr[i];
    const next = bulanArr[i + 1];
    const estimasiProduksi    = curr.jumlah * 1.2;
    const estimasiStokBulanIni = Math.max(0, stokSaatIni - curr.jumlah * (bulanArr.length - 1 - i) * 0.05);
    const estimasiStokBulanDepan = Math.max(0, estimasiStokBulanIni + estimasiProduksi - next.jumlah);

    stokTraining.push({
      input: {
        stok:       normalize('stok', estimasiStokBulanIni),
        produksi:   normalize('produksi', estimasiProduksi),
        permintaan: normalize('permintaan', curr.jumlah),
        hargaTBS:   normalize('hargaTBS', 2800),
      },
      output: {
        stokBerikutnya: normalize('stokBerikutnya', estimasiStokBulanDepan),
      },
    });
  }

  console.log(`✅ Kebutuhan samples: ${kebutuhanTraining.length}`);
  console.log(`✅ Stok samples     : ${stokTraining.length}`);

  return { kebutuhanTraining, stokTraining };
}

async function main() {
  const dir = path.join(__dirname, '../saved-models');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const { kebutuhanTraining, stokTraining } = await buildTrainingData();

  console.log('\n=== Training model kebutuhan distribusi ===');
  trainKebutuhan(kebutuhanTraining);

  console.log('\n=== Training model stok periode berikutnya ===');
  trainStok(stokTraining);

  console.log('\n✅ Semua model tersimpan di saved-models/');
}

main()
  .catch((e) => { console.error('❌ Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());