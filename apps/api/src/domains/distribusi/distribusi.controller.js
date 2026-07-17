import * as svc from "./distribusi.service.js";

export const getAll       = async (req, res, next) => { try { res.json({ success: true, data: await svc.getAllDistribusi(req.user) }); } catch(e){next(e);} };
export const getById      = async (req, res, next) => { try { res.json({ success: true, data: await svc.getDistribusiById(+req.params.id) }); } catch(e){next(e);} };
export const create       = async (req, res, next) => { try { res.status(201).json({ success: true, data: await svc.createDistribusi(req.body, req.user.id) }); } catch(e){next(e);} };
export const update       = async (req, res, next) => { try { res.json({ success: true, data: await svc.updateDistribusi(+req.params.id, req.body) }); } catch(e){next(e);} };
export const remove       = async (req, res, next) => { try { await svc.deleteDistribusi(+req.params.id); res.json({ success: true, message: "Distribusi dihapus." }); } catch(e){next(e);} };
export const konfirmasi   = async (req, res, next) => { try { res.json({ success: true, data: await svc.konfirmasiDistribusi(+req.params.id, req.user.id) }); } catch(e){next(e);} };
export const getSuratJalan = async (req, res, next) => { try { res.json({ success: true, data: await svc.getSuratJalan(+req.params.id) }); } catch(e){next(e);} };
