import express from "express";
import cors from "cors";

import kebutuhanRoute from "./routes/kebutuhan.js";
import stokRoute from "./routes/stok.js";
import trenRoute from "./routes/tren.js";
import riwayatRoute from "./routes/riwayat.js";

const app = express();
const PORT = process.env.AI_PORT || 4000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "SI Distribusi Sawit — AI Module",
    port: PORT,
    waktu: new Date().toLocaleString("id-ID"),
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/prediksi", kebutuhanRoute);
app.use("/api/prediksi", stokRoute);
app.use("/api/prediksi", trenRoute);
app.use("/api/prediksi", riwayatRoute);

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);

  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\nOpenNyawitAi berjalan di http://localhost:${PORT}`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   POST http://localhost:${PORT}/api/prediksi/kebutuhan`);
  console.log(`   POST http://localhost:${PORT}/api/prediksi/stok`);
  console.log(`   GET  http://localhost:${PORT}/api/prediksi/tren`);
  console.log(`   GET  http://localhost:${PORT}/api/prediksi/riwayat\n`);
});