import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileBarChart2, FileText, Printer, Plus, X, Loader2, AlertTriangle } from "lucide-react";
import { saveAs } from "file-saver";
import api from "../../utils/api";

const JENIS_OPT = ["Distribusi", "Stok", "Prediksi AI"];

const fmtTanggal = (iso) => new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
const inputCls = "w-full rounded-xl border px-3 py-2.5 text-sm text-white outline-none";

// ── Modal buat laporan baru ──
function ModalBuatLaporan({ onClose, onSubmit, saving, error }) {
  const [judulLaporan, setJudul] = useState("");
  const [jenisLaporan, setJenis] = useState(JENIS_OPT[0]);
  const [periode, setPeriode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ judulLaporan, jenisLaporan, periode });
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative w-full max-w-sm rounded-2xl border p-6 shadow-2xl" style={{ background: "#1a2440", borderColor: "#26314a" }}
        initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 16 }}>
        <button onClick={onClose} className="absolute top-4 right-4 rounded-lg p-1 text-slate-500 hover:bg-white/5 hover:text-white">
          <X size={16} />
        </button>
        <h3 className="mb-4 text-base font-bold text-white">Buat Laporan Baru</h3>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm" style={{ background: "rgba(244,63,94,0.1)", color: "#fb7185" }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "#8896ab" }}>Judul Laporan</label>
            <input required value={judulLaporan} onChange={(e) => setJudul(e.target.value)} placeholder="Laporan Distribusi Bulanan"
              className={inputCls} style={{ background: "#121b33", borderColor: "#26314a" }} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "#8896ab" }}>Jenis</label>
            <select value={jenisLaporan} onChange={(e) => setJenis(e.target.value)} className={inputCls} style={{ background: "#121b33", borderColor: "#26314a" }}>
              {JENIS_OPT.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "#8896ab" }}>Periode</label>
            <input required value={periode} onChange={(e) => setPeriode(e.target.value)} placeholder="Juli 2026"
              className={inputCls} style={{ background: "#121b33", borderColor: "#26314a" }} />
          </div>

          <button type="submit" disabled={saving}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold disabled:opacity-60"
            style={{ background: "#a78bfa", color: "#0c1325" }}>
            {saving && <Loader2 size={15} className="animate-spin" />}
            {saving ? "Menyimpan..." : "Buat Laporan"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function Laporan() {
  const [reports, setReports] = useState([]);
  const [distribusiList, setDistribusiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [resLaporan, resDistribusi] = await Promise.all([
        api.get("/laporan"),
        api.get("/distribusi"),
      ]);
      setReports(resLaporan.data?.data ?? []);
      setDistribusiList(resDistribusi.data?.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? "Gagal memuat data laporan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const pctSelesai = useMemo(() => {
    if (distribusiList.length === 0) return 0;
    const selesai = distribusiList.filter((d) => d.status === "SELESAI").length;
    return Math.round((selesai / distribusiList.length) * 100);
  }, [distribusiList]);

  const periodeAktif = useMemo(
    () => new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
    []
  );

  const handleDownload = async (report) => {
    setDownloadingId(report.id);
    try {
      const res = await api.get(`/laporan/${report.id}/download`, { responseType: "blob" });
      const disposition = res.headers["content-disposition"];
      const match = disposition && disposition.match(/filename="?([^"]+)"?/);
      const filename = match ? match[1] : `${report.judulLaporan}.xlsx`;
      saveAs(res.data, filename);
    } catch (err) {
      alert("Gagal mengunduh laporan.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCreate = async (data) => {
    setSaving(true);
    setFormError("");
    try {
      await api.post("/laporan", data);
      await loadAll();
      setShowModal(false);
    } catch (err) {
      setFormError(err.response?.data?.message ?? "Gagal membuat laporan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center gap-2 py-24" style={{ color: "#8896ab" }}>
        <Loader2 size={18} className="animate-spin" /> Memuat laporan...
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 sm:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Laporan</h1>
          <p className="mt-1 text-sm" style={{ color: "#8896ab" }}>Akses rekap distribusi, stok, dan hasil prediksi.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setFormError(""); setShowModal(true); }}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold" style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa" }}>
            <Plus size={15} /> Buat Laporan
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold" style={{ background: "#a78bfa", color: "#0c1325" }}>
            <Printer size={15} /> Cetak halaman
          </button>
        </div>
      </motion.div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl p-3 text-sm" style={{ background: "rgba(244,63,94,0.1)", color: "#fb7185" }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          ["Laporan tersedia", String(reports.length), "#a78bfa"],
          ["Distribusi selesai", `${pctSelesai}%`, "#4ade80"],
          ["Periode aktif", periodeAktif, "#60a5fa"],
        ].map(([label, value, color], index) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className="rounded-2xl border p-5" style={{ background: "#1a2440", borderColor: "#26314a" }}>
            <FileBarChart2 size={18} style={{ color }} />
            <p className="mt-3 text-2xl font-black text-white">{value}</p>
            <p className="mt-1 text-xs" style={{ color: "#5b6c87" }}>{label}</p>
          </motion.div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border" style={{ background: "#1a2440", borderColor: "#26314a" }}>
        <div className="border-b p-5" style={{ borderColor: "#26314a" }}>
          <h2 className="font-bold text-white">Daftar Laporan</h2>
          <p className="mt-1 text-xs" style={{ color: "#5b6c87" }}>Dokumen yang telah tersedia untuk ditinjau.</p>
        </div>
        <div className="divide-y" style={{ borderColor: "#26314a" }}>
          {reports.map((report) => (
            <div key={report.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl p-2.5" style={{ background: "rgba(124,58,237,0.1)", color: "#a78bfa" }}>
                  <FileText size={19} />
                </div>
                <div>
                  <p className="font-semibold text-white">{report.judulLaporan}</p>
                  <p className="mt-1 text-xs" style={{ color: "#8896ab" }}>
                    {report.jenisLaporan} · {report.periode} · dibuat {fmtTanggal(report.tanggalCetak)}
                    {report.user?.nama && ` · oleh ${report.user.nama}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80" }}>
                  Siap diunduh
                </span>
                <button onClick={() => handleDownload(report)} disabled={downloadingId === report.id}
                  className="rounded-xl border p-2.5 text-white hover:bg-white/5 disabled:opacity-60" style={{ borderColor: "#26314a" }}
                  aria-label={`Unduh ${report.judulLaporan}`}>
                  {downloadingId === report.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                </button>
              </div>
            </div>
          ))}

          {reports.length === 0 && (
            <div className="p-10 text-center text-sm" style={{ color: "#5b6c87" }}>
              Belum ada laporan. Klik "Buat Laporan" untuk membuat yang pertama.
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {showModal && (
          <ModalBuatLaporan onClose={() => setShowModal(false)} onSubmit={handleCreate} saving={saving} error={formError} />
        )}
      </AnimatePresence>
    </div>
  );
}