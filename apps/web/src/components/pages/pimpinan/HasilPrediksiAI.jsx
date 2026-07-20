import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, CheckCircle2, Package, Sparkles, TrendingUp, Loader2, AlertTriangle } from "lucide-react";
import api from "../../utils/api";

const fmt = (n) => new Intl.NumberFormat("id-ID").format(n || 0);

const TIPE_LABEL = { kebutuhan: "Kebutuhan Distribusi", stok: "Prediksi Stok" };

// Status hanya bisa dihitung untuk tipe "stok" (dibandingkan minimalStok produk yang real).
// Untuk tipe "kebutuhan" tidak ada baseline pembanding di database, jadi statusnya netral.
const hitungStatus = (tipe, hasilPrediksi, minimalStok) => {
  if (tipe !== "stok" || minimalStok == null) {
    return { label: "Diproyeksikan", color: "#a78bfa" };
  }
  if (hasilPrediksi <= minimalStok) return { label: "Perlu dipantau", color: "#fb7185" };
  if (hasilPrediksi <= minimalStok * 1.3) return { label: "Menipis", color: "#fbbf24" };
  return { label: "Aman", color: "#4ade80" };
};

export default function HasilPrediksiAI() {
  const [riwayat, setRiwayat] = useState([]);
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [resRiwayat, resProduk] = await Promise.all([
          api.get("/ai/riwayat"),
          api.get("/produk"),
        ]);
        if (cancelled) return;

        const rawRiwayat = resRiwayat.data;
        const list = Array.isArray(rawRiwayat) ? rawRiwayat : rawRiwayat?.data ?? [];
        setRiwayat(list);
        setProdukList(resProduk.data?.data ?? []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message ?? "Gagal memuat hasil prediksi AI.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const produkMap = useMemo(() => {
    const map = new Map();
    produkList.forEach((p) => map.set(p.id, p));
    return map;
  }, [produkList]);

  const predictions = useMemo(() => {
    return riwayat.map((item, i) => {
      const produkRel = item.produk; // kalau AI service sudah include relasi produk
      const produkLokal = produkMap.get(item.produkId);
      const namaProduk = produkRel?.namaProduk ?? produkLokal?.namaProduk ?? "Produk tidak diketahui";
      const satuan = produkRel?.satuan ?? produkLokal?.satuan ?? "";
      const minimalStok = produkLokal?.stok?.minimalStok != null ? Number(produkLokal.stok.minimalStok) : null;

      const hasilPrediksi = Number(item.hasilPrediksi ?? 0);
      const nilaiAkurasi = item.nilaiAkurasi != null ? Number(item.nilaiAkurasi) : null;
      const status = hitungStatus(item.tipe, hasilPrediksi, minimalStok);

      return {
        key: item.id ?? i,
        product: namaProduk,
        type: TIPE_LABEL[item.tipe] ?? item.tipe ?? "-",
        value: `${fmt(hasilPrediksi)}${satuan ? " " + satuan : ""}`,
        status,
        periode: item.periode ?? "-",
        metode: item.metode ?? "-",
        nilaiAkurasi,
      };
    });
  }, [riwayat, produkMap]);

  const stats = useMemo(() => {
    const metode = riwayat[0]?.metode ?? "-";
    const akurasiList = riwayat.map((r) => Number(r.nilaiAkurasi)).filter((n) => !Number.isNaN(n));
    const akurasiRata = akurasiList.length
      ? (akurasiList.reduce((s, n) => s + n, 0) / akurasiList.length).toFixed(1).replace(".", ",") + "%"
      : "-";
    return [
      [BrainCircuit, "Model", metode, "#a78bfa"],
      [TrendingUp, "Akurasi rata-rata", akurasiRata, "#4ade80"],
      [Package, "Prediksi aktif", `${riwayat.length} hasil`, "#60a5fa"],
    ];
  }, [riwayat]);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center gap-2 py-24" style={{ color: "#8896ab" }}>
        <Loader2 size={18} className="animate-spin" /> Memuat hasil prediksi...
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 sm:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Hasil Prediksi AI</h1>
        <p className="mt-1 text-sm" style={{ color: "#8896ab" }}>Ringkasan output model untuk mendukung keputusan distribusi.</p>
      </motion.div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl p-3 text-sm" style={{ background: "rgba(244,63,94,0.1)", color: "#fb7185" }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map(([Icon, label, value, color], index) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className="rounded-2xl border p-5" style={{ background: "#1a2440", borderColor: "#26314a" }}>
            <Icon size={19} style={{ color }} />
            <p className="mt-3 text-lg font-black text-white">{value}</p>
            <p className="mt-1 text-xs" style={{ color: "#5b6c87" }}>{label}</p>
          </motion.div>
        ))}
      </div>

      {predictions.length === 0 ? (
        <div className="rounded-2xl border p-10 text-center" style={{ background: "#1a2440", borderColor: "#26314a", color: "#5b6c87" }}>
          Belum ada hasil prediksi yang tercatat.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {predictions.map((item, index) => (
            <motion.article key={item.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="rounded-2xl border p-5" style={{ background: "#1a2440", borderColor: "#26314a" }}>
              <div className="mb-5 flex items-start justify-between">
                <div className="rounded-xl p-2.5" style={{ background: "rgba(124,58,237,0.1)", color: "#a78bfa" }}>
                  <Sparkles size={19} />
                </div>
                <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: `${item.status.color}1a`, color: item.status.color }}>
                  {item.status.label}
                </span>
              </div>
              <p className="text-xs" style={{ color: "#8896ab" }}>{item.type}</p>
              <h2 className="mt-1 font-bold text-white">{item.product}</h2>
              <p className="mt-5 text-3xl font-black" style={{ color: item.status.color }}>{item.value}</p>
              <div className="mt-4 border-t pt-4 text-sm leading-6" style={{ borderColor: "#26314a", color: "#8896ab" }}>
                <p>Periode: {item.periode}</p>
                <p>Metode: {item.metode}</p>
                {item.nilaiAkurasi != null && <p>Akurasi: {item.nilaiAkurasi.toFixed(1).replace(".", ",")}%</p>}
              </div>
              <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#4ade80" }}>
                <CheckCircle2 size={14} /> Data siap ditinjau
              </p>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}