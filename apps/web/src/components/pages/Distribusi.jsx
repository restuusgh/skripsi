import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck, Plus, Search, Download, FileText, RefreshCw, Eye, Pencil,
  Trash2, X, Package, User, CheckCircle2, AlertTriangle, Loader2,
  MapPin, Clock, Calendar, ChevronRight,
} from "lucide-react";

const API_BASE = "http://localhost:4000/api/distribusi";

// --- Opsi (idealnya di-fetch dari API produk/distributor/kendaraan) ---
const PRODUK_OPT = [
  { id: 1, nama: "Crude Palm Oil (CPO)" },
  { id: 2, nama: "Minyak Goreng" },
];

const DISTRIBUTOR_OPT = [
  { id: 1, nama: "PT Sinar Sawit", alamat: "Medan" },
  { id: 2, nama: "PT Agro Palma", alamat: "Pekanbaru" },
  { id: 3, nama: "PT Nusantara Oil", alamat: "Dumai" },
];

const KENDARAAN_OPT = [
  { id: 1, plat: "BK 1234 AB", supir: "Andi Saputra" },
  { id: 2, plat: "BK 8821 XY", supir: "Budi Hartono" },
  { id: 3, plat: "BK 3321 CC", supir: "Rina Wulandari" },
];

const STATUS_OPT = [
  { value: "PROSES", label: "Proses" },
  { value: "SELESAI", label: "Selesai" },
  { value: "DIBATALKAN", label: "Dibatalkan" },
];

const TIMELINE_STEPS = [
  { key: "muat", label: "Barang dimuat" },
  { key: "berangkat", label: "Berangkat gudang" },
  { key: "sampai", label: "Sampai distributor" },
];

// --- Data dummy (ganti dengan fetch API asli) ---
const DUMMY_DISTRIBUSI = [
  {
    id: 1, kodeDistribusi: "SJ-2026-0001", produk: "Crude Palm Oil (CPO)",
    distributor: "PT Sinar Sawit", alamat: "Medan", kendaraan: "BK 1234 AB",
    supir: "Andi Saputra", jumlah: 250, tanggal: "2026-07-05", status: "SELESAI",
    progress: 100, keterangan: "Distribusi rutin bulanan.",
    timeline: { muat: true, berangkat: true, sampai: true },
  },
  {
    id: 2, kodeDistribusi: "SJ-2026-0002", produk: "Minyak Goreng",
    distributor: "PT Agro Palma", alamat: "Pekanbaru", kendaraan: "BK 8821 XY",
    supir: "Budi Hartono", jumlah: 180, tanggal: "2026-07-06", status: "PROSES",
    progress: 65, keterangan: "Menunggu konfirmasi penerimaan.",
    timeline: { muat: true, berangkat: true, sampai: false },
  },
  {
    id: 3, kodeDistribusi: "SJ-2026-0003", produk: "Crude Palm Oil (CPO)",
    distributor: "PT Nusantara Oil", alamat: "Dumai", kendaraan: "BK 3321 CC",
    supir: "Rina Wulandari", jumlah: 300, tanggal: "2026-07-07", status: "PROSES",
    progress: 20, keterangan: "Proses pemuatan barang.",
    timeline: { muat: true, berangkat: false, sampai: false },
  },
];

const FORM_KOSONG = {
  kodeDistribusi: "", tanggalDistribusi: new Date().toISOString().slice(0, 10),
  produkId: PRODUK_OPT[0].id, jumlah: "", distributorId: DISTRIBUTOR_OPT[0].id,
  kendaraanId: KENDARAAN_OPT[0].id, status: "PROSES", keterangan: "",
};

// --- Helper ---
const fmt = (n) => new Intl.NumberFormat("id-ID").format(n || 0);
const fmtTanggal = (iso) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

function generateKodeDistribusi(existing) {
  const tahun = new Date().getFullYear();
  const nomorTerakhir = existing
    .filter((d) => d.kodeDistribusi?.startsWith(`SJ-${tahun}-`))
    .map((d) => Number(d.kodeDistribusi.split("-")[2]))
    .filter((n) => !isNaN(n));
  const next = (nomorTerakhir.length ? Math.max(...nomorTerakhir) : 0) + 1;
  return `SJ-${tahun}-${String(next).padStart(4, "0")}`;
}

