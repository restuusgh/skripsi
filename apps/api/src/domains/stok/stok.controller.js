import * as svc from "./stok.service.js";

export const getAll      = async (req, res, next) => { try { res.json({ success: true, data: await svc.getAllStok() }); } catch(e){next(e);} };
export const getByProduk = async (req, res, next) => { try { res.json({ success: true, data: await svc.getStokByProduk(+req.params.produkId) }); } catch(e){next(e);} };
export const update      = async (req, res, next) => { try { res.json({ success: true, data: await svc.updateStok(+req.params.produkId, req.body, req.user.id) }); } catch(e){next(e);} };
