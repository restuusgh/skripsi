import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Plus, Search, Download, RefreshCw, Eye, Pencil,
  Trash2, X, MapPin, User, Phone, Mail, CheckCircle2,
  XCircle, Loader2, AlertTriangle, Truck, Globe,
} from "lucide-react";

const API_BASE = "http://localhost:4000/api/distributor";

const DUMMY_DISTRIBUTOR = [
  { id: 1, nama: "PT Sinar Sawit", kota: "Medan", pic: "Andi Saputra", telepon: "08123456789", email: "admin@sinarsawit.com", alamat: "Jl. Gatot Subroto No.123", distribusi: 124, status: "aktif", produk: ["CPO", "Minyak Goreng"] },
  { id: 2, nama: "PT Agro Palma", kota: "Pekanbaru", pic: "Budi Hartono", telepon: "081398765432", email: "info@agropalma.com", alamat: "Jl. Sudirman No.45", distribusi: 83, status: "aktif", produk: ["CPO"] },
  { id: 3, nama: "PT Nusantara Oil", kota: "Dumai", pic: "Rina Wulandari", telepon: "081234567890", email: "cs@nusantaraoil.com", alamat: "Jl. Pelabuhan No.7", distribusi: 42, status: "nonaktif", produk: ["Minyak Goreng"] },
];

const STATUS_OPT = [
  { value: "aktif", label: "Aktif" },
  { value: "nonaktif", label: "Nonaktif" },
  { value: "pending", label: "Pending" },
];

const STATUS_MAP = {
  aktif: { bg: "bg-green-500/10", color: "text-green-500", label: "Aktif", dot: "bg-green-500" },
  nonaktif: { bg: "bg-red-500/10", color: "text-red-500", label: "Nonaktif", dot: "bg-red-500" },
  pending: { bg: "bg-yellow-500/10", color: "text-yellow-500", label: "Pending", dot: "bg-yellow-500" },
};

const FORM_KOSONG = { nama: "", alamat: "", kota: "", pic: "", telepon: "", email: "", status: "aktif" };

// Konfigurasi field form — sumber kebenaran tunggal untuk ModalForm
const FORM_FIELDS = [
  { key: "nama", label: "Nama Distributor", placeholder: "PT Sinar Sawit" },
  { key: "alamat", label: "Alamat", placeholder: "Jl. Gatot Subroto No.123" },
  { key: "kota", label: "Kota", placeholder: "Medan", group: 1 },
  { key: "pic", label: "PIC", placeholder: "Andi Saputra", group: 1 },
  { key: "telepon", label: "Telepon", placeholder: "08123456789", group: 2 },
  { key: "status", label: "Status", type: "select", options: STATUS_OPT, group: 2 },
  { key: "email", label: "Email", placeholder: "admin@sinarsawit.com" },
];

