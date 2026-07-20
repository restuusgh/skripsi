import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Truck, Users, Package, Sparkles, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../../hooks/useAuth";
import api from "../../utils/api";

const fmt = (n) => new Intl.NumberFormat("id-ID").format(n || 0);
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const STATUS_CFG = {
  PROSES:     { label: "Proses",     color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  SELESAI:    { label: "Selesai",    color: "#4ade80", bg: "rgba(34,197,94,0.1)"  },
  DIBATALKAN: { label: "Dibatalkan", color: "#fb7185", bg: "rgba(244,63,94,0.1)"  },
};

const tonDistribusi = (d) => (d.detailDistribusi || []).reduce((s, i) => s + Number(i.jumlah ?? 0), 0);

const deltaPercent = (curr, prev) => {
  if (!prev) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev) * 100;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border px-4 py-3 text-sm shadow-2xl"
      style={{ background: "#1a2440", borderColor: "#26314a" }}>
      <p className="font-bold text-white mb-1">{label}</p>
      <p style={{ color: "#a78bfa" }}>{payload[0].value} pengiriman</p>
    </div>
  );
};

const DashboardPimpinan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [distribusiList, setDistribusiList] = useState([]);
  const [akurasiAI, setAkurasiAI] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/distribusi");
        if (!cancelled) setDistribusiList(res.data?.data ?? []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message ?? "Gagal memuat data distribusi.");
      }

      try {
        const resAI = await api.get("/ai/riwayat");
        if (!cancelled) setAkurasiAI(resAI.data);
      } catch {
        if (!cancelled) setAkurasiAI(null);
      }

      if (!cancelled) setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const now = new Date();
  const startOfMonth = (offset = 0) => new Date(now.getFullYear(), now.getMonth() - offset, 1);
  const endOfMonth = (offset = 0) => new Date(now.getFullYear(), now.getMonth() - offset + 1, 0, 23, 59, 59, 999);
  const inMonth = (iso, offset) => {
    const t = new Date(iso).getTime();
    return t >= startOfMonth(offset).getTime() && t <= endOfMonth(offset).getTime();
  };

  const kpi = useMemo(() => {
    const bulanIni = distribusiList.filter((d) => inMonth(d.tanggalDistribusi, 0));
    const bulanLalu = distribusiList.filter((d) => inMonth(d.tanggalDistribusi, 1));

    const totalDistribusiIni = bulanIni.length;
    const totalDistribusiLalu = bulanLalu.length;

    const volumeIni = bulanIni.reduce((s, d) => s + tonDistribusi(d), 0);
    const volumeLalu = bulanLalu.reduce((s, d) => s + tonDistribusi(d), 0);

    const distributorIni = new Set(bulanIni.map((d) => d.tujuanDistribusi?.id).filter(Boolean)).size;
    const distributorLalu = new Set(bulanLalu.map((d) => d.tujuanDistribusi?.id).filter(Boolean)).size;

    let akurasiValue = null;
    if (akurasiAI) {
      const list = Array.isArray(akurasiAI) ? akurasiAI : akurasiAI.data;
      if (Array.isArray(list) && list.length > 0) {
        const nilai = list.map((r) => Number(r.nilaiAkurasi)).filter((n) => !Number.isNaN(n));
        if (nilai.length > 0) akurasiValue = nilai.reduce((s, n) => s + n, 0) / nilai.length;
      }
    }

    return [
      {
        icon: Truck, label: "Total Distribusi Bulan Ini", value: String(totalDistribusiIni),
        sub: `${deltaPercent(totalDistribusiIni, totalDistribusiLalu) >= 0 ? "+" : ""}${deltaPercent(totalDistribusiIni, totalDistribusiLalu).toFixed(0)}% dari bulan lalu`,
        up: totalDistribusiIni >= totalDistribusiLalu,
        accent: { text: "#a78bfa", bg: "rgba(124,58,237,0.10)" },
      },
      {
        icon: Package, label: "Total Volume Dikirim", value: fmt(Math.round(volumeIni)),
        sub: "ton bulan ini",
        up: volumeIni >= volumeLalu,
        accent: { text: "#4ade80", bg: "rgba(34,197,94,0.10)" },
      },
      {
        icon: Users, label: "Distributor Aktif", value: String(distributorIni),
        sub: `${distributorIni - distributorLalu >= 0 ? "+" : ""}${distributorIni - distributorLalu} distributor`,
        up: distributorIni >= distributorLalu,
        accent: { text: "#60a5fa", bg: "rgba(96,165,250,0.10)" },
      },
      {
        icon: Sparkles, label: "Akurasi Prediksi AI",
        value: akurasiValue != null ? `${akurasiValue.toFixed(0)}%` : "-",
        sub: akurasiValue != null ? "rata-rata seluruh prediksi" : "data belum tersedia",
        up: true,
        accent: { text: "#fbbf24", bg: "rgba(251,191,36,0.10)" },
      },
    ];
  }, [distribusiList, akurasiAI]);

  const chartData = useMemo(() => {
    const months = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
    return months.map(({ year, month }) => {
      const jumlah = distribusiList.filter((d) => {
        const dt = new Date(d.tanggalDistribusi);
        return dt.getFullYear() === year && dt.getMonth() === month;
      }).length;
      return { bulan: MONTH_LABELS[month], distribusi: jumlah };
    });
  }, [distribusiList]);

  const distribusiTerbaru = useMemo(() => {
    return [...distribusiList]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4)
      .map((d) => ({
        id: d.id,
        no: d.kodeDistribusi,
        tujuan: d.tujuanDistribusi?.namaTujuan ?? "-",
        jumlah: tonDistribusi(d),
        status: d.status,
        tgl: new Date(d.tanggalDistribusi).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
      }));
  }, [distribusiList]);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center gap-2 py-24" style={{ color: "#8896ab" }}>
        <Loader2 size={18} className="animate-spin" /> Memuat dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 sm:p-8">

      {/* Header */}
      <motion.div className="mb-7" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Selamat Datang, {user?.nama ?? "Pimpinan"} 👋</h1>
        <p className="text-sm mt-1" style={{ color: "#8896ab" }}>Berikut ringkasan kinerja distribusi bulan ini.</p>
      </motion.div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl p-3 text-sm" style={{ background: "rgba(244,63,94,0.1)", color: "#fb7185" }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {kpi.map(({ icon: Icon, label, value, sub, up, accent }, i) => (
          <motion.div key={label}
            className="rounded-2xl border p-4 sm:p-5"
            style={{ background: "#1a2440", borderColor: "#26314a" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: accent.bg }}>
                <Icon size={18} style={{ color: accent.text }} />
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold"
                style={{ color: up ? "#4ade80" : "#fb7185" }}>
                {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              </span>
            </div>
            <p className="text-2xl font-black text-white leading-none">{value}</p>
            <p className="text-xs mt-1.5" style={{ color: "#5b6c87" }}>{label}</p>
            <p className="text-[11px] mt-1" style={{ color: "#3a4863" }}>{sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Chart distribusi */}
        <motion.div className="lg:col-span-2 rounded-2xl border p-5"
          style={{ background: "#1a2440", borderColor: "#26314a" }}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-white font-bold text-base">Grafik Distribusi Bulanan</h3>
              <p className="text-xs mt-0.5" style={{ color: "#5b6c87" }}>Jumlah pengiriman per bulan ({now.getFullYear()})</p>
            </div>
            <button onClick={() => navigate("/pimpinan/grafik-tren")}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
              style={{ background: "rgba(124,58,237,0.1)", color: "#a78bfa" }}>
              Lihat Detail <ArrowRight size={12} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2740" />
              <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: "#5b6c87" }} />
              <YAxis tick={{ fontSize: 11, fill: "#5b6c87" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line dataKey="distribusi" name="Distribusi" stroke="#7c3aed"
                strokeWidth={2.5} dot={{ r: 4, fill: "#7c3aed" }} activeDot={{ r: 6, fill: "#a78bfa" }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Distribusi terbaru */}
        <motion.div className="rounded-2xl border p-5"
          style={{ background: "#1a2440", borderColor: "#26314a" }}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Distribusi Terbaru</h3>
            <button onClick={() => navigate("/pimpinan/laporan")}
              className="text-xs font-semibold" style={{ color: "#a78bfa" }}>
              Lihat semua →
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {distribusiTerbaru.map((d, i) => {
              const s = STATUS_CFG[d.status] || STATUS_CFG.PROSES;
              return (
                <motion.div key={d.id}
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="flex items-center justify-between gap-2 pb-3 border-b last:border-0 last:pb-0"
                  style={{ borderColor: "#121b33" }}>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{d.tujuan}</p>
                    <p className="text-[10px] mt-0.5 font-mono" style={{ color: "#3a4863" }}>{d.no}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                    <p className="text-[10px] mt-0.5 text-right" style={{ color: "#3a4863" }}>
                      {fmt(d.jumlah)} ton
                    </p>
                  </div>
                </motion.div>
              );
            })}
            {distribusiTerbaru.length === 0 && (
              <p className="text-sm text-center py-6" style={{ color: "#5b6c87" }}>Belum ada distribusi tercatat.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPimpinan;