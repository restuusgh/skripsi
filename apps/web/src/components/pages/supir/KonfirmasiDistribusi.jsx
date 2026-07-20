import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck, Package, MapPin, Calendar, CheckCircle2, ArrowLeft,
  User, ClipboardCheck, ImagePlus, X, AlertTriangle,
  ChevronRight, CircleCheck, Loader2, FileText,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";


const DUMMY_DATA = {
  1:  { id: 1,  noSuratJalan: "SJ-2025-0041", produk: "CPO (Crude Palm Oil)",   jumlah: 12500, satuan: "kg", tujuan: "CV Maju Jaya",        alamatTujuan: "Jl. Industri No. 12, Bandung",      tanggalBerangkat: "2025-07-10", tanggalEstimasi: "2025-07-11" },
  2:  { id: 2,  noSuratJalan: "SJ-2025-0048", produk: "Kernel Palm Oil",         jumlah: 8200,  satuan: "kg", tujuan: "PT Nusantara Sawit",   alamatTujuan: "Jl. Raya Cikaret No. 5, Bogor",    tanggalBerangkat: "2025-07-14", tanggalEstimasi: "2025-07-15" },
  5:  { id: 5,  noSuratJalan: "SJ-2025-0055", produk: "CPO (Crude Palm Oil)",   jumlah: 9800,  satuan: "kg", tujuan: "PT Kelapa Mas",         alamatTujuan: "Jl. Gatot Subroto No. 3, Jakarta", tanggalBerangkat: "2025-07-18", tanggalEstimasi: "2025-07-19" },
};

const fmt     = (n)   => new Intl.NumberFormat("id-ID").format(n);
const fmtDate = (iso) => new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
const today   = ()    => new Date().toISOString().slice(0, 10);

// ── Timeline langkah pengiriman ───────────────────────────────────────────────
const STEPS = [
  { key: "berangkat",   label: "Berangkat",          icon: Truck      },
  { key: "perjalanan",  label: "Dalam Perjalanan",   icon: MapPin     },
  { key: "konfirmasi",  label: "Konfirmasi Tiba",    icon: ClipboardCheck },
  { key: "selesai",     label: "Pengiriman Selesai", icon: CircleCheck },
];

