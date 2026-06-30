import express from "express";

import authRoute from "../domains/auth/auth.route.js";
import aiRoute from "../domains/ai/ai.route.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API Sistem Distribusi Kelapa Sawit berjalan",
  });
});

router.use("/auth", authRoute);

// AI Module
router.use("/ai", aiRoute);

export default router;