// src/components/pages/DataProduk.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Plus, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle, XCircle, Clock, RefreshCw, Tag,
} from "lucide-react";

// ── Konfigurasi Status (dipakai badge & statistik) ──
const STATUS_CONFIG = {
  Tersedia: { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/30", icon: CheckCircle },
  Menipis: { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/30", icon: Clock },
  Habis: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/30", icon: XCircle },
};

// ── Konfigurasi field form (tambah/edit) — sumber kebenaran tunggal ──
const FORM_FIELDS = [
  { key: "kodeProduk", label: "Kode Produk", required: true, placeholder: "CPO-001" },
  { key: "namaProduk", label: "Nama Produk", required: true, placeholder: "Crude Palm Oil" },
  {
    key: "kategori", label: "Kategori", required: true, type: "select",
    options: ["Minyak Sawit Mentah", "Minyak Inti Sawit", "Minyak Sawit Olahan"],
  },
  { key: "satuan", label: "Satuan", required: true, type: "select", options: ["Ton", "Kg", "Liter"] },
  { key: "hargaPerUnit", label: "Harga per Unit (Rp)", required: true, type: "number", placeholder: "12000" },
  { key: "supplier", label: "Supplier", required: true, placeholder: "PT. Sawit Jaya Abadi" },
  { key: "stokMinimum", label: "Stok Minimum", type: "number", placeholder: "50" },
  { key: "stokMaksimum", label: "Stok Maksimum", type: "number", placeholder: "500" },
];

const DETAIL_FIELDS = [
  { key: "kodeProduk", label: "Kode Produk" },
  { key: "namaProduk", label: "Nama Produk" },
  { key: "kategori", label: "Kategori" },
  { key: "satuan", label: "Satuan" },
  { key: "hargaPerUnit", label: "Harga per Unit", format: (v) => `Rp${v.toLocaleString("id-ID")}` },
  { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
  { key: "stokSaatIni", label: "Stok Saat Ini", format: (v, item) => `${v.toLocaleString("id-ID")} ${item.satuan}` },
  { key: "supplier", label: "Supplier" },
];

const dummyData = [
  { id: 1, kodeProduk: "CPO-001", namaProduk: "Crude Palm Oil", kategori: "Minyak Sawit Mentah", satuan: "Ton", hargaPerUnit: 12000, stokSaatIni: 245.5, stokMinimum: 50, stokMaksimum: 500, status: "Tersedia", supplier: "PT. Sawit Jaya Abadi", deskripsi: "Minyak sawit mentah kualitas ekspor" },
  { id: 2, kodeProduk: "PKO-002", namaProduk: "Palm Kernel Oil", kategori: "Minyak Inti Sawit", satuan: "Ton", hargaPerUnit: 8500, stokSaatIni: 120.0, stokMinimum: 30, stokMaksimum: 300, status: "Tersedia", supplier: "PT. Sawit Jaya Abadi", deskripsi: "Minyak inti sawit untuk industri makanan" },
  { id: 3, kodeProduk: "CPO-003", namaProduk: "CPO Premium", kategori: "Minyak Sawit Mentah", satuan: "Ton", hargaPerUnit: 13500, stokSaatIni: 78.0, stokMinimum: 80, stokMaksimum: 400, status: "Menipis", supplier: "PT. Agro Palma Nusantara", deskripsi: "CPO premium dengan kadar asam lemak rendah" },
  { id: 4, kodeProduk: "PKO-004", namaProduk: "PKO Food Grade", kategori: "Minyak Inti Sawit", satuan: "Ton", hargaPerUnit: 9200, stokSaatIni: 0, stokMinimum: 20, stokMaksimum: 200, status: "Habis", supplier: "PT. Agro Palma Nusantara", deskripsi: "PKO food grade untuk industri makanan" },
  { id: 5, kodeProduk: "CPO-005", namaProduk: "CPO Ekspor", kategori: "Minyak Sawit Mentah", satuan: "Ton", hargaPerUnit: 14000, stokSaatIni: 620.0, stokMinimum: 100, stokMaksimum: 800, status: "Tersedia", supplier: "PT. Sawit Mandiri", deskripsi: "CPO kualitas ekspor ke Eropa" },
  { id: 6, kodeProduk: "PKO-006", namaProduk: "PKO Olein", kategori: "Minyak Inti Sawit", satuan: "Ton", hargaPerUnit: 7800, stokSaatIni: 180.0, stokMinimum: 40, stokMaksimum: 250, status: "Tersedia", supplier: "PT. Sawit Mandiri", deskripsi: "PKO olein untuk industri kosmetik" },
  { id: 7, kodeProduk: "CPO-007", namaProduk: "CPO Organik", kategori: "Minyak Sawit Mentah", satuan: "Ton", hargaPerUnit: 16000, stokSaatIni: 45.0, stokMinimum: 50, stokMaksimum: 200, status: "Menipis", supplier: "PT. Organik Sawit Lestari", deskripsi: "CPO organik bersertifikat" },
  { id: 8, kodeProduk: "PKO-008", namaProduk: "PKO Stearin", kategori: "Minyak Inti Sawit", satuan: "Ton", hargaPerUnit: 6500, stokSaatIni: 95.0, stokMinimum: 30, stokMaksimum: 150, status: "Tersedia", supplier: "PT. Organik Sawit Lestari", deskripsi: "PKO stearin untuk industri sabun" },
  { id: 9, kodeProduk: "CPO-009", namaProduk: "CPO Refined", kategori: "Minyak Sawit Olahan", satuan: "Ton", hargaPerUnit: 15500, stokSaatIni: 320.0, stokMinimum: 60, stokMaksimum: 600, status: "Tersedia", supplier: "PT. Sawit Refinery", deskripsi: "CPO refined untuk industri makanan" },
  { id: 10, kodeProduk: "PKO-010", namaProduk: "PKO Hydrogenated", kategori: "Minyak Inti Sawit", satuan: "Ton", hargaPerUnit: 11000, stokSaatIni: 0, stokMinimum: 25, stokMaksimum: 180, status: "Habis", supplier: "PT. Sawit Refinery", deskripsi: "PKO hydrogenated untuk industri margarin" },
];

const formatCurrency = (v) => new Intl.NumberFormat("id-ID").format(v);
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
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-20 bg-slate-700/50 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

function FormFieldInput({ field, defaultValue }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
        {field.label} {field.required && <span className="text-red-400">*</span>}
      </label>
      {field.type === "select" ? (
        <select defaultValue={defaultValue || ""} className={inputCls}>
          <option value="">Pilih {field.label}</option>
          {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={field.type || "text"} defaultValue={defaultValue || ""} placeholder={field.placeholder} className={inputCls} />
      )}
    </div>
  );
}

// ── Komponen Utama ──
export default function DataProduk() {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedProduk, setSelectedProduk] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formMode, setFormMode] = useState("tambah"); // tambah | edit | detail

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await new Promise((r) => setTimeout(r, 800));
        setProduk(dummyData);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredData = produk.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = [item.namaProduk, item.kodeProduk, item.kategori].some((v) => v.toLowerCase().includes(q));
    return matchesSearch && (filterStatus === "semua" || item.status === filterStatus);
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const currentItems = filteredData.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);

  const openModal = (mode, item = null) => {
    setFormMode(mode);
    setSelectedProduk(item);
    setShowModal(true);
  };

  const confirmDelete = () => {
    setProduk(produk.filter((p) => p.id !== selectedProduk.id));
    setShowDeleteModal(false);
    setSelectedProduk(null);
  };

  const getProgressColor = (stok, max) => {
    if (stok === 0) return "bg-red-500";
    const pct = (stok / max) * 100;
    return pct <= 20 ? "bg-red-500" : pct <= 50 ? "bg-yellow-500" : "bg-green-500";
  };

  const stats = [
    { label: "Total Produk", value: produk.length, icon: Package, color: "text-blue-400", bg: "bg-blue-500/10" },
    ...Object.keys(STATUS_CONFIG).map((s) => ({
      label: s, value: produk.filter((p) => p.status === s).length,
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
          <button onClick={() => window.location.reload()} title="Refresh"
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all">
            <RefreshCw size={18} />
          </button>
          <button onClick={() => openModal("tambah")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-slate-900 font-semibold text-sm transition-all shadow-lg shadow-green-500/20">
            <Plus size={18} /> Tambah Produk
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Cari produk berdasarkan nama, kode, atau kategori..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-all" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {["semua", ...Object.keys(STATUS_CONFIG)].map((status) => (
            <button key={status} onClick={() => setFilterStatus(status)}
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
                {["Produk", "Kategori", "Stok", "Harga", "Status", "Supplier"].map((h) => (
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
                  <td colSpan="7" className="px-4 py-12 text-center">
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
                  {currentItems.map((item, index) => (
                    <motion.tr key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center border border-green-500/20">
                            <Tag size={16} className="text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-100">{item.namaProduk}</p>
                            <p className="text-xs text-slate-500">{item.kodeProduk}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">{item.kategori}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-100">
                          {item.stokSaatIni.toLocaleString("id-ID")}{" "}
                          <span className="text-xs text-slate-500 font-normal">{item.satuan}</span>
                        </p>
                        <div className="w-full h-1.5 bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${getProgressColor(item.stokSaatIni, item.stokMaksimum)}`}
                            style={{ width: `${Math.min((item.stokSaatIni / item.stokMaksimum) * 100, 100)}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                          <span>Min: {item.stokMinimum}</span>
                          <span>Max: {item.stokMaksimum}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-100">Rp{formatCurrency(item.hargaPerUnit)}</p>
                        <p className="text-xs text-slate-500">/ {item.satuan}</p>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3 text-sm text-slate-300 truncate max-w-[120px]">{item.supplier}</td>
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
                  ))}
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
                    {DETAIL_FIELDS.map((f) => (
                      <div key={f.key} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">{f.label}</p>
                        <div className="text-sm font-semibold text-slate-100 mt-1">
                          {f.render ? f.render(selectedProduk[f.key]) : f.format ? f.format(selectedProduk[f.key], selectedProduk) : selectedProduk[f.key]}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Deskripsi</p>
                    <p className="text-sm text-slate-300 mt-1">{selectedProduk.deskripsi}</p>
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-700/50">
                    <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all">Tutup</button>
                    <button onClick={() => setFormMode("edit")} className="px-4 py-2 rounded-xl bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/30 transition-all">Edit Produk</button>
                  </div>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {FORM_FIELDS.map((f) => (
                      <FormFieldInput key={f.key} field={f} defaultValue={selectedProduk?.[f.key]} />
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Deskripsi</label>
                    <textarea defaultValue={selectedProduk?.deskripsi || ""} rows="3" placeholder="Deskripsi produk..."
                      className={`${inputCls} resize-none`} />
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-700/50">
                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all">Batal</button>
                    <button type="submit" className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-slate-900 font-semibold transition-all">
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