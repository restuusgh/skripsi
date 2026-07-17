import prisma from "@skripsi/db";

export const getAllStok = () =>
  prisma.stok.findMany({ include: { produk: true }, orderBy: { tanggalUpdate: "desc" } });

export const getStokByProduk = async (produkId) => {
  const s = await prisma.stok.findUnique({ where: { produkId }, include: { produk: true } });
  if (!s) throw { status: 404, message: "Stok tidak ditemukan." };
  return s;
};

export const updateStok = async (produkId, { jumlahStok, minimalStok }, userId) => {
  const stok = await prisma.stok.upsert({
    where:  { produkId },
    update: { jumlahStok, minimalStok, tanggalUpdate: new Date() },
    create: { produkId, jumlahStok, minimalStok: minimalStok ?? 0 },
    include: { produk: true },
  });

  // Catat aktivitas
  await prisma.aktivitasLog.create({
    data: {
      userId,
      aktivitas: "Update Stok",
      deskripsi: `Stok produk "${stok.produk.namaProduk}" diupdate menjadi ${jumlahStok} ${stok.produk.satuan}`,
    },
  });

  return stok;
};
