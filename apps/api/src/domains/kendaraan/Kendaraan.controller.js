import * as svc from "./kendaraan.service.js";

export const getAll = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getAllKendaraan() }); }
  catch (e) { next(e); }
};

export const getById = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getKendaraanById(+req.params.id) }); }
  catch (e) { next(e); }
};

// Dipanggil dari HP supir secara berkala (mis. tiap 15 detik) selama distribusi berjalan
export const updateLokasi = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    if (typeof lat !== "number" || typeof lng !== "number") {
      throw { status: 400, message: "lat dan lng wajib diisi berupa angka." };
    }
    const data = await svc.updateLokasi(+req.params.id, { lat, lng });
    res.json({ success: true, data });
  } catch (e) { next(e); }
};