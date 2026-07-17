import express from "express";
import { getAll, getByProduk, update } from "./stok.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/",              getAll);
router.get("/:produkId",     getByProduk);
router.put("/:produkId",     roleMiddleware("ADMIN", "KEPALA_GUDANG"), update);

export default router;
