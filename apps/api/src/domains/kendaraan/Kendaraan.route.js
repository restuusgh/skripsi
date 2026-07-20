import express from "express";
import { getAll, getById, updateLokasi } from "./kendaraan.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Admin & Pimpinan — lihat daftar kendaraan + lokasi terakhir (untuk peta monitoring)
router.get("/", getAll);
router.get("/:id", getById);

// Supir (atau Admin) — kirim update posisi GPS
router.patch("/:id/lokasi", roleMiddleware("SUPIR", "ADMIN"), updateLokasi);

export default router;