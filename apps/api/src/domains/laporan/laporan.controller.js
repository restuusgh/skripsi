import * as svc from "./laporan.service.js";

export const getAll   = async (req, res, next) => { try { res.json({ success: true, data: await svc.getAllLaporan() }); } catch(e){next(e);} };
export const getById  = async (req, res, next) => { try { res.json({ success: true, data: await svc.getLaporanById(+req.params.id) }); } catch(e){next(e);} };
export const create   = async (req, res, next) => { try { res.status(201).json({ success: true, data: await svc.createLaporan(req.body, req.user.id) }); } catch(e){next(e);} };
export const remove   = async (req, res, next) => { try { await svc.deleteLaporan(+req.params.id); res.json({ success: true, message: "Laporan dihapus." }); } catch(e){next(e);} };
export const download = async (req, res, next) => {
  try {
    const { buffer, filename } = await svc.generateLaporan(+req.params.id);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch(e){next(e);}
};
