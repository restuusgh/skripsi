import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Package, Truck, Users, Loader2, AlertTriangle } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../../utils/api";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const tooltipStyle = { background: "#1a2440", border: "1px solid #26314a", borderRadius: "12px", fontSize: "12px" };
const format = (value) => `${new Intl.NumberFormat("id-ID").format(value)} ton`;
const fmt = (n) => new Intl.NumberFormat("id-ID").format(n || 0);

const tonDistribusi = (d) => (d.detailDistribusi || []).reduce((s, i) => s + Number(i.jumlah ?? 0), 0);

const PERIODE_BULAN = { "3bulan": 3, "6bulan": 6, "tahun": null }; // null = Jan..bulan berjalan

export default function GrafikTren() {
  const [periode, setPeriode] = useState("6bulan");
  const [distribusiList, setDistribusiList] = useState([]);
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [resDistribusi, resProduk] = await Promise.all([
          api.get("/distribusi"),
          api.get("/produk"),
        ]);
        if (cancelled) return;
        setDistribusiList(resDistribusi.data?.data ?? []);
        setProdukList(resProduk.data?.data ?? []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message ?? "Gagal memuat data tren.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const now = new Date();

  const chartData = useMemo(() => {
    const n = PERIODE_BULAN[periode] ?? (now.getMonth() + 1);
    const months = Array.from({ length: n }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
    return months.map(({ year, month }) => {
      const ton = distribusiList
        .filter((d) => {
          const dt = new Date(d.tanggalDistribusi);
          return dt.getFullYear() === year && dt.getMonth() === month;
        })
        .reduce((s, d) => s + tonDistribusi(d), 0);
      return { bulan: MONTH_LABELS[month], distribusi: Math.round(ton) };
    });
  }, [distribusiList, periode]);

  const totalDistribusi = useMemo(() => chartData.reduce((s, d) => s + d.distribusi, 0), [chartData]);
  const distributorAktif = useMemo(
    () => new Set(distribusiList.map((d) => d.tujuanDistribusi?.id).filter(Boolean)).size,
    [distribusiList]
  );
  const stokSaatIni = useMemo(
    () => produkList.reduce((s, p) => s + Number(p.stok?.jumlahStok ?? 0), 0),
    [produkList]
  );

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center gap-2 py-24" style={{ color: "#8896ab" }}>
        <Loader2 size={18} className="animate-spin" /> Memuat grafik tren...
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 sm:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Grafik Tren</h1>
          <p className="mt-1 text-sm" style={{ color: "#8896ab" }}>Pantau perkembangan distribusi dan stok.</p>
        </div>
        <select value={periode} onChange={(event) => setPeriode(event.target.value)} className="rounded-xl border px-3 py-2 text-sm text-white outline-none" style={{ background: "#1a2440", borderColor: "#26314a" }}>
          <option value="3bulan">3 bulan terakhir</option>
          <option value="6bulan">6 bulan terakhir</option>
          <option value="tahun">Tahun berjalan</option>
        </select>
      </motion.div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl p-3 text-sm" style={{ background: "rgba(244,63,94,0.1)", color: "#fb7185" }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          [Truck, "Total Distribusi", format(totalDistribusi), "#a78bfa"],
          [Users, "Distributor Aktif", String(distributorAktif), "#60a5fa"],
          [Package, "Stok Saat Ini", format(Math.round(stokSaatIni)), "#4ade80"],
        ].map(([Icon, label, value, color], index) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className="rounded-2xl border p-5" style={{ background: "#1a2440", borderColor: "#26314a" }}>
            <Icon size={19} style={{ color }} />
            <p className="mt-3 text-2xl font-black text-white">{value}</p>
            <p className="mt-1 text-xs" style={{ color: "#5b6c87" }}>{label}</p>
          </motion.div>
        ))}
      </div>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border p-5" style={{ background: "#1a2440", borderColor: "#26314a" }}>
        <div className="mb-5 flex items-center gap-2">
          <TrendingUp size={18} style={{ color: "#a78bfa" }} />
          <div>
            <h2 className="font-bold text-white">Distribusi</h2>
            <p className="text-xs" style={{ color: "#5b6c87" }}>Volume per bulan</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#1c2740" strokeDasharray="3 3" />
            <XAxis dataKey="bulan" tick={{ fill: "#8896ab", fontSize: 12 }} />
            <YAxis tick={{ fill: "#8896ab", fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} formatter={format} />
            <Line type="monotone" dataKey="distribusi" name="Distribusi" stroke="#a78bfa" strokeWidth={3} dot={{ fill: "#a78bfa" }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.section>
    </div>
  );
}