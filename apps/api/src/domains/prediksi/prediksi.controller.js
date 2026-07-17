import prisma from "@skripsi/db";

export const getRiwayat = async (req, res, next) => {
  try {
    const { tipe, limit = 20 } = req.query;
    const where = tipe ? { tipe } : {};
    const data  = await prisma.hasilPrediksi.findMany({
      where,
      include:  { prediksiStok: { include: { produk: true } } },
      orderBy:  { createdAt: "desc" },
      take:     parseInt(limit),
    });
    res.json({ success: true, data });
  } catch(e){ next(e); }
};

export const getById = async (req, res, next) => {
  try {
    const data = await prisma.hasilPrediksi.findUnique({
      where:   { id: +req.params.id },
      include: { prediksiStok: { include: { produk: true } } },
    });
    if (!data) return res.status(404).json({ success: false, message: "Data tidak ditemukan." });
    res.json({ success: true, data });
  } catch(e){ next(e); }
};

export const remove = async (req, res, next) => {
  try {
    await prisma.hasilPrediksi.delete({ where: { id: +req.params.id } });
    res.json({ success: true, message: "Riwayat prediksi dihapus." });
  } catch(e){ next(e); }
};
