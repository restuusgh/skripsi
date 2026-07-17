import express from "express";
import { getAll, getById, create, update, remove } from "./produk.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/",    getAll);
router.get("/:id", getById);
router.post("/",   roleMiddleware("ADMIN"), create);
router.put("/:id", roleMiddleware("ADMIN"), update);
router.delete("/:id", roleMiddleware("ADMIN"), remove);

export default router;
