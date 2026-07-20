import express from "express";

import authRoute       from "../domains/auth/auth.route.js";
import usersRoute      from "../domains/users/user.route.js";
import produkRoute     from "../domains/produk/produk.route.js";
import stokRoute       from "../domains/stok/stok.route.js";
import distribusiRoute from "../domains/distribusi/distribusi.route.js";
import laporanRoute    from "../domains/laporan/laporan.route.js";
import aktivitasRoute  from "../domains/aktivitas/aktivitas.route.js";
import aiRoute         from "../domains/ai/ai.route.js";
import kendaraanRoute  from "../domains/kendaraan/Kendaraan.route.js"

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ success: true, message: "API Sistem Distribusi Kelapa Sawit berjalan" });
});

router.use("/auth",       authRoute);
router.use("/users",      usersRoute);
router.use("/produk",     produkRoute);
router.use("/stok",       stokRoute);
router.use("/distribusi", distribusiRoute);
router.use("/laporan",    laporanRoute);
router.use("/aktivitas",  aktivitasRoute);
router.use("/ai",         aiRoute);
router.use("/kendaraan",  kendaraanRoute );

export default router;