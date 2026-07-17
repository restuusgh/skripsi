import * as svc from "./produk.service.js";

export const getAll  = async (req, res, next) => { try { res.json({ success: true, data: await svc.getAllProduk() }); } catch(e){next(e);} };
export const getById = async (req, res, next) => { try { res.json({ success: true, data: await svc.getProdukById(+req.params.id) }); } catch(e){next(e);} };
export const create  = async (req, res, next) => { try { res.status(201).json({ success: true, data: await svc.createProduk(req.body) }); } catch(e){next(e);} };
export const update  = async (req, res, next) => { try { res.json({ success: true, data: await svc.updateProduk(+req.params.id, req.body) }); } catch(e){next(e);} };
export const remove  = async (req, res, next) => { try { await svc.deleteProduk(+req.params.id); res.json({ success: true, message: "Produk dihapus." }); } catch(e){next(e);} };
