import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Package, AlertTriangle, CheckCircle2,
  Search, RefreshCw, ArrowUpRight, Clock, WifiOff,
} from "lucide-react";
import api from "../../utils/api"; 

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt     = (n)   => new Intl.NumberFormat("id-ID").format(Number(n));
const fmtDate = (str) => {
  const d = new Date(str);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
    + " " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
};

const VISUAL_MAX_MULTIPLIER = 3;

const getStatus = ({ stok, minStok }) => {
  const visualMax = minStok > 0 ? minStok * VISUAL_MAX_MULTIPLIER : stok || 1;
  const pct = (stok / visualMax) * 100;
  if (stok <= 0)      return { key: "habis",  label: "Habis",  color: "#9b1c1c", bg: "rgba(185,28,28,0.12)", bar: "#ef4444", pct: 0   };
  if (stok < minStok) return { key: "kritis", label: "Kritis", color: "#fb7185", bg: "rgba(244,63,94,0.12)", bar: "#f43f5e", pct     };
  if (pct < 30)       return { key: "rendah", label: "Rendah", color: "#fbbf24", bg: "rgba(251,191,36,0.10)",bar: "#f59e0b", pct     };
  return                     { key: "aman",   label: "Aman",   color: "#4ade80", bg: "rgba(34,197,94,0.10)", bar: "#22c55e", pct     };
};

const normalizeStok = (s) => ({
  id:         s.id,
  produkId:   s.produkId,
  nama:       s.produk?.namaProduk ?? "—",
  jenis:      s.produk?.jenisProduk ?? "",
  satuan:     s.produk?.satuan ?? "",
  stok:       Number(s.jumlahStok),
  minStok:    Number(s.minimalStok),
  lastUpdate: s.tanggalUpdate,
});

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, accent, sub, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    className="rounded-2xl border px-5 py-4 flex items-center gap-4"
    style={{ background: "#1a2440", borderColor: "#26314a" }}
  >
    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: accent.bg, color: accent.text }}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-2xl font-black text-white leading-none">{value}</p>
      <p className="text-xs mt-1" style={{ color: "#5b6c87" }}>{label}</p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: accent.text }}>{sub}</p>}
    </div>
  </motion.div>
);

// ── Baris produk ──────────────────────────────────────────────────────────────
const ProdukRow = ({ item, index }) => {
  const status = getStatus(item);
  const pct    = Math.min(status.pct, 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border p-4 sm:p-5 hover:border-slate-600 transition-colors"
      style={{ background: "#1a2440", borderColor: "#26314a" }}
    >
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: status.bg }}>
            <Package size={17} style={{ color: status.color }} />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">{item.nama}</p>
            {item.jenis && <p className="text-xs mt-1" style={{ color: "#3a4863" }}>{item.jenis}</p>}
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold border"
          style={{ background: status.bg, color: status.color, borderColor: status.color + "44" }}>
          {status.label}
        </span>
      </div>

      <div className="mb-1">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold" style={{ color: "#8896ab" }}>Level Stok</span>
          <span className="text-white font-black text-base">
            {fmt(item.stok)}
            <span className="text-xs font-normal ml-1" style={{ color: "#5b6c87" }}>{item.satuan}</span>
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#121b33" }}>
          <motion.div className="h-full rounded-full" style={{ background: status.bar }}
            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, delay: index * 0.06 + 0.2, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-[10px] mt-1.5" style={{ color: "#3a4863" }}>
          <span>Min: {fmt(item.minStok)} {item.satuan}</span>
          <span className="font-semibold" style={{ color: status.color }}>{Math.round(pct)}%</span>
        </div>
      </div>

      <p className="text-[10px] mt-3 flex items-center gap-1" style={{ color: "#3a4863" }}>
        <Clock size={10} /> Terakhir diperbarui: {fmtDate(item.lastUpdate)}
      </p>
    </motion.div>
  );
};

