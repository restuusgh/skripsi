// src/components/pages/PrediksiAi.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  BarChart3, Package, TrendingUp, History, Loader2, AlertTriangle,
  Sparkles, ArrowUpRight, ArrowDownRight, Truck, Gauge, Inbox,
  Trash2, MapPin, CloudSun, Database, X,
} from "lucide-react";

// --- Konstanta ---
const API_BASE = "http://localhost:4000/api/prediksi";

const TAB_LIST = [
  { id: "kebutuhan", label: "Prediksi Distribusi", Icon: BarChart3 },
  { id: "stok",      label: "Prediksi Stok",      Icon: Package },
  { id: "tren",      label: "Grafik Tren",        Icon: TrendingUp },
  { id: "riwayat",   label: "Riwayat Prediksi",   Icon: History },
];

const PRODUK_OPT = [
  {
    label: "Crude Palm Oil (CPO)",
    value: 1,
  },
  {
    label: "Minyak Goreng",
    value: 2,
  },
];

const PERIODE_OPT = [
  {
    label: "1 Bulan ke Depan",
    value: 1,
  },
  {
    label: "2 Bulan ke Depan",
    value: 2,
  },
];

const WILAYAH_OPT = [
  { label: "Dalam Kota",     value: 0   },
  { label: "Luar Kota",      value: 0.5 },
  { label: "Antar Provinsi", value: 1   },
];
const MUSIM_OPT = [
  { label: "Kemarau", value: 0 },
  { label: "Hujan",   value: 1 },
];

// --- Helper ---
const fmt = (n) => new Intl.NumberFormat("id-ID").format(Math.round(n || 0));
const fmtDate = (iso) =>
  new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

function Badge({ status }) {
  const map = {
    rendah:  { bg: "bg-green-500/10", color: "text-green-500", label: "Rendah"  },
    sedang:  { bg: "bg-yellow-500/10", color: "text-yellow-500", label: "Sedang"  },
    tinggi:  { bg: "bg-red-500/10", color: "text-red-500", label: "Tinggi"  },
    kritis:  { bg: "bg-red-500/10", color: "text-red-500", label: "Kritis"  },
    cukup:   { bg: "bg-yellow-500/10", color: "text-yellow-500", label: "Cukup"   },
    surplus: { bg: "bg-green-500/10", color: "text-green-500", label: "Surplus" },
  };
  const key = Object.keys(map).find((k) => status?.toLowerCase().includes(k));
  const s = key ? map[key] : { bg: "bg-gray-700", color: "text-gray-400", label: status };
  return (
    <span className={`${s.bg} ${s.color} px-3 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap`}>
      {s.label}
    </span>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-2xl">
      <p className="font-bold mb-1 text-slate-100 text-sm">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-sm my-0.5" style={{ color: p.color }}>
          {p.name}: <strong>{fmt(p.value)} ton</strong>
        </p>
      ))}
    </div>
  );
}

function Spinner({ size = 16 }) {
  return (
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      className="inline-flex mr-2"
    >
      <Loader2 size={size} />
    </motion.span>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  const isConn = /fetch|network|connect/i.test(message);
  return (
    <div className="bg-red-500/10 border border-red-500/35 rounded-xl p-3 text-sm text-red-500 mt-3 flex gap-2.5 items-start">
      <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
      <span>
        {isConn
          ? "Tidak bisa terhubung ke server AI. Pastikan packages/ai sudah dijalankan (pnpm dev)."
          : message}
      </span>
    </div>
  );
}

function FromDbTag() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-500 bg-green-500/10 border border-green-500/35 rounded-md px-2 py-0.5 ml-2 tracking-wide">
      <Database size={10} /> database
    </span>
  );
}

// Hook untuk ambil konteks data (stok, permintaan, dll) dari DB
function useKonteks(produkId) {
  const [konteks, setKonteks] = useState(null);
  const [loadingKonteks, setLoadingKonteks] = useState(true);
  const [errorKonteks, setErrorKonteks] = useState("");

  const fetchKonteks = async () => {
    setLoadingKonteks(true);
    setErrorKonteks("");
    try {
      const res = await fetch(`${API_BASE}/konteks?produkId=${produkId}`)
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Gagal memuat data dari database.");
      setKonteks(json);
    } catch (e) {
      setErrorKonteks(e.message);
    } finally {
      setLoadingKonteks(false);
    }
  };

  useEffect(() => { fetchKonteks(); }, [produkId]);

  return { konteks, loadingKonteks, errorKonteks, refetchKonteks: fetchKonteks };
}

