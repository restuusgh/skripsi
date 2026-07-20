import * as svc from "./user.service.js";

export const getAll   = async (req, res, next) => { try { res.json({ success: true, data: await svc.getAllUsers() }); } catch(e){next(e);} };
export const getById  = async (req, res, next) => { try { res.json({ success: true, data: await svc.getUserById(+req.params.id) }); } catch(e){next(e);} };
export const create   = async (req, res, next) => { try { res.status(201).json({ success: true, data: await svc.createUser(req.body) }); } catch(e){next(e);} };
export const update   = async (req, res, next) => { try { res.json({ success: true, data: await svc.updateUser(+req.params.id, req.body) }); } catch(e){next(e);} };
export const remove   = async (req, res, next) => { try { await svc.deleteUser(+req.params.id); res.json({ success: true, message: "User dihapus." }); } catch(e){next(e);} };