// Semua step punya lebar tetap (w-[72px]) supaya garis penghubung selalu
// sejajar dengan titik tengah lingkaran, apapun panjang teks labelnya
// (sebelumnya label 1 baris vs 2 baris bikin garis jadi tidak rata).
const Timeline = () => (
  <div className="flex items-start mb-8">
    {STEPS.map((step, i) => {
      const active  = i <= 2; // step 0–2 sudah aktif saat di halaman ini
      const current = i === 2;
      const Icon    = step.icon;
      return (
        <div key={step.key} className={`flex items-start ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
          <div className="flex flex-col items-center gap-1.5 w-[72px] shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              current
                ? "bg-[#22c55e] text-[#0c1325] ring-4 ring-[#22c55e]/20"
                : active
                  ? "bg-[#22c55e]/20 text-[#22c55e]"
                  : "bg-[#1a2440] text-slate-600 border border-[#26314a]"
            }`}>
              <Icon size={14} />
            </div>
            <span className={`text-[10px] font-semibold text-center leading-tight ${
              current ? "text-[#22c55e]" : active ? "text-slate-300" : "text-slate-600"
            }`}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mt-4 mx-1 rounded-full transition-all ${
              i < 2 ? "bg-[#22c55e]/40" : "bg-[#26314a]"
            }`} />
          )}
        </div>
      );
    })}
  </div>
);

// ── Modal konfirmasi sebelum submit ──────────────────────────────────────────
const ConfirmModal = ({ distribusi, onConfirm, onCancel, loading }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
    <motion.div
      className="relative bg-[#1a2440] border border-[#26314a] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      initial={{ scale: 0.92, y: 20, opacity: 0 }}
      animate={{ scale: 1,    y: 0,  opacity: 1 }}
      exit={{   scale: 0.92, y: 20, opacity: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
    >
      <button onClick={onCancel} className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded-lg hover:bg-white/5">
        <X size={16} />
      </button>

      <div className="w-12 h-12 rounded-2xl bg-[#22c55e]/10 flex items-center justify-center mb-4">
        <ClipboardCheck size={22} className="text-[#22c55e]" />
      </div>

      <h3 className="text-white font-bold text-base mb-1">Konfirmasi Pengiriman Selesai</h3>
      <p className="text-slate-400 text-sm mb-4">
        Pastikan barang sudah diterima oleh pihak <strong className="text-slate-200">{distribusi?.tujuan}</strong> sebelum melanjutkan.
      </p>

      <div className="bg-[#121b33] border border-[#26314a] rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
        <FileText size={15} className="text-slate-400 shrink-0" />
        <div>
          <p className="text-xs text-slate-500 mb-0.5">No. Surat Jalan</p>
          <p className="text-sm text-white font-semibold font-mono">{distribusi?.noSuratJalan}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 bg-[#121b33] border border-[#26314a] hover:border-slate-500 transition-all"
        >
          Batal
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-[#0c1325] bg-[#22c55e] hover:bg-[#16a34a] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading
            ? <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}><Loader2 size={15} /></motion.span> Memproses...</>
            : <><CheckCircle2 size={15} /> Ya, Konfirmasi</>
          }
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ── State sukses ──────────────────────────────────────────────────────────────
const SuccessState = ({ distribusi, onBack }) => (
  <motion.div
    className="flex flex-col items-center justify-center py-16 px-8 text-center"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 260, damping: 22 }}
  >
    <motion.div
      className="w-20 h-20 rounded-full bg-[#22c55e]/10 flex items-center justify-center mb-6 ring-8 ring-[#22c55e]/10"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 }}
    >
      <CheckCircle2 size={38} className="text-[#22c55e]" />
    </motion.div>

    <h2 className="text-white text-2xl font-bold mb-2">Pengiriman Dikonfirmasi!</h2>
    <p className="text-slate-400 text-sm max-w-xs mb-6">
      Pengiriman <span className="text-white font-semibold">{distribusi?.noSuratJalan}</span> ke{" "}
      <span className="text-white font-semibold">{distribusi?.tujuan}</span> telah berhasil dikonfirmasi selesai.
    </p>

    <div className="bg-[#1a2440] border border-[#22c55e]/20 rounded-2xl px-6 py-4 mb-8 w-full max-w-xs">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-400">Status</span>
        <span className="text-[#22c55e] font-semibold">Selesai ✓</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">Produk</span>
        <span className="text-white font-medium">{distribusi?.produk}</span>
      </div>
    </div>

    <button
      onClick={onBack}
      className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-[#22c55e] text-[#0c1325] hover:bg-[#16a34a] transition-all"
    >
      <ArrowLeft size={15} />
      Kembali ke Daftar Distribusi
    </button>
  </motion.div>
);

// ── Halaman utama ─────────────────────────────────────────────────────────────
const KonfirmasiDistribusi = () => {
  const navigate        = useNavigate();
  const [params]        = useSearchParams();
  const id              = Number(params.get("id")) || 2;
  const distribusi      = DUMMY_DATA[id] ?? DUMMY_DATA[2];

  // Form state
  const [form, setForm] = useState({
    tanggalTiba:  today(),
    namaPenerima: "",
    kondisi:      "baik",     // "baik" | "rusak"
    catatan:      "",
  });
  const [foto,         setFoto]         = useState(null);       // preview URL
  const [fotoFile,     setFotoFile]     = useState(null);
  const [showModal,    setShowModal]    = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [errors,       setErrors]       = useState({});
  const fileRef = useRef(null);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleFoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setFoto(URL.createObjectURL(file));
  };

  const validate = () => {
    const err = {};
    if (!form.tanggalTiba)  err.tanggalTiba  = "Tanggal tiba wajib diisi.";
    if (!form.namaPenerima.trim()) err.namaPenerima = "Nama penerima wajib diisi.";
    return err;
  };

  const handleSubmit = () => {
    const err = validate();
    if (Object.keys(err).length) { setErrors(err); return; }
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    // Simulasi API call
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setShowModal(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-full p-6 sm:p-8">
        <SuccessState distribusi={distribusi} onBack={() => navigate("/supir/distribusi")} />
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 sm:p-8">

      {/* ── Back + header ── */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-4 transition-colors group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Kembali
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Konfirmasi Pengiriman Selesai</h1>
        <p className="text-slate-400 text-sm mt-1">Isi form berikut sebagai bukti bahwa pengiriman telah diterima</p>
      </motion.div>

      <div className="max-w-2xl">

        {/* ── Timeline ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Timeline />
        </motion.div>

        {/* ── Ringkasan distribusi ── */}
        <motion.div
          className="bg-[#1a2440] border border-[#26314a] rounded-2xl p-5 mb-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Ringkasan Pengiriman</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-4">
            {[
              { icon: FileText, label: "No. Surat Jalan", val: distribusi.noSuratJalan, mono: true },
              { icon: Package,  label: "Produk",          val: distribusi.produk        },
              { icon: Truck,    label: "Jumlah",          val: `${fmt(distribusi.jumlah)} ${distribusi.satuan}` },
              { icon: MapPin,   label: "Tujuan",          val: distribusi.tujuan        },
              { icon: Calendar, label: "Tgl Berangkat",   val: fmtDate(distribusi.tanggalBerangkat) },
              { icon: Calendar, label: "Estimasi Tiba",   val: fmtDate(distribusi.tanggalEstimasi)  },
            ].map(({ icon: Icon, label, val, mono }) => (
              <div key={label} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#121b33] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={13} className="text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-500 leading-tight">{label}</p>
                  <p className={`text-sm text-white font-medium truncate ${mono ? "font-mono" : ""}`}>{val}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Form konfirmasi ── */}
        <motion.div
          className="bg-[#1a2440] border border-[#26314a] rounded-2xl p-5 flex flex-col gap-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Form Konfirmasi</p>

          {/* Tanggal tiba */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              Tanggal & Waktu Tiba <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={form.tanggalTiba}
              onChange={(e) => set("tanggalTiba", e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl text-sm bg-[#121b33] border text-white outline-none focus:ring-1 transition-all
                ${errors.tanggalTiba ? "border-red-500 focus:ring-red-500/30" : "border-[#26314a] focus:border-[#22c55e] focus:ring-[#22c55e]/20"}`}
            />
            {errors.tanggalTiba && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertTriangle size={11} />{errors.tanggalTiba}</p>
            )}
          </div>

          {/* Nama penerima */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              Nama Penerima <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Nama orang yang menerima barang"
                value={form.namaPenerima}
                onChange={(e) => set("namaPenerima", e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[#121b33] border text-white placeholder-slate-600 outline-none focus:ring-1 transition-all
                  ${errors.namaPenerima ? "border-red-500 focus:ring-red-500/30" : "border-[#26314a] focus:border-[#22c55e] focus:ring-[#22c55e]/20"}`}
              />
            </div>
            {errors.namaPenerima && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertTriangle size={11} />{errors.namaPenerima}</p>
            )}
          </div>

          {/* Kondisi barang */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Kondisi Barang Saat Tiba</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: "baik",  label: "Baik / Utuh",       color: "border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]" },
                { val: "rusak", label: "Ada Kerusakan",      color: "border-amber-500 bg-amber-500/10 text-amber-400" },
              ].map(({ val, label, color }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set("kondisi", val)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                    form.kondisi === val ? color : "border-[#26314a] text-slate-400 bg-[#121b33]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Peringatan kondisi rusak */}
            <AnimatePresence>
              {form.kondisi === "rusak" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 flex gap-2 text-xs text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                    <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                    Jelaskan kerusakan di kolom catatan. Admin akan dihubungi untuk tindak lanjut.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              Catatan{form.kondisi === "rusak" && <span className="text-amber-400 ml-1">*</span>}
            </label>
            <textarea
              rows={3}
              placeholder={
                form.kondisi === "rusak"
                  ? "Jelaskan bagian mana yang rusak dan penyebabnya..."
                  : "Catatan tambahan (opsional)"
              }
              value={form.catatan}
              onChange={(e) => set("catatan", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-[#121b33] border border-[#26314a] text-white placeholder-slate-600 outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/20 transition-all resize-none"
            />
          </div>

          {/* Upload foto bukti */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Foto Bukti Pengiriman</label>

            {foto ? (
              <div className="relative w-full h-44 rounded-xl overflow-hidden border border-[#22c55e]/30">
                <img src={foto} alt="bukti" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setFoto(null); setFotoFile(null); fileRef.current.value = ""; }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
                >
                  <X size={13} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                  <p className="text-white text-xs truncate">{fotoFile?.name}</p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="w-full h-32 border-2 border-dashed border-[#26314a] rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-[#22c55e]/40 hover:text-slate-400 transition-all group"
              >
                <ImagePlus size={22} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs">Klik untuk upload foto bukti</span>
                <span className="text-[11px] text-slate-600">JPG, PNG, HEIC — maks. 5MB</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
          </div>

          {/* Tombol submit */}
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl font-bold text-sm text-[#0c1325] bg-[#22c55e] hover:bg-[#16a34a] transition-all flex items-center justify-center gap-2 mt-1"
          >
            <ClipboardCheck size={16} />
            Konfirmasi Pengiriman Selesai
            <ChevronRight size={15} />
          </button>
        </motion.div>
      </div>

      {/* ── Modal konfirmasi ── */}
      <AnimatePresence>
        {showModal && (
          <ConfirmModal
            distribusi={distribusi}
            onConfirm={handleConfirm}
            onCancel={() => setShowModal(false)}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default KonfirmasiDistribusi;