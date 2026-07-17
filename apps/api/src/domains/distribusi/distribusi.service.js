import prisma from "@skripsi/db";

const include = {
  tujuanDistribusi: true,
  kendaraan:        true,
  user:             { select: { id: true, nama: true, role: true } },
  detailDistribusi: { include: { produk: true } },
};

export const getAllDistribusi = (user) => {
  // Supir hanya lihat distribusi yang ditugaskan ke kendaraannya
  const where = user.role === "SUPIR" ? { status: { in: ["PROSES", "SELESAI"] } } : {};
  return prisma.distribusi.findMany({ where, include, orderBy: { createdAt: "desc" } });
};

export const getDistribusiById = async (id) => {
  const d = await prisma.distribusi.findUnique({ where: { id }, include });
  if (!d) throw { status: 404, message: "Distribusi tidak ditemukan." };
  return d;
};

export const createDistribusi = async (body, userId) => {
  const { tanggalDistribusi, tujuanDistribusiId, kendaraanId, keterangan, nomorSuratJalan, items } = body;

  const kode = `DIST-${Date.now()}`;

  const distribusi = await prisma.distribusi.create({
    data: {
      kodeDistribusi: kode,
      nomorSuratJalan,
      tanggalDistribusi: new Date(tanggalDistribusi),
      tujuanDistribusiId,
      kendaraanId,
      createdBy: userId,
      keterangan,
      detailDistribusi: {
        create: items.map(({ produkId, jumlah }) => ({ produkId, jumlah })),
      },
    },
    include,
  });

  await prisma.aktivitasLog.create({
    data: { userId, aktivitas: "Buat Distribusi", deskripsi: `Distribusi ${kode} dibuat.` },
  });

  return distribusi;
};

export const updateDistribusi = (id, { tanggalDistribusi, tujuanDistribusiId, kendaraanId, keterangan, nomorSuratJalan }) =>
  prisma.distribusi.update({
    where: { id },
    data:  { tanggalDistribusi: tanggalDistribusi ? new Date(tanggalDistribusi) : undefined, tujuanDistribusiId, kendaraanId, keterangan, nomorSuratJalan },
    include,
  });

export const deleteDistribusi = (id) => prisma.distribusi.delete({ where: { id } });

export const konfirmasiDistribusi = async (id, userId) => {
  const d = await prisma.distribusi.update({
    where: { id },
    data:  { status: "SELESAI" },
    include,
  });

  await prisma.aktivitasLog.create({
    data: { userId, aktivitas: "Konfirmasi Distribusi", deskripsi: `Distribusi ${d.kodeDistribusi} dikonfirmasi selesai.` },
  });

  return d;
};

export const getSuratJalan = async (id) => {
  const d = await prisma.distribusi.findUnique({ where: { id }, include });
  if (!d) throw { status: 404, message: "Distribusi tidak ditemukan." };
  return {
    nomorSuratJalan:   d.nomorSuratJalan,
    kodeDistribusi:    d.kodeDistribusi,
    tanggal:           d.tanggalDistribusi,
    tujuan:            d.tujuanDistribusi,
    kendaraan:         d.kendaraan,
    items:             d.detailDistribusi,
    status:            d.status,
  };
};