const fmt = (n) => new Intl.NumberFormat("id-ID").format(n || 0);
const inputCls = "w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm outline-none";

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span className={`${s.bg} ${s.color} inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} /> {s.label}
    </span>
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

function ErrorBox({ children }) {
  return (
    <div className="bg-red-500/10 border border-red-500/35 rounded-xl p-3 text-sm text-red-500 flex gap-2 items-start">
      <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" /> {children}
    </div>
  );
}

function Overlay({ children, onClose, wide }) {
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div
          className={`bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full shadow-2xl ${wide ? "max-w-md" : "max-w-sm"}`}
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// --- Panel Detail (slide-in) ---
function PanelDetail({ distributor, onClose, onEdit, onDelete }) {
  if (!distributor) return null;
  const infoRows = [
    { Icon: MapPin, value: distributor.kota },
    { Icon: User, value: distributor.pic },
    { Icon: Phone, value: distributor.telepon },
    { Icon: Mail, value: distributor.email },
  ];
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/50 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="fixed top-0 right-0 h-full w-full max-w-[380px] bg-slate-800 border-l border-slate-700 z-50 shadow-2xl overflow-y-auto"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.25 }}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-5">
            <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Building2 size={20} className="text-green-500" />
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors">
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          <h2 className="text-lg font-extrabold text-slate-100 mb-4">{distributor.nama}</h2>

          <div className="flex flex-col gap-3 mb-5 text-sm">
            {infoRows.map(({ Icon, value }, i) => (
              <div key={i} className="flex items-center gap-2.5 text-slate-300">
                <Icon size={14} className="text-slate-400 flex-shrink-0" /> {value}
              </div>
            ))}
            {distributor.alamat && <div className="text-xs text-slate-400 mt-1 pl-6">{distributor.alamat}</div>}
          </div>

          <div className="border-t border-slate-700 pt-4 mb-4">
            <div className="text-[11px] text-slate-400 font-semibold mb-1.5 uppercase tracking-wide">Distribusi</div>
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-green-500" />
              <span className="text-lg font-extrabold text-slate-100">{fmt(distributor.distribusi)}</span>
              <span className="text-sm text-slate-400">kali</span>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 mb-4">
            <div className="text-[11px] text-slate-400 font-semibold mb-2 uppercase tracking-wide">Produk</div>
            <div className="flex flex-wrap gap-2">
              {(distributor.produk || []).map((p) => (
                <span key={p} className="bg-slate-900 border border-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-lg">{p}</span>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 mb-6">
            <div className="text-[11px] text-slate-400 font-semibold mb-2 uppercase tracking-wide">Status</div>
            <StatusBadge status={distributor.status} />
          </div>

          <div className="flex gap-2.5">
            <button onClick={() => onEdit(distributor)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-700 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors">
              <Pencil size={14} /> Edit
            </button>
            <button onClick={() => onDelete(distributor)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-500/40 bg-red-500/10 text-sm font-semibold text-red-500 hover:bg-red-500/20 transition-colors">
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
  const [form, setForm] = useState(initialData || FORM_KOSONG);
  const [error, setError] = useState("");

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = () => {
    if (!form.nama || !form.kota || !form.pic || !form.telepon) {
      setError("Nama, kota, PIC, dan telepon wajib diisi.");
      return;
    }
    setError("");
    onSubmit(form);
  };

  const renderField = (f) => (
    <div key={f.key}>
      <label className="text-xs font-semibold text-slate-300 mb-1.5 block">{f.label}</label>
      {f.type === "select" ? (
        <select className={inputCls} value={form[f.key]} onChange={(e) => handleChange(f.key, e.target.value)}>
          {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input className={inputCls} placeholder={f.placeholder} value={form[f.key]} onChange={(e) => handleChange(f.key, e.target.value)} />
      )}
    </div>
  );

  const singles = FORM_FIELDS.filter((f) => !f.group);
  const group1 = FORM_FIELDS.filter((f) => f.group === 1);
  const group2 = FORM_FIELDS.filter((f) => f.group === 2);

  return (
    <Overlay onClose={onClose} wide>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-base font-extrabold text-slate-100">{mode === "edit" ? "Edit Distributor" : "Tambah Distributor"}</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors">
          <X size={18} className="text-slate-400" />
        </button>
      </div>

      <div className="flex flex-col gap-3.5">
        {renderField(singles[0])}
        {renderField(singles[1])}
        <div className="grid grid-cols-2 gap-3">{group1.map(renderField)}</div>
        <div className="grid grid-cols-2 gap-3">{group2.map(renderField)}</div>
        {renderField(singles[2])}

        {error && <ErrorBox>{error}</ErrorBox>}

        <button onClick={handleSubmit} disabled={submitting}
          className={`w-full mt-2 py-3 rounded-xl text-sm font-bold flex items-center justify-center transition-colors ${
            submitting ? "bg-green-800 text-slate-900 cursor-not-allowed" : "bg-green-500 hover:bg-green-400 text-slate-900"}`}>
          {submitting && <Spinner size={15} />}
          {submitting ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </Overlay>
  );
}

// --- Modal Konfirmasi Hapus ---
function ModalKonfirmasiHapus({ distributor, onClose, onConfirm, submitting }) {
  if (!distributor) return null;
  return (
    <Overlay onClose={onClose}>
      <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
        <AlertTriangle size={20} className="text-red-500" />
      </div>
      <h3 className="text-base font-extrabold text-slate-100 mb-1.5">Hapus Distributor?</h3>
      <p className="text-sm text-slate-400 mb-5">
        <strong className="text-slate-200">{distributor.nama}</strong> akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.
      </p>
      <div className="flex gap-2.5">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors">
          Batal
        </button>
        <button onClick={onConfirm} disabled={submitting}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
            submitting ? "bg-red-800 text-slate-100 cursor-not-allowed" : "bg-red-500 hover:bg-red-400 text-slate-900"}`}>
          {submitting && <Spinner size={14} />}
          {submitting ? "Menghapus..." : "Hapus"}
        </button>
      </div>
    </Overlay>
  );
}

