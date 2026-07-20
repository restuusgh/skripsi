import * as svc from "./stok.service.js";

export const getAll = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getAllStok() }); }
  catch (e) { next(e); }
};

export const getRiwayat = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getRiwayat(req.query.produkId) }); }
  catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    const { tipe, jumlah, alasan, catatan } = req.body;
    const data = await svc.updateStok(req.params.produkId, { tipe, jumlah, alasan, catatan }, req.user.id);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};