// ── Halaman utama ─────────────────────────────────────────────────────────────
const MonitoringStok = () => {
  const [stokList,    setStokList]    = useState([]);
  const [riwayat,     setRiwayat]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [errorMsg,    setErrorMsg]    = useState("");
  const [search,      setSearch]      = useState("");
  const [filterTab,   setFilterTab]   = useState("semua");
  const [showRiwayat, setShowRiwayat] = useState(false);

  // Pakai axios `api` — token sudah otomatis dari interceptor useAuth
  const fetchStok = useCallback(async () => {
    const res = await api.get("/stok");
    return (res.data?.data ?? []).map(normalizeStok);
  }, []);

  const fetchRiwayat = useCallback(async () => {
    // GET /api/aktivitas?limit=20 — filter yang aktivitas = "Update Stok"
    const res = await api.get("/aktivitas?limit=20");
    return (res.data?.data ?? []).filter((r) => r.aktivitas === "Update Stok");
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [stokData, riwayatData] = await Promise.all([fetchStok(), fetchRiwayat()]);
      setStokList(stokData);
      setRiwayat(riwayatData);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ?? err.message ?? "Terjadi kesalahan saat memuat data."
      );
    } finally {
      setLoading(false);
    }
  }, [fetchStok, fetchRiwayat]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const stats = useMemo(() => ({
    total:  stokList.length,
    aman:   stokList.filter((p) => getStatus(p).key === "aman").length,
    rendah: stokList.filter((p) => ["rendah", "kritis", "habis"].includes(getStatus(p).key)).length,
  }), [stokList]);

  const filtered = useMemo(() => stokList.filter((p) => {
    const s = getStatus(p).key;
    const matchTab = filterTab === "semua" ? true
      : filterTab === "perlu_perhatian" ? ["kritis", "rendah", "habis"].includes(s)
      : s === filterTab;
    const q = search.toLowerCase();
    return matchTab && (!q || p.nama.toLowerCase().includes(q) || p.jenis.toLowerCase().includes(q));
  }), [stokList, search, filterTab]);

  const FILTER_TABS = [
    { key: "semua",           label: "Semua"           },
    { key: "perlu_perhatian", label: "Perlu Perhatian" },
    { key: "aman",            label: "Aman"            },
  ];

  return (
    <div className="min-h-full p-6 sm:p-8">

      {/* Header */}
      <motion.div className="mb-6 flex items-start justify-between flex-wrap gap-3"
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Monitoring Stok Gudang</h1>
          <p className="text-slate-400 text-sm mt-1">Pantau level stok seluruh produk secara real-time</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadAll} disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all disabled:opacity-50"
            style={{ background: "#1a2440", borderColor: "#26314a", color: "#cbd5e1" }}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Muat Ulang
          </button>
          <button onClick={() => setShowRiwayat(!showRiwayat)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
            style={{
              background:  showRiwayat ? "rgba(244,63,94,0.1)" : "#1a2440",
              borderColor: showRiwayat ? "rgba(244,63,94,0.4)" : "#26314a",
              color:       showRiwayat ? "#fb7185"              : "#cbd5e1",
            }}>
            <Clock size={15} />
            Riwayat Perubahan
          </button>
        </div>
      </motion.div>

      {/* Error */}
      {errorMsg && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mb-5 rounded-2xl border p-4 flex items-center gap-3"
          style={{ background: "rgba(244,63,94,0.08)", borderColor: "rgba(244,63,94,0.3)" }}>
          <WifiOff size={18} style={{ color: "#fb7185" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "#fb7185" }}>{errorMsg}</p>
            <p className="text-xs mt-0.5" style={{ color: "#8896ab" }}>
              Periksa koneksi ke server atau coba muat ulang.
            </p>
          </div>
        </motion.div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <StatCard icon={BarChart3}     label="Total Produk"    value={loading ? "—" : stats.total}
          accent={{ bg: "#1e293b", text: "#94a3b8" }} delay={0} />
        <StatCard icon={CheckCircle2}  label="Stok Aman"       value={loading ? "—" : stats.aman}
          accent={{ bg: "rgba(34,197,94,0.1)", text: "#4ade80" }} delay={0.05} />
        <StatCard icon={AlertTriangle} label="Perlu Perhatian" value={loading ? "—" : stats.rendah}
          accent={{ bg: "rgba(244,63,94,0.1)", text: "#fb7185" }}
          sub={!loading && stats.rendah > 0 ? "Segera restok!" : !loading ? "Semua aman" : undefined}
          delay={0.1} />
      </div>

      {/* Toolbar */}
      <motion.div className="flex flex-col sm:flex-row gap-3 mb-5"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input type="text" placeholder="Cari nama atau jenis produk..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border text-white placeholder-slate-600 outline-none focus:ring-1 transition-all"
            style={{ background: "#1a2440", borderColor: "#26314a" }}
            onFocus={(e) => { e.target.style.borderColor = "#fb7185"; e.target.style.boxShadow = "0 0 0 2px rgba(244,63,94,0.15)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "#26314a"; e.target.style.boxShadow = "none"; }} />
        </div>
        <div className="flex gap-1 rounded-xl p-1 border overflow-x-auto" style={{ background: "#1a2440", borderColor: "#26314a" }}>
          {FILTER_TABS.map((t) => (
            <button key={t.key} onClick={() => setFilterTab(t.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
              style={{
                background: filterTab === t.key ? "#fb7185" : "transparent",
                color:      filterTab === t.key ? "#0c1325" : "#8896ab",
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Riwayat */}
      <AnimatePresence>
        {showRiwayat && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-5">
            <div className="rounded-2xl border p-5" style={{ background: "#1a2440", borderColor: "#26314a" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#5b6c87" }}>
                Riwayat Perubahan Stok
              </p>
              {riwayat.length === 0 ? (
                <p className="text-sm py-4 text-center" style={{ color: "#5b6c87" }}>Belum ada riwayat.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {riwayat.map((r, i) => (
                    <motion.div key={r.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-between gap-4 py-2.5 border-b last:border-0"
                      style={{ borderColor: "#121b33" }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "rgba(96,165,250,0.1)" }}>
                          <ArrowUpRight size={13} style={{ color: "#60a5fa" }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm truncate" style={{ color: "#cbd5e1" }}>{r.deskripsi}</p>
                          <p className="text-[10px]" style={{ color: "#3a4863" }}>
                            oleh {r.user?.nama ?? "—"}
                          </p>
                        </div>
                      </div>
                      <p className="text-[10px] shrink-0" style={{ color: "#3a4863" }}>{fmtDate(r.tanggal)}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid produk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="col-span-full flex flex-col items-center justify-center py-16 rounded-2xl border"
              style={{ background: "#1a2440", borderColor: "#26314a" }}>
              <RefreshCw size={28} className="animate-spin mb-3" style={{ color: "#3a4863" }} />
              <p className="text-sm font-medium" style={{ color: "#8896ab" }}>Memuat data stok...</p>
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="col-span-full flex flex-col items-center justify-center py-16 rounded-2xl border"
              style={{ background: "#1a2440", borderColor: "#26314a" }}>
              <Package size={32} strokeWidth={1.4} className="mb-3" style={{ color: "#3a4863" }} />
              <p className="text-sm font-medium" style={{ color: "#8896ab" }}>Tidak ada produk ditemukan</p>
              <p className="text-xs mt-1" style={{ color: "#3a4863" }}>Coba ubah filter atau kata pencarian.</p>
            </motion.div>
          ) : (
            filtered.map((item, i) => <ProdukRow key={item.id} item={item} index={i} />)
          )}
        </AnimatePresence>
      </div>

      {!loading && (
        <p className="text-center text-xs mt-6" style={{ color: "#3a4863" }}>
          Menampilkan {filtered.length} dari {stokList.length} produk
        </p>
      )}
    </div>
  );
};

export default MonitoringStok;