// --- Halaman Utama ---
export default function Distributor() {
  const [list, setList] = useState(DUMMY_DISTRIBUTOR);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterKota, setFilterKota] = useState("semua");
  const [filterStatus, setFilterStatus] = useState("semua");

  const [selected, setSelected] = useState(null);
  const [modalForm, setModalForm] = useState(null); // { mode: "tambah" | "edit", data }
  const [modalHapus, setModalHapus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // --- Ganti dengan fetch API asli saat backend siap ---
  const fetchDistributor = async () => {
    setLoading(true);
    setError("");
    try {
      // const res = await fetch(`${API_BASE}`);
      // const json = await res.json();
      // if (!res.ok || !json.success) throw new Error(json.error || "Gagal memuat data distributor.");
      // setList(json.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDistributor(); }, []);

  const kotaOptions = useMemo(() => ["semua", ...new Set(list.map((d) => d.kota))], [list]);

  const filtered = useMemo(() => list.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.nama.toLowerCase().includes(q) || d.pic.toLowerCase().includes(q);
    return matchSearch && (filterKota === "semua" || d.kota === filterKota) && (filterStatus === "semua" || d.status === filterStatus);
  }), [list, search, filterKota, filterStatus]);

  const stats = useMemo(() => {
    const aktif = list.filter((d) => d.status === "aktif").length;
    return [
      { label: "Total Distributor", value: list.length, Icon: Building2, color: { bg: "bg-green-500/10", text: "text-green-500" } },
      { label: "Aktif", value: aktif, Icon: CheckCircle2, color: { bg: "bg-green-500/10", text: "text-green-500" } },
      { label: "Nonaktif", value: list.filter((d) => d.status === "nonaktif").length, Icon: XCircle, color: { bg: "bg-red-500/10", text: "text-red-500" } },
      { label: "Total Kota", value: new Set(list.map((d) => d.kota)).size, Icon: Globe, color: { bg: "bg-blue-500/10", text: "text-blue-500" } },
      { label: "Total Distribusi", value: fmt(list.reduce((s, d) => s + (d.distribusi || 0), 0)), Icon: Truck, color: { bg: "bg-yellow-500/10", text: "text-yellow-500" } },
    ];
  }, [list]);

  const handleSubmitForm = async (form) => {
    setSubmitting(true);
    try {
      if (modalForm.mode === "edit") {
        // await fetch(`${API_BASE}/${modalForm.data.id}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify(form) });
        setList((prev) => prev.map((d) => (d.id === modalForm.data.id ? { ...d, ...form } : d)));
      } else {
        // const res = await fetch(API_BASE, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(form) });
        setList((prev) => [{ ...form, id: Date.now(), distribusi: 0, produk: [] }, ...prev]);
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

  const handleExportExcel = () => alert("Export Excel — hubungkan dengan library export sesuai kebutuhan.");

  const TABLE_COLS = ["Distributor", "Kota", "PIC", "Telepon", "Distribusi", "Status"];

  return (
    <div className="bg-transparent min-h-screen">
      <div className="px-6 lg:px-8 py-8 max-w-[1300px] mx-auto">

        {/* Header */}
        <div className="mb-7 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
              <Building2 size={22} className="text-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Distributor</h1>
              <p className="text-slate-400 mt-0.5 text-sm">Kelola seluruh distributor dan tujuan distribusi perusahaan</p>
            </div>
          </div>
          <button onClick={() => setModalForm({ mode: "tambah", data: FORM_KOSONG })}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-slate-900 text-sm font-bold transition-colors">
            <Plus size={16} /> Tambah Distributor
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        {/* Filter bar */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 mb-6 shadow-lg flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari distributor atau PIC..." className={`${inputCls} pl-9`}
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <select className={`${inputCls} min-w-[140px]`} value={filterKota} onChange={(e) => setFilterKota(e.target.value)}>
            {kotaOptions.map((k) => <option key={k} value={k}>{k === "semua" ? "Semua Kota" : k}</option>)}
          </select>

          <select className={`${inputCls} min-w-[140px]`} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="semua">Semua Status</option>
            {STATUS_OPT.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <button onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-200 text-sm font-semibold hover:bg-slate-700 transition-colors">
            <Download size={14} /> Export Excel
          </button>
          <button onClick={fetchDistributor}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-200 text-sm font-semibold hover:bg-slate-700 transition-colors">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {error && <div className="mb-4"><ErrorBox>{error}</ErrorBox></div>}

        {/* Tabel */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-100 tracking-tight">Daftar Distributor</h3>
            <span className="text-xs text-slate-400">{loading ? "Memuat..." : `${filtered.length} dari ${list.length}`}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                  {TABLE_COLS.map((c) => <th key={c} className="py-2.5 px-2 font-semibold">{c}</th>)}
                  <th className="py-2.5 px-2 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((d) => (
                    <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-t border-slate-700">
                      <td className="py-3 px-2 font-bold text-slate-100">{d.nama}</td>
                      <td className="py-3 px-2 text-slate-300">{d.kota}</td>
                      <td className="py-3 px-2 text-slate-300">{d.pic}</td>
                      <td className="py-3 px-2 text-slate-300">{d.telepon}</td>
                      <td className="py-3 px-2 text-slate-300">{fmt(d.distribusi)}</td>
                      <td className="py-3 px-2"><StatusBadge status={d.status} /></td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => setSelected(d)} className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors" aria-label="Detail">
                            <Eye size={15} className="text-slate-400" />
                          </button>
                          <button onClick={() => setModalForm({ mode: "edit", data: d })} className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors" aria-label="Edit">
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
                <Building2 size={28} strokeWidth={1.4} className="mx-auto mb-2" />
                <p className="text-sm">Tidak ada distributor yang cocok dengan filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <PanelDetail distributor={selected} onClose={() => setSelected(null)}
          onEdit={(d) => { setSelected(null); setModalForm({ mode: "edit", data: d }); }}
          onDelete={(d) => { setSelected(null); setModalHapus(d); }} />
      )}

      {modalForm && (
        <ModalForm mode={modalForm.mode} initialData={modalForm.data} onClose={() => setModalForm(null)}
          onSubmit={handleSubmitForm} submitting={submitting} />
      )}

      {modalHapus && (
        <ModalKonfirmasiHapus distributor={modalHapus} onClose={() => setModalHapus(null)} onConfirm={handleHapus} submitting={submitting} />
      )}
    </div>
  );
}