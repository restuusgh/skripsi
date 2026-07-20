import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Minus, Search, ArrowUpRight,
  ArrowDownRight, AlertTriangle, CheckCircle2, Loader2,
  ChevronDown, X, Package, RotateCcw, Clock, Hash,
} from "lucide-react";
import api from "../../utils/api";

const ALASAN_MASUK  = ["Penerimaan dari kebun", "Penerimaan dari pabrik", "Return dari distributor", "Stok opname", "Lainnya"];
const ALASAN_KELUAR = ["Pengiriman ke distributor", "Retur ke supplier", "Stok opname", "Susut/kadaluarsa", "Lainnya"];

const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);

// Status stok dihitung dari jumlahStok vs minimalStok saja — tidak ada
// batas maksimum di database, jadi status "melebihi maksimum" dihapus.
const getStatus = ({ stok, minStok }) => {
  if (stok <= 0)      return { key: "kritis", color: "#fb7185", label: "Stok habis" };
  if (stok <= minStok) return { key: "rendah", color: "#fbbf24", label: "Stok menipis" };
  return                      { key: "aman",   color: "#4ade80", label: "Stok aman" };
};

const fmtWaktu = (iso) => new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

// ── Dropdown pilih produk ─────────────────────────────────────────────────────
const ProdukDropdown = ({ produk, selected, onSelect }) => {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");

  const filtered = produk.filter((p) =>
    p.nama.toLowerCase().includes(search.toLowerCase()) || p.jenis.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left transition-all"
        style={{
          background:  "#121b33",
          borderColor: open ? "#fb7185" : "#26314a",
          boxShadow:   open ? "0 0 0 2px rgba(244,63,94,0.15)" : "none",
        }}
      >
        {selected ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(244,63,94,0.1)" }}>
              <Package size={14} style={{ color: "#fb7185" }} />
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{selected.nama}</p>
              <p className="text-[11px]" style={{ color: "#3a4863" }}>{selected.jenis}</p>
            </div>
          </div>
        ) : (
          <span className="text-sm" style={{ color: "#5b6c87" }}>Pilih produk...</span>
        )}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} style={{ color: "#5b6c87", flexShrink: 0 }} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute left-0 right-0 mt-1.5 rounded-xl border shadow-2xl z-20 overflow-hidden"
            style={{ background: "#1a2440", borderColor: "#26314a" }}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{   opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            <div className="p-2 border-b" style={{ borderColor: "#26314a" }}>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#5b6c87" }} />
                <input autoFocus type="text" placeholder="Cari produk..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg outline-none"
                  style={{ background: "#121b33", color: "#fff", border: "none" }} />
              </div>
            </div>

            <div className="max-h-52 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center text-xs py-4" style={{ color: "#5b6c87" }}>Produk tidak ditemukan</p>
              ) : filtered.map((p) => {
                const st = getStatus(p);
                return (
                  <motion.button key={p.id} type="button"
                    className="flex items-center justify-between w-full px-4 py-3 text-left border-b last:border-0 transition-colors"
                    style={{ borderColor: "#121b33" }}
                    whileHover={{ background: "rgba(255,255,255,0.04)" }}
                    onClick={() => { onSelect(p); setOpen(false); setSearch(""); }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(244,63,94,0.08)" }}>
                        <Package size={13} style={{ color: "#fb7185" }} />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{p.nama}</p>
                        <p className="text-[11px]" style={{ color: "#3a4863" }}>{p.jenis}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-bold text-white">{fmt(p.stok)}</p>
                      <p className="text-[10px]" style={{ color: st.color }}>{st.label}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Modal konfirmasi ──────────────────────────────────────────────────────────
const ConfirmModal = ({ tipe, produk, jumlah, alasan, stokBaru, onConfirm, onCancel, loading }) => (
  <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
    <motion.div className="relative rounded-2xl border p-6 w-full max-w-sm shadow-2xl"
      style={{ background: "#1a2440", borderColor: "#26314a" }}
      initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}>
      <button onClick={onCancel} className="absolute top-4 right-4 p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/5">
        <X size={16} />
      </button>

      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: tipe === "masuk" ? "rgba(34,197,94,0.1)" : "rgba(244,63,94,0.1)" }}>
        {tipe === "masuk"
          ? <ArrowUpRight size={22} style={{ color: "#4ade80" }} />
          : <ArrowDownRight size={22} style={{ color: "#fb7185" }} />}
      </div>

      <h3 className="text-white font-bold text-base mb-1">
        Konfirmasi {tipe === "masuk" ? "Penambahan" : "Pengurangan"} Stok
      </h3>
      <p className="text-sm mb-4" style={{ color: "#8896ab" }}>
        Pastikan data sudah benar sebelum menyimpan.
      </p>

      <div className="rounded-xl p-4 mb-4 flex flex-col gap-2" style={{ background: "#121b33" }}>
        {[
          { label: "Produk",     val: produk?.nama },
          { label: "Tipe",       val: tipe === "masuk" ? "Stok Masuk ↑" : "Stok Keluar ↓",
            color: tipe === "masuk" ? "#4ade80" : "#fb7185" },
          { label: "Jumlah",     val: `${fmt(jumlah)} ${produk?.satuan}`,
            color: tipe === "masuk" ? "#4ade80" : "#fb7185" },
          { label: "Stok Baru",  val: `${fmt(stokBaru)} ${produk?.satuan}` },
          { label: "Alasan",     val: alasan },
        ].map(({ label, val, color }) => (
          <div key={label} className="flex justify-between items-center gap-4">
            <span className="text-xs shrink-0" style={{ color: "#5b6c87" }}>{label}</span>
            <span className="text-sm font-semibold text-right" style={{ color: color || "#fff" }}>{val}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all"
          style={{ background: "#121b33", borderColor: "#26314a", color: "#cbd5e1" }}>
          Batal
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          style={{
            background: tipe === "masuk" ? "#22c55e" : "#f43f5e",
            color:      "#fff",
          }}>
          {loading
            ? <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}><Loader2 size={14} /></motion.span>Menyimpan...</>
            : <><CheckCircle2 size={14} />Simpan</>}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ── Halaman utama ─────────────────────────────────────────────────────────────
const UpdateStok = () => {
  const [produkList, setProdukList] = useState([]);
  const [loadingProduk, setLoadingProduk] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selected,   setSelected]   = useState(null);
  const [tipe,       setTipe]       = useState("masuk");  // "masuk" | "keluar"
  const [jumlah,     setJumlah]     = useState("");
  const [alasan,     setAlasan]     = useState("");
  const [alasanCustom, setAlasanCustom] = useState("");
  const [catatan,    setCatatan]    = useState("");
  const [errors,     setErrors]     = useState({});
  const [showModal,  setShowModal]  = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [riwayat,    setRiwayat]    = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(true);

  const mapProduk = (p) => ({
    id: p.id,
    nama: p.namaProduk,
    jenis: p.jenisProduk,
    satuan: p.satuan,
    stok: Number(p.stok?.jumlahStok ?? 0),
    minStok: Number(p.stok?.minimalStok ?? 0),
  });

  const loadProduk = async () => {
    setLoadingProduk(true);
    setLoadError("");
    try {
      const res = await api.get("/produk");
      setProdukList((res.data?.data ?? []).map(mapProduk));
    } catch (err) {
      setLoadError(err.response?.data?.message ?? "Gagal memuat data produk.");
    } finally {
      setLoadingProduk(false);
    }
  };

  const loadRiwayat = async () => {
    setLoadingRiwayat(true);
    try {
      const res = await api.get("/stok/riwayat");
      setRiwayat(res.data?.data ?? []);
    } catch {
      // gagal memuat riwayat tidak menghalangi penggunaan form utama
    } finally {
      setLoadingRiwayat(false);
    }
  };

  useEffect(() => {
    loadProduk();
    loadRiwayat();
  }, []);

  const alasanList = tipe === "masuk" ? ALASAN_MASUK : ALASAN_KELUAR;
  const stokBaru   = selected
    ? tipe === "masuk"
      ? selected.stok + Number(jumlah || 0)
      : selected.stok - Number(jumlah || 0)
    : 0;

  const statusSelected = selected ? getStatus(selected) : null;
  const statusBaru     = selected ? getStatus({ ...selected, stok: stokBaru }) : null;

  const validate = () => {
    const err = {};
    if (!selected)                    err.produk = "Pilih produk terlebih dahulu.";
    if (!jumlah || Number(jumlah) <= 0) err.jumlah = "Masukkan jumlah yang valid.";
    if (tipe === "keluar" && selected && Number(jumlah) > selected.stok)
      err.jumlah = `Stok tidak cukup. Tersedia: ${fmt(selected.stok)} ${selected.satuan}.`;
    if (!alasan)                      err.alasan = "Pilih alasan perubahan stok.";
    if (alasan === "Lainnya" && !alasanCustom.trim())
      err.alasanCustom = "Masukkan keterangan alasan.";
    return err;
  };

  const handleSubmit = () => {
    const err = validate();
    if (Object.keys(err).length) { setErrors(err); return; }
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setSubmitError("");
    try {
      const res = await api.patch(`/stok/${selected.id}`, {
        tipe: tipe === "masuk" ? "MASUK" : "KELUAR",
        jumlah: Number(jumlah),
        alasan: alasan === "Lainnya" ? alasanCustom : alasan,
        catatan: catatan || undefined,
      });

      const { stok: stokBaruRes, riwayat: riwayatBaru } = res.data.data;

      // Update stok produk di daftar lokal
      setProdukList((prev) => prev.map((p) =>
        p.id === selected.id ? { ...p, stok: Number(stokBaruRes.jumlahStok) } : p
      ));

      // Tambah riwayat terbaru ke atas daftar
      setRiwayat((prev) => [riwayatBaru, ...prev]);

      // Reset form
      setSelected(null);
      setJumlah("");
      setAlasan("");
      setAlasanCustom("");
      setCatatan("");
      setErrors({});
      setShowModal(false);
    } catch (err) {
      setSubmitError(err.response?.data?.message ?? "Gagal menyimpan perubahan stok.");
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelected(null);
    setJumlah("");
    setAlasan("");
    setAlasanCustom("");
    setCatatan("");
    setErrors({});
    setSubmitError("");
  };

  return (
    <div className="min-h-full p-6 sm:p-8">
      <motion.div className="mb-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Update Stok Produk</h1>
        <p className="text-sm mt-1" style={{ color: "#8896ab" }}>
          Tambah atau kurangi stok produk di gudang
        </p>
      </motion.div>

      {loadError && (
        <div className="mb-6 flex items-center gap-2 rounded-xl p-3 text-sm" style={{ background: "rgba(244,63,94,0.1)", color: "#fb7185" }}>
          <AlertTriangle size={14} /> {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── Form update stok ── */}
        <motion.div className="rounded-2xl border p-6 flex flex-col gap-5"
          style={{ background: "#1a2440", borderColor: "#26314a" }}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>

          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#5b6c87" }}>Form Perubahan Stok</p>
            <button onClick={handleReset} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all"
              style={{ color: "#5b6c87", background: "#121b33" }}>
              <RotateCcw size={11} /> Reset
            </button>
          </div>

          {submitError && (
            <div className="flex items-center gap-2 rounded-xl p-3 text-sm" style={{ background: "rgba(244,63,94,0.1)", color: "#fb7185" }}>
              <AlertTriangle size={14} /> {submitError}
            </div>
          )}

          {/* Pilih tipe */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#cbd5e1" }}>Tipe Perubahan</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "masuk",  label: "Stok Masuk",  icon: ArrowUpRight,   color: "#4ade80", bg: "rgba(34,197,94,0.12)"  },
                { key: "keluar", label: "Stok Keluar", icon: ArrowDownRight, color: "#fb7185", bg: "rgba(244,63,94,0.12)"  },
              ].map(({ key, label, icon: Icon, color, bg }) => (
                <button key={key} type="button" onClick={() => { setTipe(key); setAlasan(""); }}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-bold transition-all"
                  style={{
                    background:  tipe === key ? bg   : "#121b33",
                    borderColor: tipe === key ? color : "#26314a",
                    color:       tipe === key ? color : "#5b6c87",
                  }}>
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Pilih produk */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#cbd5e1" }}>
              Produk <span style={{ color: "#fb7185" }}>*</span>
            </label>
            {loadingProduk ? (
              <div className="flex items-center gap-2 text-sm py-3" style={{ color: "#5b6c87" }}>
                <Loader2 size={14} className="animate-spin" /> Memuat produk...
              </div>
            ) : (
              <ProdukDropdown
                produk={produkList}
                selected={selected}
                onSelect={(p) => { setSelected(p); setErrors((e) => ({ ...e, produk: "" })); }}
              />
            )}
            {errors.produk && (
              <p className="flex items-center gap-1 text-xs mt-1.5" style={{ color: "#fb7185" }}>
                <AlertTriangle size={11} />{errors.produk}
              </p>
            )}
          </div>

          {/* Info stok saat ini */}
          <AnimatePresence>
            {selected && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-3 border" style={{ background: "#121b33", borderColor: "#26314a" }}>
                    <p className="text-[10px] mb-1" style={{ color: "#3a4863" }}>Stok Sekarang</p>
                    <p className="text-white font-black text-base">{fmt(selected.stok)}</p>
                    <p className="text-[11px] mt-0.5 font-semibold" style={{ color: statusSelected?.color }}>
                      {statusSelected?.label}
                    </p>
                  </div>
                  <div className="rounded-xl p-3 border"
                    style={{
                      background: jumlah
                        ? tipe === "masuk" ? "rgba(34,197,94,0.07)" : "rgba(244,63,94,0.07)"
                        : "#121b33",
                      borderColor: jumlah
                        ? tipe === "masuk" ? "rgba(34,197,94,0.3)" : "rgba(244,63,94,0.3)"
                        : "#26314a",
                    }}>
                    <p className="text-[10px] mb-1" style={{ color: "#3a4863" }}>Stok Setelah Update</p>
                    <p className="text-white font-black text-base">{jumlah ? fmt(stokBaru) : "—"}</p>
                    {jumlah && statusBaru && (
                      <p className="text-[11px] mt-0.5 font-semibold" style={{ color: statusBaru.color }}>
                        {statusBaru.label}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Jumlah */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#cbd5e1" }}>
              Jumlah ({selected?.satuan ?? "ton"}) <span style={{ color: "#fb7185" }}>*</span>
            </label>
            <div className="flex items-center gap-2">
              <button type="button"
                className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all"
                style={{ background: "#121b33", borderColor: "#26314a", color: "#5b6c87" }}
                onClick={() => setJumlah((v) => String(Math.max(0, Number(v || 0) - 1)))}>
                <Minus size={14} />
              </button>
              <input type="number" min="0" step="0.1" placeholder="0" value={jumlah}
                onChange={(e) => { setJumlah(e.target.value); setErrors((er) => ({ ...er, jumlah: "" })); }}
                className="flex-1 text-center py-2.5 rounded-xl border text-white font-bold text-base outline-none focus:ring-1 transition-all"
                style={{
                  background:  "#121b33",
                  borderColor: errors.jumlah ? "#fb7185" : "#26314a",
                  boxShadow:   errors.jumlah ? "0 0 0 2px rgba(244,63,94,0.15)" : "none",
                }} />
              <button type="button"
                className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all"
                style={{ background: "#121b33", borderColor: "#26314a", color: "#5b6c87" }}
                onClick={() => setJumlah((v) => String(Number(v || 0) + 1))}>
                <Plus size={14} />
              </button>
            </div>
            {errors.jumlah && (
              <p className="flex items-center gap-1 text-xs mt-1.5" style={{ color: "#fb7185" }}>
                <AlertTriangle size={11} />{errors.jumlah}
              </p>
            )}
          </div>

          {/* Alasan */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#cbd5e1" }}>
              Alasan <span style={{ color: "#fb7185" }}>*</span>
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {alasanList.map((a) => (
                <button key={a} type="button" onClick={() => { setAlasan(a); setErrors((e) => ({ ...e, alasan: "", alasanCustom: "" })); }}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left text-sm transition-all"
                  style={{
                    background:  alasan === a ? "rgba(244,63,94,0.08)" : "#121b33",
                    borderColor: alasan === a ? "rgba(244,63,94,0.4)"  : "#26314a",
                    color:       alasan === a ? "#fb7185"               : "#8896ab",
                  }}>
                  <div className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: alasan === a ? "#fb7185" : "#3a4863" }} />
                  {a}
                </button>
              ))}
            </div>
            {errors.alasan && (
              <p className="flex items-center gap-1 text-xs mt-1.5" style={{ color: "#fb7185" }}>
                <AlertTriangle size={11} />{errors.alasan}
              </p>
            )}
          </div>

          {/* Input alasan custom */}
          <AnimatePresence>
            {alasan === "Lainnya" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <input type="text" placeholder="Tuliskan alasan lainnya..."
                  value={alasanCustom}
                  onChange={(e) => { setAlasanCustom(e.target.value); setErrors((er) => ({ ...er, alasanCustom: "" })); }}
                  className="w-full px-4 py-2.5 rounded-xl border text-white text-sm placeholder-slate-600 outline-none focus:ring-1 transition-all"
                  style={{ background: "#121b33", borderColor: errors.alasanCustom ? "#fb7185" : "#26314a" }} />
                {errors.alasanCustom && (
                  <p className="flex items-center gap-1 text-xs mt-1.5" style={{ color: "#fb7185" }}>
                    <AlertTriangle size={11} />{errors.alasanCustom}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Catatan */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#cbd5e1" }}>
              Catatan <span style={{ color: "#3a4863" }}>(opsional)</span>
            </label>
            <textarea rows={2} placeholder="Catatan tambahan..." value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border text-white text-sm placeholder-slate-600 outline-none focus:ring-1 transition-all resize-none"
              style={{ background: "#121b33", borderColor: "#26314a" }} />
          </div>

          {/* Tombol simpan */}
          <button type="button" onClick={handleSubmit} disabled={loadingProduk}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            style={{
              background: tipe === "masuk" ? "#22c55e" : "#f43f5e",
              color:      "#fff",
            }}>
            {tipe === "masuk"
              ? <><ArrowUpRight size={16} />Tambah Stok</>
              : <><ArrowDownRight size={16} />Kurangi Stok</>}
          </button>
        </motion.div>

        {/* ── Riwayat update ── */}
        <motion.div className="rounded-2xl border p-5"
          style={{ background: "#1a2440", borderColor: "#26314a" }}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#5b6c87" }}>
            Riwayat Update Stok
          </p>

          {loadingRiwayat ? (
            <div className="flex items-center justify-center py-14 gap-2 text-sm" style={{ color: "#5b6c87" }}>
              <Loader2 size={16} className="animate-spin" /> Memuat riwayat...
            </div>
          ) : riwayat.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <Clock size={28} strokeWidth={1.4} style={{ color: "#3a4863", marginBottom: 10 }} />
              <p className="text-sm font-medium" style={{ color: "#5b6c87" }}>Belum ada riwayat</p>
              <p className="text-xs mt-1" style={{ color: "#3a4863" }}>Update stok untuk melihat histori di sini.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
              <AnimatePresence>
                {riwayat.map((r, i) => {
                  const tipeLower = r.tipe === "MASUK" ? "masuk" : "keluar";
                  return (
                    <motion.div key={r.id}
                      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i, 10) * 0.04 }}
                      className="rounded-xl border p-4"
                      style={{ background: "#121b33", borderColor: "#26314a" }}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: tipeLower === "masuk" ? "rgba(34,197,94,0.1)" : "rgba(244,63,94,0.1)" }}>
                            {tipeLower === "masuk"
                              ? <ArrowUpRight size={14} style={{ color: "#4ade80" }} />
                              : <ArrowDownRight size={14} style={{ color: "#fb7185" }} />}
                          </div>
                          <div>
                            <p className="text-white text-sm font-semibold leading-none">{r.produk?.namaProduk}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: "#5b6c87" }}>{r.alasan}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black"
                            style={{ color: tipeLower === "masuk" ? "#4ade80" : "#fb7185" }}>
                            {tipeLower === "masuk" ? "+" : "-"}{fmt(r.jumlah)} {r.produk?.satuan}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px]" style={{ color: "#3a4863" }}>
                        <span className="flex items-center gap-1">
                          <Hash size={10} />
                          {fmt(r.stokAwal)} → {fmt(r.stokAkhir)} {r.produk?.satuan}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {fmtWaktu(r.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] mt-2" style={{ color: "#5b6c87" }}>oleh {r.user?.nama ?? "-"}</p>

                      {r.catatan && (
                        <p className="text-[11px] mt-2 px-2.5 py-1.5 rounded-lg"
                          style={{ background: "rgba(255,255,255,0.03)", color: "#5b6c87" }}>
                          {r.catatan}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal konfirmasi */}
      <AnimatePresence>
        {showModal && (
          <ConfirmModal
            tipe={tipe}
            produk={selected}
            jumlah={Number(jumlah)}
            alasan={alasan === "Lainnya" ? alasanCustom : alasan}
            stokBaru={stokBaru}
            onConfirm={handleConfirm}
            onCancel={() => setShowModal(false)}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UpdateStok;