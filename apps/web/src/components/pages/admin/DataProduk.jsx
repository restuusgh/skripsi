// src/components/pages/DataProduk.jsx
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Plus, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle, XCircle, Clock, RefreshCw, Tag, Loader2,
} from "lucide-react";
import api from "../../utils/api";

// ── Konfigurasi Status (dipakai badge & statistik) ──
// Status ini TIDAK disimpan di database — dihitung dari stok.jumlahStok
// vs stok.minimalStok setiap kali data diambil.
const STATUS_CONFIG = {
  Tersedia: { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/30", icon: CheckCircle },
  Menipis: { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/30", icon: Clock },
  Habis: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/30", icon: XCircle },
};

const deriveStatus = (produk) => {
  const jumlah = Number(produk.stok?.jumlahStok ?? 0);
  const minimal = Number(produk.stok?.minimalStok ?? 0);
  if (!produk.stok || jumlah <= 0) return "Habis";
  if (jumlah <= minimal) return "Menipis";
  return "Tersedia";
};

// ── Konfigurasi field form (tambah/edit) — hanya field yang memang
// diterima backend createProduk/updateProduk ──
const FORM_FIELDS = [
  { key: "namaProduk", label: "Nama Produk", required: true, placeholder: "Crude Palm Oil" },
  { key: "jenisProduk", label: "Kategori", required: true, placeholder: "Minyak Sawit Mentah" },
  {
    key: "satuan", label: "Satuan", required: true, type: "select",
    options: ["Ton", "Kg", "Liter"],
  },
];

const formatNum = (v) => new Intl.NumberFormat("id-ID").format(v ?? 0);
const inputCls = "w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-100 focus:outline-none focus:border-green-500/50 transition-all";

// ── Komponen kecil ──
function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.Tersedia;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <c.icon size={12} />
      {status}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-700/50">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-20 bg-slate-700/50 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

function FormFieldInput({ field, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
        {field.label} {field.required && <span className="text-red-400">*</span>}
      </label>
      {field.type === "select" ? (
        <select value={value || ""} onChange={(e) => onChange(field.key, e.target.value)} className={inputCls}>
          <option value="">Pilih {field.label}</option>
          {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={field.type || "text"}
          value={value || ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          className={inputCls}
        />
      )}
    </div>
  );
}

// ── Komponen Utama ──
export default function DataProduk() {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedProduk, setSelectedProduk] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formMode, setFormMode] = useState("tambah"); // tambah | edit | detail
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadProduk = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/produk");
      setProduk(res.data?.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? "Gagal memuat data produk.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduk();
  }, []);

  const filteredData = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return produk.filter((item) => {
      const matchesSearch =
        !q ||
        item.namaProduk?.toLowerCase().includes(q) ||
        item.jenisProduk?.toLowerCase().includes(q);
      const matchesStatus = filterStatus === "semua" || deriveStatus(item) === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [produk, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const currentItems = filteredData.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);

  const openModal = (mode, item = null) => {
    setFormMode(mode);
    setSelectedProduk(item);
    setFormError("");
    setFormData(
      item
        ? { namaProduk: item.namaProduk, jenisProduk: item.jenisProduk, satuan: item.satuan, deskripsi: item.deskripsi ?? "" }
        : { namaProduk: "", jenisProduk: "", satuan: "", deskripsi: "" }
    );
    setShowModal(true);
  };

  const handleFormChange = (key, value) => setFormData((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (formMode === "edit") {
        await api.put(`/produk/${selectedProduk.id}`, formData);
      } else {
        await api.post("/produk", formData);
      }
      await loadProduk();
      setShowModal(false);
    } catch (err) {
      setFormError(err.response?.data?.message ?? "Gagal menyimpan produk.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/produk/${selectedProduk.id}`);
      setProduk((prev) => prev.filter((p) => p.id !== selectedProduk.id));
      setShowDeleteModal(false);
      setSelectedProduk(null);
    } catch (err) {
      alert(err.response?.data?.message ?? "Gagal menghapus produk.");
    }
  };

  const stats = [
    { label: "Total Produk", value: produk.length, icon: Package, color: "text-blue-400", bg: "bg-blue-500/10" },
    ...Object.keys(STATUS_CONFIG).map((s) => ({
      label: s, value: produk.filter((p) => deriveStatus(p) === s).length,
      icon: STATUS_CONFIG[s].icon, color: STATUS_CONFIG[s].text.replace("500", "400"), bg: STATUS_CONFIG[s].bg,
    })),
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/30">
            <Package size={24} className="text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Data Produk</h1>
            <p className="text-sm text-slate-400">
              Kelola data produk kelapa sawit
              {!loading && <span className="ml-2 text-green-400">· {filteredData.length} produk ditemukan</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadProduk} title="Refresh"
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => openModal("tambah")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-slate-900 font-semibold text-sm transition-all shadow-lg shadow-green-500/20">
            <Plus size={18} /> Tambah Produk
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-6 flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Cari produk berdasarkan nama atau kategori..."
            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-all" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {["semua", ...Object.keys(STATUS_CONFIG)].map((status) => (
            <button key={status} onClick={() => { setFilterStatus(status); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filterStatus === status ? "bg-green-500/20 text-green-500 border border-green-500/30"
                  : "bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600"}`}>
              {status === "semua" ? "Semua" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-900/30">
                {["Produk", "Kategori", "Stok", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Package size={40} className="text-slate-600" />
                      <p className="text-slate-400">Tidak ada data produk</p>
                      <button onClick={() => openModal("tambah")} className="text-green-500 hover:text-green-400 text-sm font-semibold">
                        + Tambah produk baru
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {currentItems.map((item, index) => {
                    const status = deriveStatus(item);
                    return (
                      <motion.tr key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center border border-green-500/20">
                              <Tag size={16} className="text-green-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-100">{item.namaProduk}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300">{item.jenisProduk}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-100">
                            {formatNum(item.stok?.jumlahStok)}{" "}
                            <span className="text-xs text-slate-500 font-normal">{item.satuan}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Minimal: {formatNum(item.stok?.minimalStok)} {item.satuan}
                          </p>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openModal("detail", item)} title="Lihat detail"
                              className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"><Eye size={16} /></button>
                            <button onClick={() => openModal("edit", item)} title="Edit"
                              className="p-2 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all"><Edit size={16} /></button>
                            <button onClick={() => { setSelectedProduk(item); setShowDeleteModal(true); }} title="Hapus"
                              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50 bg-slate-900/30">
            <p className="text-sm text-slate-400">
              Menampilkan {indexOfLastItem - itemsPerPage + 1} - {Math.min(indexOfLastItem, filteredData.length)} dari {filteredData.length} produk
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-600 transition-all">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                    currentPage === page ? "bg-green-500 text-slate-900" : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-600 transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 flex items-center gap-4 hover:border-slate-600 transition-all">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">{s.value}</p>
              <p className="text-sm text-slate-400">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* MODAL: Detail / Tambah / Edit */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    formMode === "detail" ? "bg-blue-500/10 border-blue-500/30"
                      : formMode === "edit" ? "bg-yellow-500/10 border-yellow-500/30" : "bg-green-500/10 border-green-500/30"}`}>
                    {formMode === "detail" ? <Eye size={18} className="text-blue-500" />
                      : formMode === "edit" ? <Edit size={18} className="text-yellow-500" /> : <Plus size={18} className="text-green-500" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-100">
                      {formMode === "detail" ? "Detail Produk" : formMode === "edit" ? "Edit Produk" : "Tambah Produk"}
                    </h2>
                    <p className="text-sm text-slate-400">
                      {formMode === "detail" ? "Informasi lengkap produk" : formMode === "edit" ? "Perbarui data produk" : "Tambahkan produk baru ke sistem"}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-all">✕</button>
              </div>

              {formMode === "detail" && selectedProduk ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Nama Produk", val: selectedProduk.namaProduk },
                      { label: "Kategori", val: selectedProduk.jenisProduk },
                      { label: "Satuan", val: selectedProduk.satuan },
                      { label: "Status", render: <StatusBadge status={deriveStatus(selectedProduk)} /> },
                      { label: "Stok Saat Ini", val: `${formatNum(selectedProduk.stok?.jumlahStok)} ${selectedProduk.satuan}` },
                      { label: "Stok Minimal", val: `${formatNum(selectedProduk.stok?.minimalStok)} ${selectedProduk.satuan}` },
                    ].map((f) => (
                      <div key={f.label} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">{f.label}</p>
                        <div className="text-sm font-semibold text-slate-100 mt-1">{f.render ?? f.val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Deskripsi</p>
                    <p className="text-sm text-slate-300 mt-1">{selectedProduk.deskripsi || "-"}</p>
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-700/50">
                    <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all">Tutup</button>
                    <button onClick={() => openModal("edit", selectedProduk)} className="px-4 py-2 rounded-xl bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/30 transition-all">Edit Produk</button>
                  </div>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {formError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                      <AlertCircle size={16} /> {formError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {FORM_FIELDS.map((f) => (
                      <FormFieldInput key={f.key} field={f} value={formData[f.key]} onChange={handleFormChange} />
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Deskripsi</label>
                    <textarea
                      value={formData.deskripsi || ""}
                      onChange={(e) => handleFormChange("deskripsi", e.target.value)}
                      rows="3" placeholder="Deskripsi produk..."
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                  {formMode === "tambah" && (
                    <p className="text-xs text-slate-500 bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
                      Stok awal produk belum bisa diisi dari form ini — kelola lewat menu Stok setelah produk dibuat.
                    </p>
                  )}
                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-700/50">
                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all">Batal</button>
                    <button type="submit" disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-slate-900 font-semibold transition-all disabled:opacity-60">
                      {saving && <Loader2 size={15} className="animate-spin" />}
                      {formMode === "edit" ? "Simpan Perubahan" : "Tambah Produk"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: Konfirmasi Hapus */}
      <AnimatePresence>
        {showDeleteModal && selectedProduk && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
            onClick={() => setShowDeleteModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/30">
                  <AlertCircle size={24} className="text-red-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Hapus Produk</h2>
                  <p className="text-sm text-slate-400">Konfirmasi penghapusan</p>
                </div>
              </div>
              <p className="text-slate-300 mb-6">
                Apakah Anda yakin ingin menghapus produk <strong className="text-slate-100">{selectedProduk.namaProduk}</strong>? Data yang dihapus tidak dapat dikembalikan.
              </p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all">Batal</button>
                <button onClick={confirmDelete} className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-slate-900 font-semibold transition-all">Hapus</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}