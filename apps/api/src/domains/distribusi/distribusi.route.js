import express from "express";
import {
  getAll, getById, create, update, remove,
  konfirmasi, getSuratJalan,
} from "./distribusi.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Admin & Pimpinan — lihat semua
router.get("/",    getAll);
router.get("/:id", getById);

// Admin — kelola distribusi
router.post("/",      roleMiddleware("ADMIN"), create);
router.put("/:id",    roleMiddleware("ADMIN"), update);
router.delete("/:id", roleMiddleware("ADMIN"), remove);

// Supir — konfirmasi selesai + lihat surat jalan
router.patch("/:id/konfirmasi", roleMiddleware("SUPIR", "ADMIN"), konfirmasi);
router.get("/:id/surat-jalan",  getSuratJalan);

export default router;
