import express from "express";
import { getAll } from "./aktivitas.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware("ADMIN", "PIMPINAN"), getAll);

export default router;
