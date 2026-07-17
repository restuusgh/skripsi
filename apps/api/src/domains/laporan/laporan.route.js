import express from "express";
import { getAll, getById, create, remove, download } from "./laporan.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("ADMIN", "PIMPINAN"));

router.get("/",           getAll);
router.get("/:id",        getById);
router.get("/:id/download", download);
router.post("/",          create);
router.delete("/:id",     remove);

export default router;