function StatusBadge({ status }) {
  const map = {
    SELESAI: { bg: "bg-green-500/10", color: "text-green-500", label: "Selesai", dot: "bg-green-500" },
    PROSES: { bg: "bg-blue-500/10", color: "text-blue-500", label: "Proses", dot: "bg-blue-500" },
    LOADING: { bg: "bg-yellow-500/10", color: "text-yellow-500", label: "Loading", dot: "bg-yellow-500" },
    DIBATALKAN: { bg: "bg-red-500/10", color: "text-red-500", label: "Dibatalkan", dot: "bg-red-500" },
  };
  const s = map[status] || map.PROSES;
  return (
    <span className={`${s.bg} ${s.color} inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function ProgressBar({ value, status }) {
  const color = status === "DIBATALKAN" ? "bg-red-500" : value >= 100 ? "bg-green-500" : value >= 50 ? "bg-blue-500" : "bg-yellow-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-900 rounded-full h-1.5 overflow-hidden min-w-[70px]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-9 text-right">{value}%</span>
    </div>
  );
}

function StatCard({ label, value, Icon, color }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color.bg}`}>
        <Icon size={19} className={color.text} />
      </div>
      <div>
        <div className="text-[11px] text-slate-400 font-semibold mb-0.5">{label}</div>
        <div className="text-xl font-extrabold text-slate-100">{value}</div>
      </div>
    </div>
  );
}

function Spinner({ size = 16 }) {
  return (
    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="inline-flex mr-2">
      <Loader2 size={size} />
    </motion.span>
  );
}

