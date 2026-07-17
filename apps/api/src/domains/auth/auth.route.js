import express from "express";
import { login, logout, getMe } from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login",  login);
router.post("/logout", authMiddleware, logout);
router.get("/me",      authMiddleware, getMe);

export default router;
