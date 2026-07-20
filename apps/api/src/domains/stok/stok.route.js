import express from "express";
import { getAll, getRiwayat, update } from "./stok.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getAll);
router.get("/riwayat", getRiwayat);

// Kepala Gudang & Admin yang boleh mengubah stok
router.patch("/:produkId", roleMiddleware("KEPALA_GUDANG", "ADMIN"), update);

export default router;