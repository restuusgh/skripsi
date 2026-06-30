// src/components/pages/DataProduk.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Tag,
  Box,
  AlertTriangle,
  Download,
  Printer,
} from "lucide-react";

// ── Komponen Badge Status ──
function StatusBadge({ status }) {
  const config = {
    Tersedia: { 
      bg: "bg-green-500/10", 
      text: "text-green-500", 
      border: "border-green-500/30",
      icon: CheckCircle,
      label: "Tersedia"
    },
    Menipis: { 
      bg: "bg-yellow-500/10", 
      text: "text-yellow-500", 
      border: "border-yellow-500/30",
      icon: Clock,
      label: "Menipis"
    },
    Habis: { 
      bg: "bg-red-500/10", 
      text: "text-red-500", 
      border: "border-red-500/30",
      icon: XCircle,
      label: "Habis"
    },
  };
  
  const { bg, text, border, icon: Icon, label } = config[status] || config.Tersedia;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bg} ${text} ${border}`}>
      <Icon size={12} />
      {label}
    </span>
  );
}

// ── Komponen Skeleton Loading ──
function SkeletonRow() {
  return (
    <tr className="border-b border-slate-700/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-700/50 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-28 bg-slate-700/50 rounded animate-pulse" />
            <div className="h-3 w-16 bg-slate-700/50 rounded animate-pulse" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3"><div className="h-4 w-20 bg-slate-700/50 rounded animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-4 w-16 bg-slate-700/50 rounded animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-4 w-20 bg-slate-700/50 rounded animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-6 w-20 bg-slate-700/50 rounded-full animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-700/50 rounded animate-pulse" /></td>
      <td className="px-4 py-3">
        <div className="flex gap-1 justify-end">
          <div className="h-8 w-8 bg-slate-700/50 rounded animate-pulse" />
          <div className="h-8 w-8 bg-slate-700/50 rounded animate-pulse" />
          <div className="h-8 w-8 bg-slate-700/50 rounded animate-pulse" />
        </div>
      </td>
    </tr>
  );
}

// ── Komponen Utama ──
export default function DataProduk() {
  // State
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [selectedProduk, setSelectedProduk] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formMode, setFormMode] = useState("tambah"); // tambah | edit | detail

  // Data dummy (nanti diganti dengan fetch dari API)
  const dummyData = [
    {
      id: 1,
      kodeProduk: "CPO-001",
      namaProduk: "Crude Palm Oil",
      kategori: "Minyak Sawit Mentah",
      satuan: "Ton",
      hargaPerUnit: 12000,
      stokSaatIni: 245.5,
      stokMinimum: 50,
      stokMaksimum: 500,
      status: "Tersedia",
      tanggalMasuk: "2026-06-28",
      supplier: "PT. Sawit Jaya Abadi",
      deskripsi: "Minyak sawit mentah kualitas ekspor",
      createdAt: "2026-06-28T10:30:00",
      updatedAt: "2026-06-30T14:20:00",
    },
    {
      id: 2,
      kodeProduk: "PKO-002",
      namaProduk: "Palm Kernel Oil",
      kategori: "Minyak Inti Sawit",
      satuan: "Ton",
      hargaPerUnit: 8500,
      stokSaatIni: 120.0,
      stokMinimum: 30,
      stokMaksimum: 300,
      status: "Tersedia",
      tanggalMasuk: "2026-06-25",
      supplier: "PT. Sawit Jaya Abadi",
      deskripsi: "Minyak inti sawit untuk industri makanan",
      createdAt: "2026-06-25T09:15:00",
      updatedAt: "2026-06-29T16:45:00",
    },
    {
      id: 3,
      kodeProduk: "CPO-003",
      namaProduk: "CPO Premium",
      kategori: "Minyak Sawit Mentah",
      satuan: "Ton",
      hargaPerUnit: 13500,
      stokSaatIni: 78.0,
      stokMinimum: 80,
      stokMaksimum: 400,
      status: "Menipis",
      tanggalMasuk: "2026-06-20",
      supplier: "PT. Agro Palma Nusantara",
      deskripsi: "CPO premium dengan kadar asam lemak rendah",
      createdAt: "2026-06-20T11:00:00",
      updatedAt: "2026-06-28T08:30:00",
    },
    {
      id: 4,
      kodeProduk: "PKO-004",
      namaProduk: "PKO Food Grade",
      kategori: "Minyak Inti Sawit",
      satuan: "Ton",
      hargaPerUnit: 9200,
      stokSaatIni: 0,
      stokMinimum: 20,
      stokMaksimum: 200,
      status: "Habis",
      tanggalMasuk: "2026-06-15",
      supplier: "PT. Agro Palma Nusantara",
      deskripsi: "PKO food grade untuk industri makanan",
      createdAt: "2026-06-15T13:45:00",
      updatedAt: "2026-06-27T10:00:00",
    },
    {
      id: 5,
      kodeProduk: "CPO-005",
      namaProduk: "CPO Ekspor",
      kategori: "Minyak Sawit Mentah",
      satuan: "Ton",
      hargaPerUnit: 14000,
      stokSaatIni: 620.0,
      stokMinimum: 100,
      stokMaksimum: 800,
      status: "Tersedia",
      tanggalMasuk: "2026-06-10",
      supplier: "PT. Sawit Mandiri",
      deskripsi: "CPO kualitas ekspor ke Eropa",
      createdAt: "2026-06-10T08:00:00",
      updatedAt: "2026-06-30T09:00:00",
    },
    {
      id: 6,
      kodeProduk: "PKO-006",
      namaProduk: "PKO Olein",
      kategori: "Minyak Inti Sawit",
      satuan: "Ton",
      hargaPerUnit: 7800,
      stokSaatIni: 180.0,
      stokMinimum: 40,
      stokMaksimum: 250,
      status: "Tersedia",
      tanggalMasuk: "2026-06-05",
      supplier: "PT. Sawit Mandiri",
      deskripsi: "PKO olein untuk industri kosmetik",
      createdAt: "2026-06-05T14:30:00",
      updatedAt: "2026-06-29T11:15:00",
    },
    {
      id: 7,
      kodeProduk: "CPO-007",
      namaProduk: "CPO Organik",
      kategori: "Minyak Sawit Mentah",
      satuan: "Ton",
      hargaPerUnit: 16000,
      stokSaatIni: 45.0,
      stokMinimum: 50,
      stokMaksimum: 200,
      status: "Menipis",
      tanggalMasuk: "2026-05-28",
      supplier: "PT. Organik Sawit Lestari",
      deskripsi: "CPO organik bersertifikat",
      createdAt: "2026-05-28T10:15:00",
      updatedAt: "2026-06-28T13:40:00",
    },
    {
      id: 8,
      kodeProduk: "PKO-008",
      namaProduk: "PKO Stearin",
      kategori: "Minyak Inti Sawit",
      satuan: "Ton",
      hargaPerUnit: 6500,
      stokSaatIni: 95.0,
      stokMinimum: 30,
      stokMaksimum: 150,
      status: "Tersedia",
      tanggalMasuk: "2026-05-20",
      supplier: "PT. Organik Sawit Lestari",
      deskripsi: "PKO stearin untuk industri sabun",
      createdAt: "2026-05-20T09:30:00",
      updatedAt: "2026-06-27T15:00:00",
    },
    {
      id: 9,
      kodeProduk: "CPO-009",
      namaProduk: "CPO Refined",
      kategori: "Minyak Sawit Olahan",
      satuan: "Ton",
      hargaPerUnit: 15500,
      stokSaatIni: 320.0,
      stokMinimum: 60,
      stokMaksimum: 600,
      status: "Tersedia",
      tanggalMasuk: "2026-06-18",
      supplier: "PT. Sawit Refinery",
      deskripsi: "CPO refined untuk industri makanan",
      createdAt: "2026-06-18T07:30:00",
      updatedAt: "2026-06-30T10:00:00",
    },
    {
      id: 10,
      kodeProduk: "PKO-010",
      namaProduk: "PKO Hydrogenated",
      kategori: "Minyak Inti Sawit",
      satuan: "Ton",
      hargaPerUnit: 11000,
      stokSaatIni: 0,
      stokMinimum: 25,
      stokMaksimum: 180,
      status: "Habis",
      tanggalMasuk: "2026-06-01",
      supplier: "PT. Sawit Refinery",
      deskripsi: "PKO hydrogenated untuk industri margarin",
      createdAt: "2026-06-01T12:00:00",
      updatedAt: "2026-06-26T16:20:00",
    },
  ];

  // Simulasi fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setProduk(dummyData);
      } catch (error) {
        console.error("Gagal memuat data produk:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtering
  const filteredData = produk.filter((item) => {
    const matchesSearch =
      item.namaProduk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kodeProduk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kategori.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "semua" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Handle actions
  const handleTambah = () => {
    setFormMode("tambah");
    setSelectedProduk(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setFormMode("edit");
    setSelectedProduk(item);
    setShowModal(true);
  };

  const handleDetail = (item) => {
    setFormMode("detail");
    setSelectedProduk(item);
    setShowModal(true);
  };

  const handleDelete = (item) => {
    setSelectedProduk(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setProduk(produk.filter((item) => item.id !== selectedProduk.id));
    setShowDeleteModal(false);
    setSelectedProduk(null);
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID").format(value);
  };

  // Render progress bar color
  const getProgressColor = (stok, min, max) => {
    const persentase = (stok / max) * 100;
    if (stok === 0) return "bg-red-500";
    if (persentase <= 20) return "bg-red-500";
    if (persentase <= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  // ── Render ──
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/30">
            <Package size={24} className="text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Data Produk
            </h1>
            <p className="text-sm text-slate-400">
              Kelola data produk kelapa sawit
              {!loading && (
                <span className="ml-2 text-green-400">
                  · {filteredData.length} produk ditemukan
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={handleTambah}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-slate-900 font-semibold text-sm transition-all shadow-lg shadow-green-500/20"
          >
            <Plus size={18} />
            Tambah Produk
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari produk berdasarkan nama, kode, atau kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {["semua", "Tersedia", "Menipis", "Habis"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filterStatus === status
                  ? "bg-green-500/20 text-green-500 border border-green-500/30"
                  : "bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600"
              }`}
            >
              {status === "semua" ? "Semua" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-900/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Produk
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Aksi
                </th>
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
                      <button
                        onClick={handleTambah}
                        className="text-green-500 hover:text-green-400 text-sm font-semibold"
                      >
                        + Tambah produk baru
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {currentItems.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center border border-green-500/20">
                            <Tag size={16} className="text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-100">
                              {item.namaProduk}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.kodeProduk}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-300">
                          {item.kategori}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-100">
                            {item.stokSaatIni.toLocaleString("id-ID")}{" "}
                            <span className="text-xs text-slate-500 font-normal">
                              {item.satuan}
                            </span>
                          </p>
                          <div className="w-full h-1.5 bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${getProgressColor(
                                item.stokSaatIni,
                                item.stokMinimum,
                                item.stokMaksimum
                              )}`}
                              style={{
                                width: `${Math.min(
                                  (item.stokSaatIni / item.stokMaksimum) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                            <span>Min: {item.stokMinimum}</span>
                            <span>Max: {item.stokMaksimum}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-100">
                          Rp{formatCurrency(item.hargaPerUnit)}
                        </p>
                        <p className="text-xs text-slate-500">/ {item.satuan}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-slate-300 truncate max-w-[120px]">
                          {item.supplier}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDetail(item)}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                            title="Lihat detail"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50 bg-slate-900/30">
            <p className="text-sm text-slate-400">
              Menampilkan {indexOfFirstItem + 1} -{" "}
              {Math.min(indexOfLastItem, filteredData.length)} dari{" "}
              {filteredData.length} produk
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-600 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      currentPage === page
                        ? "bg-green-500 text-slate-900"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-600 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Statistik Ringkas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          {
            label: "Total Produk",
            value: produk.length,
            icon: Package,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            label: "Tersedia",
            value: produk.filter((p) => p.status === "Tersedia").length,
            icon: CheckCircle,
            color: "text-green-400",
            bg: "bg-green-500/10",
          },
          {
            label: "Menipis",
            value: produk.filter((p) => p.status === "Menipis").length,
            icon: Clock,
            color: "text-yellow-400",
            bg: "bg-yellow-500/10",
          },
          {
            label: "Habis",
            value: produk.filter((p) => p.status === "Habis").length,
            icon: XCircle,
            color: "text-red-400",
            bg: "bg-red-500/10",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 flex items-center gap-4 hover:border-slate-600 transition-all"
          >
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── MODAL: Detail / Tambah / Edit ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    formMode === "detail" 
                      ? "bg-blue-500/10 border-blue-500/30" 
                      : formMode === "edit" 
                      ? "bg-yellow-500/10 border-yellow-500/30" 
                      : "bg-green-500/10 border-green-500/30"
                  }`}>
                    {formMode === "detail" ? (
                      <Eye size={18} className="text-blue-500" />
                    ) : formMode === "edit" ? (
                      <Edit size={18} className="text-yellow-500" />
                    ) : (
                      <Plus size={18} className="text-green-500" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-100">
                      {formMode === "detail"
                        ? "Detail Produk"
                        : formMode === "edit"
                        ? "Edit Produk"
                        : "Tambah Produk"}
                    </h2>
                    <p className="text-sm text-slate-400">
                      {formMode === "detail"
                        ? "Informasi lengkap produk"
                        : formMode === "edit"
                        ? "Perbarui data produk"
                        : "Tambahkan produk baru ke sistem"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-all"
                >
                  ✕
                </button>
              </div>

              {formMode === "detail" && selectedProduk ? (
                // ── MODE DETAIL ──
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Kode Produk</p>
                      <p className="text-sm font-semibold text-slate-100 mt-1">{selectedProduk.kodeProduk}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Nama Produk</p>
                      <p className="text-sm font-semibold text-slate-100 mt-1">{selectedProduk.namaProduk}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Kategori</p>
                      <p className="text-sm font-semibold text-slate-100 mt-1">{selectedProduk.kategori}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Satuan</p>
                      <p className="text-sm font-semibold text-slate-100 mt-1">{selectedProduk.satuan}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Harga per Unit</p>
                      <p className="text-sm font-semibold text-slate-100 mt-1">Rp{formatCurrency(selectedProduk.hargaPerUnit)}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Status</p>
                      <div className="mt-1"><StatusBadge status={selectedProduk.status} /></div>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Stok Saat Ini</p>
                      <p className="text-sm font-semibold text-slate-100 mt-1">
                        {selectedProduk.stokSaatIni.toLocaleString("id-ID")} {selectedProduk.satuan}
                      </p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Supplier</p>
                      <p className="text-sm font-semibold text-slate-100 mt-1">{selectedProduk.supplier}</p>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Deskripsi</p>
                    <p className="text-sm text-slate-300 mt-1">{selectedProduk.deskripsi}</p>
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-700/50">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all"
                    >
                      Tutup
                    </button>
                    <button
                      onClick={() => {
                        setFormMode("edit");
                      }}
                      className="px-4 py-2 rounded-xl bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/30 transition-all"
                    >
                      Edit Produk
                    </button>
                  </div>
                </div>
              ) : (
                // ── MODE TAMBAH / EDIT ──
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        Kode Produk <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedProduk?.kodeProduk || ""}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-100 focus:outline-none focus:border-green-500/50 transition-all"
                        placeholder="CPO-001"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        Nama Produk <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedProduk?.namaProduk || ""}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-100 focus:outline-none focus:border-green-500/50 transition-all"
                        placeholder="Crude Palm Oil"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        Kategori <span className="text-red-400">*</span>
                      </label>
                      <select
                        defaultValue={selectedProduk?.kategori || ""}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-100 focus:outline-none focus:border-green-500/50 transition-all"
                      >
                        <option value="">Pilih Kategori</option>
                        <option value="Minyak Sawit Mentah">Minyak Sawit Mentah</option>
                        <option value="Minyak Inti Sawit">Minyak Inti Sawit</option>
                        <option value="Minyak Sawit Olahan">Minyak Sawit Olahan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        Satuan <span className="text-red-400">*</span>
                      </label>
                      <select
                        defaultValue={selectedProduk?.satuan || ""}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-100 focus:outline-none focus:border-green-500/50 transition-all"
                      >
                        <option value="Ton">Ton</option>
                        <option value="Kg">Kg</option>
                        <option value="Liter">Liter</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        Harga per Unit (Rp) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedProduk?.hargaPerUnit || ""}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-100 focus:outline-none focus:border-green-500/50 transition-all"
                        placeholder="12000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        Supplier <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedProduk?.supplier || ""}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-100 focus:outline-none focus:border-green-500/50 transition-all"
                        placeholder="PT. Sawit Jaya Abadi"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        Stok Minimum
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedProduk?.stokMinimum || ""}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-100 focus:outline-none focus:border-green-500/50 transition-all"
                        placeholder="50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        Stok Maksimum
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedProduk?.stokMaksimum || ""}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-100 focus:outline-none focus:border-green-500/50 transition-all"
                        placeholder="500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Deskripsi
                    </label>
                    <textarea
                      defaultValue={selectedProduk?.deskripsi || ""}
                      rows="3"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-100 focus:outline-none focus:border-green-500/50 transition-all resize-none"
                      placeholder="Deskripsi produk..."
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-700/50">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-slate-900 font-semibold transition-all"
                    >
                      {formMode === "edit" ? "Simpan Perubahan" : "Tambah Produk"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL: Konfirmasi Hapus ── */}
      <AnimatePresence>
        {showDeleteModal && selectedProduk && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
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
                Apakah Anda yakin ingin menghapus produk{" "}
                <strong className="text-slate-100">{selectedProduk.namaProduk}</strong>?
                Data yang dihapus tidak dapat dikembalikan.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-slate-900 font-semibold transition-all"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}