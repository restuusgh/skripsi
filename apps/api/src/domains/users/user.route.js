import express from "express";
import { getAll, getById, create, update, remove } from "./user.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("ADMIN"));

router.get("/",     getAll);
router.get("/:id",  getById);
router.post("/",    create);
router.put("/:id",  update);
router.delete("/:id", remove);

export default router;
