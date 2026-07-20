import express from "express";
import { getAll } from "./aktivitas.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware("ADMIN", "PIMPINAN","KEPALA_GUDANG"), getAll);

export default router;
