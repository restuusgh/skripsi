import prisma from "@skripsi/db";

export const getAllStok = () =>
  prisma.stok.findMany({
    include: { produk: true },
    orderBy: { produk: { namaProduk: "asc" } },
  });

export const getRiwayat = (produkId) =>
  prisma.riwayatStok.findMany({
    where: produkId ? { produkId: Number(produkId) } : undefined,
    include: {
      produk: { select: { namaProduk: true, satuan: true } },
      user: { select: { nama: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

// Menambah atau mengurangi stok satu produk, sekaligus mencatat riwayatnya.
// Kalau produk belum punya baris Stok sama sekali, dibuat otomatis (upsert).
export const updateStok = async (produkIdRaw, { tipe, jumlah, alasan, catatan }, userId) => {
  const produkId = Number(produkIdRaw);
  const jml = Number(jumlah);

  if (!["MASUK", "KELUAR"].includes(tipe)) throw { status: 400, message: "Tipe harus MASUK atau KELUAR." };
  if (!jml || jml <= 0) throw { status: 400, message: "Jumlah harus lebih dari 0." };
  if (!alasan) throw { status: 400, message: "Alasan wajib diisi." };

  return prisma.$transaction(async (tx) => {
    const stokSekarang = await tx.stok.findUnique({ where: { produkId } });
    const stokAwal = Number(stokSekarang?.jumlahStok ?? 0);
    const stokAkhir = tipe === "MASUK" ? stokAwal + jml : stokAwal - jml;

    if (stokAkhir < 0) {
      throw { status: 400, message: `Stok tidak cukup. Tersedia: ${stokAwal}.` };
    }

    const stokBaru = await tx.stok.upsert({
      where: { produkId },
      update: { jumlahStok: stokAkhir },
      create: { produkId, jumlahStok: stokAkhir, minimalStok: 0 },
      include: { produk: true },
    });

    const riwayat = await tx.riwayatStok.create({
      data: { produkId, userId, tipe, jumlah: jml, alasan, catatan, stokAwal, stokAkhir },
      include: {
        produk: { select: { namaProduk: true, satuan: true } },
        user: { select: { nama: true } },
      },
    });

    return { stok: stokBaru, riwayat };
  });
};