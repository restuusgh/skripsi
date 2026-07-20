import prisma from "@skripsi/db";

const include = { lokasi: true };

export const getAllKendaraan = () =>
  prisma.kendaraan.findMany({ include, orderBy: { platNomor: "asc" } });

export const getKendaraanById = async (id) => {
  const k = await prisma.kendaraan.findUnique({ where: { id }, include });
  if (!k) throw { status: 404, message: "Kendaraan tidak ditemukan." };
  return k;
};

// Upsert lokasi: buat baris baru kalau belum ada, atau update kalau sudah ada
export const updateLokasi = (kendaraanId, { lat, lng }) =>
  prisma.lokasiKendaraan.upsert({
    where: { kendaraanId },
    update: { lat, lng },
    create: { kendaraanId, lat, lng },
  });