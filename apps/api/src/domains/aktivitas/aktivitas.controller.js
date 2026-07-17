import prisma from "@skripsi/db";

export const getAll = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const data  = await prisma.aktivitasLog.findMany({
      include:  { user: { select: { nama: true, role: true } } },
      orderBy:  { tanggal: "desc" },
      take:     limit,
    });
    res.json({ success: true, data });
  } catch(e){ next(e); }
};
