import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck, Package, CheckCircle2, Clock, Search, Filter,
  MapPin, Calendar, Hash, Eye, ChevronRight, Inbox,
  ArrowUpRight, CircleDot, ClipboardCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


const DUMMY_DATA = [
  {
    id: 1,
    noSuratJalan: "SJ-2025-0041",
    produk: "CPO (Crude Palm Oil)",
    jumlah: 12500,
    satuan: "kg",
    tujuan: "CV Maju Jaya",
    alamatTujuan: "Jl. Industri No. 12, Bandung",
    tanggalBerangkat: "2025-07-10",
    tanggalEstimasi: "2025-07-11",
    status: "selesai",
    catatan: "Pengiriman selesai tepat waktu.",
  },
  {
    id: 2,
    noSuratJalan: "SJ-2025-0048",
    produk: "Kernel Palm Oil",
    jumlah: 8200,
    satuan: "kg",
    tujuan: "PT Nusantara Sawit",
    alamatTujuan: "Jl. Raya Cikaret No. 5, Bogor",
    tanggalBerangkat: "2025-07-14",
    tanggalEstimasi: "2025-07-15",
    status: "dalam_perjalanan",
    catatan: "",
  },
  {
    id: 3,
    noSuratJalan: "SJ-2025-0052",
    produk: "CPO (Crude Palm Oil)",
    jumlah: 15000,
    satuan: "kg",
    tujuan: "UD Sumber Makmur",
    alamatTujuan: "Jl. Pahlawan No. 88, Bekasi",
    tanggalBerangkat: "2025-07-16",
    tanggalEstimasi: "2025-07-17",
    status: "pending",
    catatan: "",
  },
  {
    id: 4,
    noSuratJalan: "SJ-2025-0039",
    produk: "Palm Kernel Shell",
    jumlah: 5400,
    satuan: "kg",
    tujuan: "CV Harapan Baru",
    alamatTujuan: "Jl. Kertajaya No. 21, Surabaya",
    tanggalBerangkat: "2025-07-08",
    tanggalEstimasi: "2025-07-09",
    status: "selesai",
    catatan: "Penerima tidak ada, dititipkan ke gudang.",
  },
  {
    id: 5,
    noSuratJalan: "SJ-2025-0055",
    produk: "CPO (Crude Palm Oil)",
    jumlah: 9800,
    satuan: "kg",
    tujuan: "PT Kelapa Mas",
    alamatTujuan: "Jl. Gatot Subroto No. 3, Jakarta",
    tanggalBerangkat: "2025-07-18",
    tanggalEstimasi: "2025-07-19",
    status: "pending",
    catatan: "",
  },
];

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending: {
    label: "Menunggu",
    icon: Clock,
    pill: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    dot: "bg-amber-400",
  },
  dalam_perjalanan: {
    label: "Dalam Perjalanan",
    icon: Truck,
    pill: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    dot: "bg-blue-400",
    pulse: true,
  },
  selesai: {
    label: "Selesai",
    icon: CheckCircle2,
    pill: "bg-green-500/10 text-green-400 border border-green-500/20",
    dot: "bg-green-400",
  },
};

const FILTER_TABS = [
  { key: "semua",           label: "Semua"           },
  { key: "pending",         label: "Menunggu"        },
  { key: "dalam_perjalanan",label: "Dalam Perjalanan"},
  { key: "selesai",         label: "Selesai"         },
];

const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });

// ── Badge status ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.pill}`}>
      {cfg.pulse ? (
        <span className="relative flex w-2 h-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
          <span className={`relative inline-flex rounded-full w-2 h-2 ${cfg.dot}`} />
        </span>
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      )}
      {cfg.label}
    </span>
  );
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, accent, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    className="bg-[#1a2440] border border-[#26314a] rounded-2xl px-5 py-4 flex items-center gap-4"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-2xl font-bold text-white leading-none">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  </motion.div>
);