// --- Tab: Prediksi Kebutuhan ---
function TabKebutuhan({ onSaveRiwayat }) {

  const [form, setForm] = useState({
    produkId: 1,
    periode: 1,
    wilayah: 0,
    musim: 0,
  });

  // ✅ Sekarang form sudah ada, baru panggil useKonteks
  const {
    konteks,
    loadingKonteks,
    errorKonteks
  } = useKonteks(form.produkId);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!konteks || !konteks.ada_data) {
      setError("Data stok dan permintaan dari database belum tersedia.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/kebutuhan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produkId: form.produkId,
          periode: form.periode,
          wilayah: Number(form.wilayah),
          musim: Number(form.musim),
          stok: konteks.stokSaatIni,
          permintaan: konteks.permintaanBulanLalu,
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Gagal memproses prediksi.");
      setResult(data);
      onSaveRiwayat({ tipe: "kebutuhan", input: data.input, prediksi: data.prediksi });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const pct = result ? Math.round(result.prediksi.kebutuhanNorm * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
        <h3 className="text-base font-extrabold text-slate-100 mb-1 tracking-tight">Parameter Prediksi Distribusi</h3>
        <p className="text-sm text-slate-400 mb-5">Stok &amp; permintaan diambil otomatis dari database</p>

        {loadingKonteks ? (
          <div className="py-6 text-center text-slate-400 text-sm flex items-center justify-center gap-1.5">
            <Spinner size={14} /> Memuat data dari database...
          </div>
        ) : errorKonteks ? (
          <ErrorBanner message={errorKonteks} />
        ) : !konteks?.ada_data ? (
          <div className="bg-yellow-500/10 border border-yellow-500/35 rounded-xl p-3 text-sm text-yellow-500">
            {konteks?.message || "Data belum tersedia"}
          </div>
        ) : (
          <>
            <label className="flex items-center text-xs font-semibold text-slate-300 mb-1.5 mt-3.5">
              Stok Saat Ini (ton)<FromDbTag />
            </label>
            <input className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 font-semibold text-sm cursor-not-allowed border-dashed" 
              type="text" readOnly
              value={`${fmt(konteks.stokSaatIni)} ton — ${konteks.namaProduk}`} />

            <label className="flex items-center text-xs font-semibold text-slate-300 mb-1.5 mt-3.5">
              Permintaan Bulan Lalu (ton)<FromDbTag />
            </label>
            <input className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 font-semibold text-sm cursor-not-allowed border-dashed" 
              type="text" readOnly
              value={`${fmt(konteks.permintaanBulanLalu)} ton`} />

            <label className="flex items-center text-xs font-semibold text-slate-300 mb-1.5 mt-3.5">
              Produk
            </label>
            <select
              className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100"
              value={form.produkId}
              onChange={(e) =>
                setForm({
                  ...form,
                  produkId: Number(e.target.value)
                })
              }
            >
              {PRODUK_OPT.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <label className="flex items-center text-xs font-semibold text-slate-300 mb-1.5 mt-3.5">
              Periode Prediksi
            </label>
            <select
              className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100"
              value={form.periode}
              onChange={(e) =>
                setForm({
                  ...form,
                  periode: Number(e.target.value)
                })
              }
            >
              {PERIODE_OPT.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <label className="flex items-center text-xs font-semibold text-slate-300 mb-1.5 mt-3.5">
              <MapPin size={13} className="mr-1.5" />Wilayah Distribusi
            </label>
            <select className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm outline-none"
              value={form.wilayah}
              onChange={(e) => setForm({ ...form, wilayah: Number(e.target.value) })}>
              {WILAYAH_OPT.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <label className="flex items-center text-xs font-semibold text-slate-300 mb-1.5 mt-3.5">
              <CloudSun size={13} className="mr-1.5" />Musim
            </label>
            <select className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm outline-none"
              value={form.musim}
              onChange={(e) => setForm({ ...form, musim: Number(e.target.value) })}>
              {MUSIM_OPT.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <ErrorBanner message={error} />

            <button className={`w-full mt-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center transition-colors ${
              loading 
                ? 'bg-green-800 text-slate-900 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-400 text-slate-900'
            }`}
              onClick={handleSubmit} disabled={loading}>
              {loading ? <Spinner /> : <Sparkles size={15} className="mr-2" />}
              {loading ? "Memproses..." : "Prediksi Sekarang"}
            </button>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div key="result" className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="text-base font-extrabold text-slate-100 mb-1 tracking-tight">Hasil Prediksi</h3>
            <p className="text-sm text-slate-400 mb-5">Model neural network brain.js</p>

            <div className="text-center my-5">
              <motion.div
                key={result.prediksi.kebutuhanTon}
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="text-[46px] font-extrabold text-green-500 tracking-tight">
                {fmt(result.prediksi.kebutuhanTon)}
              </motion.div>
              <div className="text-slate-400 mt-0.5 text-sm">ton kebutuhan distribusi</div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between mb-1.5 text-sm">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Gauge size={13} /> Tingkat kebutuhan
                </span>
                <span className="font-bold text-slate-100">{pct}%</span>
              </div>
              <div className="bg-slate-900 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    pct > 60 ? 'bg-red-500' : pct > 30 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                />
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-3.5 text-sm text-slate-300 border-l-4 border-green-500">
              {result.prediksi.keterangan}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {[
                { label: "Wilayah", val: result.input.wilayahLabel },
                { label: "Musim", val: result.input.musimLabel },
                { label: "Stok (DB)", val: `${fmt(result.input.stok)} ton` },
                { label: "Permintaan (DB)", val: `${fmt(result.input.permintaan)} ton` },
              ].map((item) => (
                <div key={item.label} className="bg-slate-900 rounded-xl px-3 py-2">
                  <div className="text-[11px] text-slate-400 font-semibold mb-0.5">{item.label}</div>
                  <div className="font-bold text-sm text-slate-100">{item.val}</div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="empty" className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center min-h-[280px]">
            <BarChart3 size={40} strokeWidth={1.4} className="text-slate-400" />
            <p className="text-center text-sm text-slate-300 mt-3.5">
              Pilih wilayah &amp; musim, lalu klik<br /><strong className="text-slate-100">Prediksi Sekarang</strong>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Tab: Prediksi Stok ---
function TabStok({ onSaveRiwayat }) {
  const [formStok, setFormStok] = useState({
    produkId: 1,
  });
  
  const { konteks, loadingKonteks, errorKonteks } = useKonteks(formStok.produkId);
  const [hargaTBS, setHargaTBS] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (konteks?.hargaProduk) setHargaTBS(String(konteks.hargaProduk));
  }, [konteks]);

  const handleSubmit = async () => {
    if (!konteks || !konteks.ada_data) {
      setError("Data stok dan produksi dari database belum tersedia.");
      return;
    }
    if (!hargaTBS) { setError("Harga TBS wajib diisi."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/stok`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produkId: formStok.produkId,
          stok: konteks.stokSaatIni,
          produksi: konteks.produksiEstimasi,
          permintaan: konteks.permintaanBulanLalu,
          hargaTBS: Number(hargaTBS),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Gagal memproses prediksi.");
      setResult(data);
      onSaveRiwayat({ tipe: "stok", input: data.input, prediksi: data.prediksi });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const stokBaru = result?.prediksi?.stokPeriodeBerikutnyaTon ?? 0;
  const stokLama = konteks?.stokSaatIni ?? 0;
  const delta    = stokBaru - stokLama;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
        <h3 className="text-base font-extrabold text-slate-100 mb-1 tracking-tight">Input Prediksi Stok</h3>
        <p className="text-sm text-slate-400 mb-5">Stok, produksi &amp; permintaan diambil otomatis dari database</p>

        {loadingKonteks ? (
          <div className="py-6 text-center text-slate-400 text-sm flex items-center justify-center gap-1.5">
            <Spinner size={14} /> Memuat data dari database...
          </div>
        ) : errorKonteks ? (
          <ErrorBanner message={errorKonteks} />
        ) : !konteks?.ada_data ? (
          <div className="bg-yellow-500/10 border border-yellow-500/35 rounded-xl p-3 text-sm text-yellow-500">
            {konteks?.message || "Data belum tersedia"}
          </div>
        ) : (
          <>
            <label className="flex items-center text-xs font-semibold text-slate-300 mb-1.5 mt-3.5">
              Produk
            </label>
            <select
              className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100"
              value={formStok.produkId}
              onChange={(e) =>
                setFormStok({
                  ...formStok,
                  produkId: Number(e.target.value)
                })
              }
            >
              {PRODUK_OPT.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <label className="flex items-center text-xs font-semibold text-slate-300 mb-1.5 mt-3.5">
              Stok Saat Ini (ton)<FromDbTag />
            </label>
            <input className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 font-semibold text-sm cursor-not-allowed border-dashed" 
              type="text" readOnly
              value={`${fmt(konteks.stokSaatIni)} ton — ${konteks.namaProduk}`} />

            <label className="flex items-center text-xs font-semibold text-slate-300 mb-1.5 mt-3.5">
              Produksi Bulan Ini — estimasi (ton)<FromDbTag />
            </label>
            <input className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 font-semibold text-sm cursor-not-allowed border-dashed" 
              type="text" readOnly
              value={`${fmt(konteks.produksiEstimasi)} ton`} />

            <label className="flex items-center text-xs font-semibold text-slate-300 mb-1.5 mt-3.5">
              Permintaan Bulan Ini (ton)<FromDbTag />
            </label>
            <input className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 font-semibold text-sm cursor-not-allowed border-dashed" 
              type="text" readOnly
              value={`${fmt(konteks.permintaanBulanLalu)} ton`} />

            <label className="flex items-center text-xs font-semibold text-slate-300 mb-1.5 mt-3.5">
              Harga TBS saat ini (Rp/kg)
            </label>
            <input className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm outline-none" 
              type="number" placeholder="Contoh: 2800"
              value={hargaTBS} onChange={(e) => setHargaTBS(e.target.value)} />

            <ErrorBanner message={error} />
            <button className={`w-full mt-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center transition-colors ${
              loading 
                ? 'bg-green-800 text-slate-900 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-400 text-slate-900'
            }`}
              onClick={handleSubmit} disabled={loading}>
              {loading ? <Spinner /> : <Sparkles size={15} className="mr-2" />}
              {loading ? "Memproses..." : "Prediksi Stok"}
            </button>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div key="r" className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg" 
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="text-base font-extrabold text-slate-100 mb-1 tracking-tight">Prediksi Stok Berikutnya</h3>
            <p className="text-sm text-slate-400 mb-5">Estimasi stok periode bulan depan</p>

            <div className="grid grid-cols-2 gap-3 my-5">
              <div className="bg-slate-900 rounded-xl p-4 text-center">
                <div className="text-[11px] text-slate-400 font-semibold mb-0.5">Stok Sekarang</div>
                <div className="text-2xl font-extrabold text-slate-100">{fmt(stokLama)}</div>
                <div className="text-xs text-slate-400">ton</div>
              </div>
              <div className="bg-green-500/10 rounded-xl p-4 text-center border border-green-500/30">
                <div className="text-[11px] text-green-500 font-semibold mb-1">Prediksi Berikutnya</div>
                <div className="text-2xl font-extrabold text-green-500">{fmt(stokBaru)}</div>
                <div className="text-xs text-green-500">ton</div>
              </div>
            </div>

            <div className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 mb-3.5 ${
              delta >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}>
              {delta >= 0
                ? <ArrowUpRight size={17} className="text-green-500" />
                : <ArrowDownRight size={17} className="text-red-500" />}
              <span className={`text-sm font-bold ${delta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {delta >= 0 ? "+" : ""}{fmt(delta)} ton ({delta >= 0 ? "peningkatan" : "penurunan"})
              </span>
            </div>

            <div className="bg-slate-900 rounded-xl p-3.5 flex items-center gap-2.5 border-l-4 border-green-500">
              <Badge status={result.prediksi.status} />
              <span className="text-sm text-slate-300">{result.prediksi.status}</span>
            </div>
          </motion.div>
        ) : (
          <motion.div key="e" className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center min-h-[280px]">
            <Package size={40} strokeWidth={1.4} className="text-slate-400" />
            <p className="text-center text-sm text-slate-300 mt-3.5">
              Cek harga TBS, lalu klik<br /><strong className="text-slate-100">Prediksi Stok</strong>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Tab: Grafik Tren ---
function TabTren() {
  const [data, setData] = useState(null);
  const [bulan, setBulan] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeChart, setActiveChart] = useState("stok");

  const fetchTren = async (b) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/tren?bulan=${b}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Gagal memuat data tren.");
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTren(bulan); }, [bulan]);

  const chartData = data
    ? [
        ...(data.historis || []).map((d) => ({ ...d })),
        ...(data.prediksi || []).map((d) => ({ bulan: d.bulan, stokPrediksi: d.stokPrediksi })),
      ]
    : [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center flex-wrap gap-2.5">
        <div className="flex gap-2">
          {["stok", "distribusi"].map((c) => (
            <button key={c} onClick={() => setActiveChart(c)} 
              className={`px-4 py-1.5 rounded-lg border text-sm font-semibold transition-all ${
                activeChart === c 
                  ? 'bg-green-500 text-slate-900 border-green-500' 
                  : 'bg-transparent text-slate-300 border-slate-700'
              }`}>
              {c === "stok" ? "Tren Stok" : "Tren Distribusi"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5 text-sm text-slate-400">
          <span>Prediksi ke depan:</span>
          {[3, 6, 9].map((b) => (
            <button key={b} onClick={() => setBulan(b)} 
              className={`px-3 py-1 rounded-lg border text-sm transition-all ${
                bulan === b 
                  ? 'bg-green-500/10 text-green-500 border-green-500/40 font-bold' 
                  : 'bg-transparent text-slate-300 border-slate-700 font-medium'
              }`}>
              {b} bln
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
        <div className="flex justify-between items-start mb-5 flex-wrap gap-2.5">
          <div>
            <h3 className="text-base font-extrabold text-slate-100 tracking-tight">
              {activeChart === "stok" ? "Tren Stok Kelapa Sawit" : "Tren Distribusi Bulanan"}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Data historis dari database + prediksi {bulan} bulan ke depan
            </p>
          </div>
          <div className="flex gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 bg-green-500 rounded-full inline-block" />
              Historis
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 bg-yellow-500 rounded-full inline-block" />
              Prediksi
            </span>
          </div>
        </div>

        <ErrorBanner message={error} />

        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm gap-2">
            <Spinner size={15} /> Memuat data tren...
          </div>
        ) : !data ? null : (
          <ResponsiveContainer width="100%" height={300}>
            {activeChart === "stok" ? (
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                {data.historis && data.historis.length > 0 && (
                  <ReferenceLine
                    x={data.historis[data.historis.length - 1]?.bulan}
                    stroke="#475569" strokeDasharray="4 2" label={{ value: "sekarang", fontSize: 11, fill: "#94a3b8" }}
                  />
                )}
                <Line dataKey="stok" name="Stok historis" stroke="#22c55e"
                  strokeWidth={2.5} dot={{ r: 4, fill: "#22c55e" }} connectNulls />
                <Line dataKey="stokPrediksi" name="Stok prediksi" stroke="#f0b13e"
                  strokeWidth={2.5} strokeDasharray="5 3" dot={{ r: 4, fill: "#f0b13e" }} connectNulls />
              </LineChart>
            ) : (
              <BarChart data={data.historis || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="distribusi" name="Distribusi" fill="#22c55e" radius={[4,4,0,0]} />
                <Bar dataKey="permintaan" name="Permintaan" fill="#3f6b4a" radius={[4,4,0,0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}

        {!loading && data && (!data.historis || data.historis.length === 0) && (
          <div className="text-center py-10 text-slate-400">
            <Inbox size={32} strokeWidth={1.4} className="mx-auto mb-2" />
            <p className="text-sm">Belum ada data distribusi di database.<br/>Tambahkan data distribusi terlebih dahulu.</p>
          </div>
        )}
      </div>

      {data && data.historis && data.historis.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Rata-rata distribusi/bulan", val: fmt(data.summary?.rataRataDistribusiBulanan || 0) + " ton", Icon: Gauge },
            { label: `Prediksi stok ${bulan} bulan`, val: fmt(data.prediksi?.[data.prediksi.length - 1]?.stokPrediksi ?? 0) + " ton", Icon: Sparkles },
            { label: "Total distribusi historis", val: fmt(data.summary?.totalDistribusiHistoris || 0) + " ton", Icon: Truck },
          ].map((s) => (
            <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-lg">
              <s.Icon size={20} className="text-green-500 mb-2.5" />
              <div className="text-[11px] text-slate-400 font-semibold mb-0.5">{s.label}</div>
              <div className="text-lg font-extrabold text-slate-100">{s.val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Tab: Riwayat Prediksi ---
function TabRiwayat() {
  const [riwayat, setRiwayat] = useState([]);
  const [filter, setFilter] = useState("semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingAll, setDeletingAll] = useState(false);

  const fetchRiwayat = async () => {
    setLoading(true);
    setError("");
    try {
      const q = filter !== "semua" ? `?tipe=${filter}` : "";
      const res = await fetch(`${API_BASE}/riwayat${q}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Gagal memuat riwayat.");
      setRiwayat(json.riwayat || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRiwayat(); }, [filter]);

  const handleHapus = async (id) => {
    setRiwayat((prev) => prev.filter((r) => r.id !== id));
    try {
      await fetch(`${API_BASE}/riwayat/${id}`, { method: "DELETE" });
    } catch {
      fetchRiwayat();
    }
  };
    const handleHapusSemua = async () => {
    if (riwayat.length === 0) return;

    const konfirmasi = window.confirm(
      `Hapus semua ${riwayat.length} riwayat prediksi${filter !== "semua" ? ` (filter: ${filter})` : ""}? Tindakan ini tidak bisa dibatalkan.`
    );
    if (!konfirmasi) return;

    setDeletingAll(true);
    setError("");

    const idList = riwayat.map((r) => r.id);
    const snapshot = riwayat;
    setRiwayat([]);

    try {
      const results = await Promise.allSettled(
        idList.map((id) => fetch(`${API_BASE}/riwayat/${id}`, { method: "DELETE" }))
      );
      const adaGagal = results.some((r) => r.status === "rejected");
      if (adaGagal) {
        setError("Sebagian riwayat gagal dihapus. Memuat ulang daftar...");
        fetchRiwayat();
      }
    } catch {
      setError("Gagal menghapus riwayat. Memuat ulang daftar...");
      setRiwayat(snapshot);
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center flex-wrap">
        {["semua", "kebutuhan", "stok"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} 
            className={`px-4 py-1.5 rounded-lg border text-sm font-semibold capitalize transition-all ${
              filter === f 
                ? 'bg-green-500 text-slate-900 border-green-500' 
                : 'bg-transparent text-slate-300 border-slate-700'
            }`}>
            {f === "semua" ? "Semua" : f}
          </button>
        ))}

        <button
          onClick={handleHapusSemua}
          disabled={deletingAll || loading || riwayat.length === 0}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg border text-sm font-semibold transition-all ${
            deletingAll || loading || riwayat.length === 0
              ? 'bg-transparent text-slate-500 border-slate-700 cursor-not-allowed'
              : 'bg-red-500/10 text-red-500 border-red-500/40 hover:bg-red-500/20'
          }`}
        >
          {deletingAll ? <Spinner size={13} /> : <Trash2 size={14} />}
          {deletingAll ? "Menghapus..." : "Hapus Semua"}
        </button>

        <span className="ml-auto text-slate-400 text-sm">
          {loading ? "Memuat..." : `${riwayat.length} hasil`}
        </span>
      </div>

      <ErrorBanner message={error} />

      {!loading && riwayat.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg text-center py-14 text-slate-400">
          <History size={34} strokeWidth={1.4} className="mx-auto mb-3" />
          <p className="text-sm">Belum ada riwayat prediksi.<br />Lakukan prediksi terlebih dahulu.</p>
        </div>
      ) : (
        <AnimatePresence>
          {riwayat.map((r, i) => (
            <motion.div key={r.id || i}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.04 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-lg">
              <div className="flex justify-between items-start gap-2">
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    {r.tipe === "kebutuhan"
                      ? <BarChart3 size={18} className="text-green-500" />
                      : <Package size={18} className="text-green-500" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-sm text-slate-100">
                        Prediksi {r.tipe === "kebutuhan" ? "Kebutuhan Distribusi" : "Stok Periode Berikutnya"}
                      </span>
                      <Badge status={r.tipe === "kebutuhan" ? r.prediksi?.keterangan : r.prediksi?.status} />
                    </div>
                    <div className="text-sm text-slate-300">
                      {r.tipe === "kebutuhan"
                        ? `Hasil: ${fmt(r.prediksi?.kebutuhanTon || 0)} ton kebutuhan distribusi`
                        : `Hasil: ${fmt(r.prediksi?.stokPeriodeBerikutnyaTon || 0)} ton stok berikutnya`}
                      {r.produk && r.produk !== "-" ? ` · ${r.produk}` : ""}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{fmtDate(r.timestamp)}</div>
                  </div>
                </div>
                <button onClick={() => handleHapus(r.id)} 
                  className="border-none bg-transparent cursor-pointer p-1.5 rounded-lg hover:bg-slate-700 transition-colors" 
                  aria-label="Hapus">
                  <Trash2 size={15} className="text-slate-400" />
                </button>
              </div>

              {r.input && Object.keys(r.input).length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700 flex gap-4 flex-wrap">
                  {Object.entries(r.input).filter(([k]) => !k.includes("Label")).map(([k, v]) => (
                    <div key={k} className="text-xs">
                      <span className="text-slate-400">{k}: </span>
                      <span className="font-semibold text-slate-300">
                        {typeof v === "number" && v <= 1 ? v : fmt(v)}
                        {k === "hargaTBS" ? " Rp/kg" : !["wilayah", "musim"].includes(k) ? " ton" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

// --- Halaman Utama ---
export default function PrediksiAI() {
  const [activeTab, setActiveTab] = useState("kebutuhan");
  const [riwayatCount, setRiwayatCount] = useState(0);

  const refreshCount = async () => {
    try {
      const res = await fetch(`${API_BASE}/riwayat?limit=100`);
      const json = await res.json();
      if (json.success) setRiwayatCount(json.total || 0);
    } catch {
      // server AI belum jalan, abaikan
    }
  };

  useEffect(() => { refreshCount(); }, [activeTab]);

  const handleSaveRiwayat = () => {
    refreshCount();
  };

  return (
    <div className="bg-transparent min-h-screen">
      <div className="px-6 lg:px-8 py-8 max-w-[1100px] mx-auto">
        <div className="mb-7 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
            <Sparkles size={22} className="text-slate-900" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              Prediksi AI
            </h1>
            <p className="text-slate-400 mt-0.5 text-sm">
              Sistem prediksi distribusi kelapa sawit berbasis Neural Network (brain.js)
            </p>
          </div>
        </div>

        <div className="flex gap-1 bg-slate-900 rounded-xl p-1 mb-6 flex-wrap">
          {TAB_LIST.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
              className={`flex-1 min-w-[140px] px-2 py-2.5 rounded-lg border-none text-sm font-semibold transition-all flex items-center justify-center ${
                activeTab === tab.id 
                  ? 'bg-slate-800 text-green-500 shadow-md' 
                  : 'bg-transparent text-slate-400'
              }`}>
              <tab.Icon size={15} className="mr-1.5" />
              {tab.label}
              {tab.id === "riwayat" && riwayatCount > 0 && (
                <span className="ml-1.5 bg-green-500 text-slate-900 rounded-full text-[11px] px-2 py-0.5 font-bold">
                  {riwayatCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}>
            {activeTab === "kebutuhan" && <TabKebutuhan onSaveRiwayat={handleSaveRiwayat} />}
            {activeTab === "stok"      && <TabStok onSaveRiwayat={handleSaveRiwayat} />}
            {activeTab === "tren"      && <TabTren />}
            {activeTab === "riwayat"   && <TabRiwayat />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}