// --- Panel Detail (slide-in) ---
function PanelDetail({ item, onClose, onEdit, onDelete }) {
  if (!item) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-40"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-slate-800 border-l border-slate-700 z-50 shadow-2xl overflow-y-auto"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.25 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-5">
            <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Truck size={20} className="text-green-500" />
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors">
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          <h2 className="text-lg font-extrabold text-slate-100 mb-1">{item.kodeDistribusi}</h2>
          <div className="mb-5"><StatusBadge status={item.status} /></div>

          <div className="flex flex-col gap-4">
            <div>
              <div className="text-[11px] text-slate-400 font-semibold mb-1 uppercase tracking-wide">Produk</div>
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <Package size={14} className="text-slate-400" /> {item.produk} — {fmt(item.jumlah)} ton
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <div className="text-[11px] text-slate-400 font-semibold mb-1 uppercase tracking-wide">Distributor</div>
              <div className="flex items-center gap-2 text-sm text-slate-200 mb-1">
                <Truck size={14} className="text-slate-400" /> {item.distributor}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin size={14} className="text-slate-400" /> {item.alamat}
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <div className="text-[11px] text-slate-400 font-semibold mb-1 uppercase tracking-wide">Kendaraan</div>
              <div className="text-sm text-slate-200 mb-1">{item.kendaraan}</div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <User size={14} className="text-slate-400" /> {item.supir}
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <div className="text-[11px] text-slate-400 font-semibold mb-1 uppercase tracking-wide">Tanggal Distribusi</div>
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <Calendar size={14} className="text-slate-400" /> {fmtTanggal(item.tanggal)}
              </div>
            </div>

            {item.keterangan && (
              <div className="border-t border-slate-700 pt-4">
                <div className="text-[11px] text-slate-400 font-semibold mb-1 uppercase tracking-wide">Keterangan</div>
                <div className="text-sm text-slate-300">{item.keterangan}</div>
              </div>
            )}

            <div className="border-t border-slate-700 pt-4">
              <div className="text-[11px] text-slate-400 font-semibold mb-2.5 uppercase tracking-wide">Timeline</div>
              <div className="flex flex-col gap-2.5">
                {TIMELINE_STEPS.map((step) => {
                  const done = item.timeline?.[step.key];
                  return (
                    <div key={step.key} className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        done ? "bg-green-500/20 text-green-500" : "bg-slate-900 text-slate-500 border border-slate-700"
                      }`}>
                        {done ? <CheckCircle2 size={13} /> : <Clock size={11} />}
                      </div>
                      <span className={`text-sm ${done ? "text-slate-200" : "text-slate-500"}`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 mt-6">
            <button
              onClick={() => onEdit(item)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-700 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              onClick={() => onDelete(item)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-500/40 bg-red-500/10 text-sm font-semibold text-red-500 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 size={14} /> Hapus
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// --- Modal Form Tambah/Edit ---
function ModalForm({ mode, initialData, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(initialData);
  const [error, setError] = useState("");

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = () => {
    if (!form.produkId || !form.jumlah || !form.distributorId || !form.kendaraanId || !form.tanggalDistribusi) {
      setError("Produk, jumlah, distributor, kendaraan, dan tanggal wajib diisi.");
      return;
    }
    setError("");
    onSubmit(form);
  };

  const kendaraanTerpilih = KENDARAAN_OPT.find((k) => k.id === Number(form.kendaraanId));

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4 overflow-y-auto"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl my-8"
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-extrabold text-slate-100">
              {mode === "edit" ? "Edit Distribusi" : "Distribusi Baru"}
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors">
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          <div className="flex flex-col gap-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Nomor Surat Jalan</label>
              <input
                className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 text-sm outline-none cursor-not-allowed"
                readOnly value={form.kodeDistribusi}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Tanggal Distribusi</label>
              <input
                type="date"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm outline-none"
                value={form.tanggalDistribusi}
                onChange={(e) => handleChange("tanggalDistribusi", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Produk</label>
                <select
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm outline-none"
                  value={form.produkId}
                  onChange={(e) => handleChange("produkId", Number(e.target.value))}
                >
                  {PRODUK_OPT.map((p) => (
                    <option key={p.id} value={p.id}>{p.nama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Jumlah (ton)</label>
                <input
                  type="number"
                  placeholder="250"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm outline-none"
                  value={form.jumlah}
                  onChange={(e) => handleChange("jumlah", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Distributor</label>
              <select
                className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm outline-none"
                value={form.distributorId}
                onChange={(e) => handleChange("distributorId", Number(e.target.value))}
              >
                {DISTRIBUTOR_OPT.map((d) => (
                  <option key={d.id} value={d.id}>{d.nama}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Kendaraan</label>
              <select
                className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm outline-none"
                value={form.kendaraanId}
                onChange={(e) => handleChange("kendaraanId", Number(e.target.value))}
              >
                {KENDARAAN_OPT.map((k) => (
                  <option key={k.id} value={k.id}>{k.plat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Supir</label>
              <input
                className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 text-sm outline-none cursor-not-allowed"
                readOnly value={kendaraanTerpilih?.supir || "-"}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Status</label>
              <select
                className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm outline-none"
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                {STATUS_OPT.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Keterangan</label>
              <textarea
                rows={2}
                placeholder="Catatan tambahan (opsional)"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm outline-none resize-none"
                value={form.keterangan}
                onChange={(e) => handleChange("keterangan", e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/35 rounded-xl p-3 text-sm text-red-500 flex gap-2 items-start">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`w-full mt-2 py-3 rounded-xl text-sm font-bold flex items-center justify-center transition-colors ${
                submitting ? "bg-green-800 text-slate-900 cursor-not-allowed" : "bg-green-500 hover:bg-green-400 text-slate-900"
              }`}
            >
              {submitting && <Spinner size={15} />}
              {submitting ? "Menyimpan..." : "Simpan Distribusi"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// --- Modal Konfirmasi Hapus ---
function ModalKonfirmasiHapus({ item, onClose, onConfirm, submitting }) {
  if (!item) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <h3 className="text-base font-extrabold text-slate-100 mb-1.5">Hapus Distribusi?</h3>
          <p className="text-sm text-slate-400 mb-5">
            <strong className="text-slate-200">{item.kodeDistribusi}</strong> akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.
          </p>
          <div className="flex gap-2.5">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors">
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={submitting}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                submitting ? "bg-red-800 text-slate-100 cursor-not-allowed" : "bg-red-500 hover:bg-red-400 text-slate-900"
              }`}
            >
              {submitting && <Spinner size={14} />}
              {submitting ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// --- Halaman Utama ---
export default function Distribusi() {
  const [list, setList] = useState(DUMMY_DISTRIBUSI);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterProduk, setFilterProduk] = useState("semua");
  const [filterDistributor, setFilterDistributor] = useState("semua");

  const [selected, setSelected] = useState(null);
  const [modalForm, setModalForm] = useState(null);
  const [modalHapus, setModalHapus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // --- Ganti dengan fetch API asli saat backend siap ---
  const fetchDistribusi = async () => {
    setLoading(true);
    setError("");
    try {
      // const res = await fetch(API_BASE);
      // const json = await res.json();
      // if (!res.ok || !json.success) throw new Error(json.error || "Gagal memuat data distribusi.");
      // setList(json.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDistribusi(); }, []);

  const produkOptions = useMemo(() => {
    const unik = new Set(list.map((d) => d.produk));
    return ["semua", ...unik];
  }, [list]);

  const distributorOptions = useMemo(() => {
    const unik = new Set(list.map((d) => d.distributor));
    return ["semua", ...unik];
  }, [list]);

  const filtered = useMemo(() => {
    return list.filter((d) => {
      const matchSearch =
        !search ||
        d.kodeDistribusi.toLowerCase().includes(search.toLowerCase()) ||
        d.distributor.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "semua" || d.status === filterStatus;
      const matchProduk = filterProduk === "semua" || d.produk === filterProduk;
      const matchDistributor = filterDistributor === "semua" || d.distributor === filterDistributor;
      return matchSearch && matchStatus && matchProduk && matchDistributor;
    });
  }, [list, search, filterStatus, filterProduk, filterDistributor]);

  const stats = useMemo(() => {
    const selesai = list.filter((d) => d.status === "SELESAI").length;
    const proses = list.filter((d) => d.status === "PROSES").length;
    const dibatalkan = list.filter((d) => d.status === "DIBATALKAN").length;
    const totalTon = list.reduce((sum, d) => sum + (d.jumlah || 0), 0);
    return { total: list.length, selesai, proses, dibatalkan, totalTon };
  }, [list]);

  const handleSubmitForm = async (form) => {
    setSubmitting(true);
    try {
      const produkNama = PRODUK_OPT.find((p) => p.id === Number(form.produkId))?.nama || "-";
      const distributorData = DISTRIBUTOR_OPT.find((d) => d.id === Number(form.distributorId));
      const kendaraanData = KENDARAAN_OPT.find((k) => k.id === Number(form.kendaraanId));

      if (modalForm.mode === "edit") {
        // await fetch(`${API_BASE}/${modalForm.data.id}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify(form) });
        setList((prev) => prev.map((d) => d.id === modalForm.data.id ? {
          ...d, ...form, produk: produkNama, distributor: distributorData?.nama,
          alamat: distributorData?.alamat, kendaraan: kendaraanData?.plat, supir: kendaraanData?.supir,
          jumlah: Number(form.jumlah), tanggal: form.tanggalDistribusi,
          progress: form.status === "SELESAI" ? 100 : d.progress,
        } : d));
      } else {
        // const res = await fetch(API_BASE, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(form) });
        const newItem = {
          id: Date.now(), kodeDistribusi: form.kodeDistribusi, produk: produkNama,
          distributor: distributorData?.nama, alamat: distributorData?.alamat,
          kendaraan: kendaraanData?.plat, supir: kendaraanData?.supir,
          jumlah: Number(form.jumlah), tanggal: form.tanggalDistribusi, status: form.status,
          progress: form.status === "SELESAI" ? 100 : 10, keterangan: form.keterangan,
          timeline: { muat: true, berangkat: false, sampai: false },
        };
        setList((prev) => [newItem, ...prev]);
      }
      setModalForm(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleHapus = async () => {
    setSubmitting(true);
    try {
      // await fetch(`${API_BASE}/${modalHapus.id}`, { method: "DELETE" });
      setList((prev) => prev.filter((d) => d.id !== modalHapus.id));
      setSelected(null);
      setModalHapus(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openTambah = () => {
    setModalForm({
      mode: "tambah",
      data: { ...FORM_KOSONG, kodeDistribusi: generateKodeDistribusi(list) },
    });
  };

  const handleExportExcel = () => alert("Export Excel — hubungkan dengan library export sesuai kebutuhan.");
  const handleExportPdf = () => alert("Export PDF — hubungkan dengan library export sesuai kebutuhan.");

  return (
    <div className="bg-transparent min-h-screen">
      <div className="px-6 lg:px-8 py-8 max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="mb-7 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
              <Truck size={22} className="text-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Distribusi Kelapa Sawit</h1>
              <p className="text-slate-400 mt-0.5 text-sm">
                Kelola seluruh proses distribusi produk ke distributor
              </p>
            </div>
          </div>

          <button
            onClick={openTambah}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-slate-900 text-sm font-bold transition-colors"
          >
            <Plus size={16} /> Distribusi Baru
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard label="Total Distribusi" value={stats.total}
            Icon={Truck} color={{ bg: "bg-green-500/10", text: "text-green-500" }} />
          <StatCard label="Selesai" value={stats.selesai}
            Icon={CheckCircle2} color={{ bg: "bg-green-500/10", text: "text-green-500" }} />
          <StatCard label="Sedang Proses" value={stats.proses}
            Icon={Clock} color={{ bg: "bg-blue-500/10", text: "text-blue-500" }} />
          <StatCard label="Dibatalkan" value={stats.dibatalkan}
            Icon={AlertTriangle} color={{ bg: "bg-red-500/10", text: "text-red-500" }} />
          <StatCard label="Total Produk" value={`${fmt(stats.totalTon)} Ton`}
            Icon={Package} color={{ bg: "bg-yellow-500/10", text: "text-yellow-500" }} />
        </div>

        {/* Filter bar */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 mb-6 shadow-lg flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari no. surat jalan atau distributor..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm outline-none min-w-[130px]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="semua">Semua Status</option>
            {STATUS_OPT.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <select
            className="px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm outline-none min-w-[130px]"
            value={filterProduk}
            onChange={(e) => setFilterProduk(e.target.value)}
          >
            {produkOptions.map((p) => (
              <option key={p} value={p}>{p === "semua" ? "Semua Produk" : p}</option>
            ))}
          </select>

          <select
            className="px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm outline-none min-w-[160px]"
            value={filterDistributor}
            onChange={(e) => setFilterDistributor(e.target.value)}
          >
            {distributorOptions.map((d) => (
              <option key={d} value={d}>{d === "semua" ? "Semua Distributor" : d}</option>
            ))}
          </select>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-200 text-sm font-semibold hover:bg-slate-700 transition-colors"
          >
            <Download size={14} /> Excel
          </button>

          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-200 text-sm font-semibold hover:bg-slate-700 transition-colors"
          >
            <FileText size={14} /> PDF
          </button>

          <button
            onClick={fetchDistribusi}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-200 text-sm font-semibold hover:bg-slate-700 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/35 rounded-xl p-3 text-sm text-red-500 mb-4 flex gap-2.5 items-start">
            <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {/* Tabel */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-100 tracking-tight">Daftar Distribusi</h3>
            <span className="text-xs text-slate-400">
              {loading ? "Memuat..." : `${filtered.length} dari ${list.length}`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                  <th className="py-2.5 px-2 font-semibold">No. SJ</th>
                  <th className="py-2.5 px-2 font-semibold">Produk</th>
                  <th className="py-2.5 px-2 font-semibold">Distributor</th>
                  <th className="py-2.5 px-2 font-semibold">Kendaraan</th>
                  <th className="py-2.5 px-2 font-semibold">Tanggal</th>
                  <th className="py-2.5 px-2 font-semibold">Status</th>
                  <th className="py-2.5 px-2 font-semibold">Progress</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((d) => (
                    <motion.tr
                      key={d.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="border-t border-slate-700"
                    >
                      <td className="py-3 px-2 font-bold text-slate-100">{d.kodeDistribusi}</td>
                      <td className="py-3 px-2 text-slate-300">{d.produk}</td>
                      <td className="py-3 px-2 text-slate-300">{d.distributor}</td>
                      <td className="py-3 px-2 text-slate-300">{d.kendaraan}</td>
                      <td className="py-3 px-2 text-slate-300">{fmtTanggal(d.tanggal)}</td>
                      <td className="py-3 px-2"><StatusBadge status={d.status} /></td>
                      <td className="py-3 px-2 w-[140px]"><ProgressBar value={d.progress} status={d.status} /></td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => setSelected(d)} className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors" aria-label="Detail">
                            <Eye size={15} className="text-slate-400" />
                          </button>
                          <button onClick={() => setModalForm({ mode: "edit", data: { ...d, tanggalDistribusi: d.tanggal, produkId: PRODUK_OPT.find(p => p.nama === d.produk)?.id, distributorId: DISTRIBUTOR_OPT.find(x => x.nama === d.distributor)?.id, kendaraanId: KENDARAAN_OPT.find(k => k.plat === d.kendaraan)?.id } })} className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors" aria-label="Edit">
                            <Pencil size={15} className="text-slate-400" />
                          </button>
                          <button onClick={() => setModalHapus(d)} className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors" aria-label="Hapus">
                            <Trash2 size={15} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {!loading && filtered.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <Truck size={28} strokeWidth={1.4} className="mx-auto mb-2" />
                <p className="text-sm">Tidak ada distribusi yang cocok dengan filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <PanelDetail
          item={selected}
          onClose={() => setSelected(null)}
          onEdit={(d) => { setSelected(null); setModalForm({ mode: "edit", data: { ...d, tanggalDistribusi: d.tanggal } }); }}
          onDelete={(d) => { setSelected(null); setModalHapus(d); }}
        />
      )}

      {modalForm && (
        <ModalForm
          mode={modalForm.mode}
          initialData={modalForm.data}
          onClose={() => setModalForm(null)}
          onSubmit={handleSubmitForm}
          submitting={submitting}
        />
      )}

      {modalHapus && (
        <ModalKonfirmasiHapus
          item={modalHapus}
          onClose={() => setModalHapus(null)}
          onConfirm={handleHapus}
          submitting={submitting}
        />
      )}
    </div>
  );
}