// ── Card distribusi ───────────────────────────────────────────────────────────
const DistribusiCard = ({ item, index, onLihatSuratJalan, onKonfirmasi }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[#1a2440] border border-[#26314a] rounded-2xl overflow-hidden hover:border-slate-600 transition-colors"
    >
      {/* Row utama */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">

          {/* Kiri: info utama */}
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#121b33] border border-[#26314a] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Truck size={17} className="text-[#22c55e]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-mono text-slate-400 bg-[#121b33] px-2 py-0.5 rounded-md border border-[#26314a]">
                  {item.noSuratJalan}
                </span>
                <StatusBadge status={item.status} />
              </div>
              <p className="text-white font-semibold text-sm">{item.tujuan}</p>
              <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                <MapPin size={11} /> {item.alamatTujuan}
              </p>
            </div>
          </div>

          {/* Kanan: jumlah + toggle */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right">
              <p className="text-white font-bold text-base">{fmt(item.jumlah)}</p>
              <p className="text-slate-400 text-xs">{item.satuan}</p>
            </div>
            <motion.button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={16} />
            </motion.button>
          </div>
        </div>

        {/* Tanggal & produk — selalu tampil */}
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Package size={12} className="text-slate-500" />
            {item.produk}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar size={12} className="text-slate-500" />
            Berangkat {fmtDate(item.tanggalBerangkat)}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <CircleDot size={12} className="text-slate-500" />
            Estimasi tiba {fmtDate(item.tanggalEstimasi)}
          </span>
        </div>
      </div>

      {/* Detail expand */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#26314a] px-4 sm:px-5 py-4 bg-[#121b33]/50">

              {/* Catatan */}
              {item.catatan ? (
                <div className="mb-4 flex gap-2 text-xs text-slate-400 bg-amber-500/5 border border-amber-500/15 rounded-xl p-3">
                  <span className="text-amber-400 shrink-0">📝</span>
                  <span>{item.catatan}</span>
                </div>
              ) : (
                <div className="mb-4 flex gap-2 text-xs text-slate-500 bg-[#1a2440] border border-[#26314a] rounded-xl p-3">
                  <span className="shrink-0">📋</span>
                  <span>Tidak ada catatan tambahan.</span>
                </div>
              )}

              {/* Tombol aksi */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => onLihatSuratJalan(item)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1a2440] border border-[#26314a] text-slate-300 hover:text-white hover:border-slate-500 transition-all"
                >
                  <Eye size={13} />
                  Lihat Surat Jalan
                  <ArrowUpRight size={12} className="text-slate-500" />
                </button>

                {item.status === "dalam_perjalanan" && (
                  <button
                    onClick={() => onKonfirmasi(item)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#22c55e] text-[#0c1325] hover:bg-[#16a34a] transition-all"
                  >
                    <ClipboardCheck size={13} />
                    Konfirmasi Selesai
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Halaman utama ─────────────────────────────────────────────────────────────
const DataDistribusi = () => {
  const navigate = useNavigate();
  const [search, setSearch]     = useState("");
  const [filterTab, setFilterTab] = useState("semua");

  // Statistik
  const stats = useMemo(() => ({
    total:          DUMMY_DATA.length,
    pending:        DUMMY_DATA.filter((d) => d.status === "pending").length,
    dalamPerjalanan:DUMMY_DATA.filter((d) => d.status === "dalam_perjalanan").length,
    selesai:        DUMMY_DATA.filter((d) => d.status === "selesai").length,
  }), []);

  // Filter + search
  const filtered = useMemo(() => {
    return DUMMY_DATA.filter((d) => {
      const matchTab    = filterTab === "semua" || d.status === filterTab;
      const q           = search.toLowerCase();
      const matchSearch = !q ||
        d.noSuratJalan.toLowerCase().includes(q) ||
        d.tujuan.toLowerCase().includes(q) ||
        d.produk.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [search, filterTab]);

  const handleLihatSuratJalan = (item) => {
    navigate(`/supir/surat-jalan?id=${item.id}`);
  };

  const handleKonfirmasi = (item) => {
    navigate(`/supir/konfirmasi?id=${item.id}`);
  };

  return (
    <div className="min-h-full p-6 sm:p-8">

      {/* ── Header halaman ── */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Data Distribusi
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Daftar pengiriman yang ditugaskan kepada Anda
        </p>
      </motion.div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={Truck}
          label="Total Tugas"
          value={stats.total}
          accent="bg-slate-700/60 text-slate-300"
          delay={0}
        />
        <StatCard
          icon={Clock}
          label="Menunggu"
          value={stats.pending}
          accent="bg-amber-500/10 text-amber-400"
          delay={0.05}
        />
        <StatCard
          icon={ArrowUpRight}
          label="Dalam Perjalanan"
          value={stats.dalamPerjalanan}
          accent="bg-blue-500/10 text-blue-400"
          delay={0.1}
        />
        <StatCard
          icon={CheckCircle2}
          label="Selesai"
          value={stats.selesai}
          accent="bg-green-500/10 text-[#22c55e]"
          delay={0.15}
        />
      </div>

      {/* ── Toolbar: search + filter tabs ── */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3 mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari no. surat jalan, tujuan, produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-[#1a2440] border border-[#26314a] text-white placeholder-slate-500 outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 transition-all"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-[#1a2440] border border-[#26314a] rounded-xl p-1 overflow-x-auto">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterTab === tab.key
                  ? "bg-[#22c55e] text-[#0c1325]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── List distribusi ── */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-slate-500 bg-[#1a2440] border border-[#26314a] rounded-2xl"
            >
              <Inbox size={36} strokeWidth={1.4} className="mb-3" />
              <p className="text-sm font-medium text-slate-400">Tidak ada data distribusi</p>
              <p className="text-xs mt-1">
                {search ? "Coba ubah kata pencarian." : "Belum ada pengiriman yang ditugaskan."}
              </p>
            </motion.div>
          ) : (
            filtered.map((item, i) => (
              <DistribusiCard
                key={item.id}
                item={item}
                index={i}
                onLihatSuratJalan={handleLihatSuratJalan}
                onKonfirmasi={handleKonfirmasi}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer count */}
      {filtered.length > 0 && (
        <p className="text-center text-xs text-slate-500 mt-6">
          Menampilkan {filtered.length} dari {DUMMY_DATA.length} pengiriman
        </p>
      )}
    </div>
  );
};

export default DataDistribusi;