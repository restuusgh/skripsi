import express from "express";
import { getRiwayat, getById, remove } from "./prediksi.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("ADMIN", "PIMPINAN"));

router.get("/",     getRiwayat);
router.get("/:id",  getById);
router.delete("/:id", remove);

export default router;
