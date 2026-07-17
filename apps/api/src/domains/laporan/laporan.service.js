import prisma from "@skripsi/db";
import ExcelJS from "exceljs";

export const getAllLaporan = () =>
  prisma.laporan.findMany({ include: { user: { select: { nama: true } } }, orderBy: { tanggalCetak: "desc" } });

export const getLaporanById = async (id) => {
  const l = await prisma.laporan.findUnique({ where: { id }, include: { user: { select: { nama: true } } } });
  if (!l) throw { status: 404, message: "Laporan tidak ditemukan." };
  return l;
};

export const createLaporan = (data, userId) =>
  prisma.laporan.create({ data: { ...data, userId } });

export const deleteLaporan = (id) => prisma.laporan.delete({ where: { id } });

export const generateLaporan = async (id) => {
  const laporan = await getLaporanById(id);

  // Ambil data distribusi sesuai periode laporan
  const distribusi = await prisma.distribusi.findMany({
    where:   { status: "SELESAI" },
    include: { detailDistribusi: { include: { produk: true } }, tujuanDistribusi: true, kendaraan: true },
    orderBy: { tanggalDistribusi: "asc" },
  });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Laporan Distribusi");

  // Header
  ws.mergeCells("A1:G1");
  ws.getCell("A1").value    = `LAPORAN DISTRIBUSI KELAPA SAWIT — ${laporan.periode}`;
  ws.getCell("A1").font     = { bold: true, size: 14 };
  ws.getCell("A1").alignment = { horizontal: "center" };

  ws.addRow([]);
  ws.addRow(["No", "Kode", "Tanggal", "Tujuan", "Kendaraan", "Produk", "Jumlah (ton)"]);
  ws.getRow(3).font = { bold: true };

  let no = 1;
  for (const d of distribusi) {
    for (const item of d.detailDistribusi) {
      ws.addRow([
        no++,
        d.kodeDistribusi,
        new Date(d.tanggalDistribusi).toLocaleDateString("id-ID"),
        d.tujuanDistribusi?.namaTujuan ?? "-",
        d.kendaraan?.platNomor ?? "-",
        item.produk?.namaProduk ?? "-",
        Number(item.jumlah),
      ]);
    }
  }

  ws.columns.forEach((col) => { col.width = 18; });

  const buffer = await wb.xlsx.writeBuffer();
  return { buffer, filename: `laporan-distribusi-${laporan.periode}.xlsx` };
};
