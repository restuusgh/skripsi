import express from "express";

import {
  prediksiKebutuhan,
  prediksiStok,
  trenPrediksi,
  riwayatPrediksi,
} from "./ai.controller.js";

const router = express.Router();

router.post("/kebutuhan", prediksiKebutuhan);

router.post("/stok", prediksiStok);

router.get("/tren", trenPrediksi);

router.get("/riwayat", riwayatPrediksi);

export default router;