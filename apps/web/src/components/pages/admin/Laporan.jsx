import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileBarChart, Download, FileText, Printer, Package, Truck, Building2,
  TrendingUp, TrendingDown, CheckCircle2, ArrowUpRight, Loader2, AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import api from "../../utils/api";

const PERIODE_OPT = [
  { value: "bulan_ini", label: "Bulan Ini" },
  { value: "3bulan", label: "3 Bulan Terakhir" },
  { value: "6bulan", label: "6 Bulan Terakhir" },
  { value: "tahun_ini", label: "Tahun Ini" },
];

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const STATUS_MAP = {
  SELESAI:     { bg: "bg-green-500/10", color: "text-green-500", label: "Selesai", dot: "bg-green-500" },
  PROSES:      { bg: "bg-blue-500/10", color: "text-blue-500", label: "Proses", dot: "bg-blue-500" },
  DIBATALKAN:  { bg: "bg-red-500/10", color: "text-red-500", label: "Dibatalkan", dot: "bg-red-500" },
};

const STOK_COLOR = { Tersedia: "#22c55e", Menipis: "#eab308", Habis: "#ef4444" };

const fmt = (n) => new Intl.NumberFormat("id-ID").format(n || 0);
const fmtPct = (n) => `${n > 0 ? "+" : ""}${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(n)}%`;
const fmtTanggal = (iso) => new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
const toNum = (v) => Number(v ?? 0);
const inputCls = "px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm outline-none";

// Total ton dari satu distribusi (jumlahkan semua detailDistribusi)
const tonDistribusi = (d) => (d.detailDistribusi || []).reduce((s, item) => s + toNum(item.jumlah), 0);

// ── Rentang tanggal berdasarkan filter periode ──
function getRange(periode, now = new Date()) {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  let start;
  switch (periode) {
    case "bulan_ini": start = new Date(now.getFullYear(), now.getMonth(), 1); break;
    case "3bulan":    start = new Date(now.getFullYear(), now.getMonth() - 2, 1); break;
    case "tahun_ini": start = new Date(now.getFullYear(), 0, 1); break;
    case "6bulan":
    default:          start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  }
  return { start, end };
}

function getPreviousRange(periode, now = new Date()) {
  const { start, end } = getRange(periode, now);
  const lengthMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - lengthMs);
  return { start: prevStart, end: prevEnd };
}

const inRange = (dateStr, range) => {
  const t = new Date(dateStr).getTime();
  return t >= range.start.getTime() && t <= range.end.getTime();
};

const deltaPercent = (curr, prev) => {
  if (!prev) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev) * 100;
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.PROSES;
  return (
    <span className={`${s.bg} ${s.color} inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} /> {s.label}
    </span>
  );
}

function StatCard({ label, value, delta, up, Icon, color }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color.bg}`}>
          <Icon size={19} className={color.text} />
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? "text-green-500" : "text-red-500"}`}>
          {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {delta}
        </span>
      </div>
      <div className="text-xl font-extrabold text-slate-100">{value}</div>
      <div className="text-[11px] text-slate-400 font-semibold mt-0.5">{label}</div>
    </div>
  );
}

function CardShell({ title, subtitle, action, children }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base font-extrabold text-slate-100 tracking-tight">{title}</h3>
        {action}
      </div>
      {subtitle && <p className="text-xs text-slate-400 mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
    </div>
  );
}

function ChartTooltip({ active, payload, label, suffix = " Ton" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      {label && <div className="text-slate-400 mb-1">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="text-slate-100 font-semibold">
          {p.name ? `${p.name}: ` : ""}{fmt(p.value)}{suffix}
        </div>
      ))}
    </div>
  );
}

export default function Laporan() {
  const [periode, setPeriode] = useState("6bulan");
  const [distribusiList, setDistribusiList] = useState([]);
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [resDistribusi, resProduk] = await Promise.all([
          api.get("/distribusi"),
          api.get("/produk"),
        ]);
        if (cancelled) return;
        setDistribusiList(resDistribusi.data?.data ?? []);
        setProdukList(resProduk.data?.data ?? []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message ?? "Gagal memuat data laporan dari server.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const periodeLabel = useMemo(
    () => PERIODE_OPT.find((p) => p.value === periode)?.label ?? "",
    [periode]
  );

  // ── Semua agregasi laporan dihitung dari data mentah di sini ──
  const report = useMemo(() => {
    const now = new Date();
    const range = getRange(periode, now);
    const prevRange = getPreviousRange(periode, now);

    const current = distribusiList.filter((d) => inRange(d.tanggalDistribusi, range));
    const previous = distribusiList.filter((d) => inRange(d.tanggalDistribusi, prevRange));

    // ── Stat: Total Distribusi ──
    const totalTonCurrent = current.reduce((s, d) => s + tonDistribusi(d), 0);
    const totalTonPrev = previous.reduce((s, d) => s + tonDistribusi(d), 0);

    // ── Stat: Distributor Aktif (tujuan unik yang dipakai dalam periode) ──
    const distributorAktifCurrent = new Set(current.map((d) => d.tujuanDistribusi?.id)).size;
    const distributorAktifPrev = new Set(previous.map((d) => d.tujuanDistribusi?.id)).size;

    // ── Stat: Produk Tersedia (stok > 0) dari total produk terdaftar ──
    const produkTersedia = produkList.filter((p) => toNum(p.stok?.jumlahStok) > 0).length;
    const totalProduk = produkList.length;

    // ── Stat: Distribusi Selesai (% dari periode berjalan) ──
    const selesaiCurrent = current.filter((d) => d.status === "SELESAI").length;
    const pctSelesaiCurrent = current.length ? (selesaiCurrent / current.length) * 100 : 0;
    const selesaiPrev = previous.filter((d) => d.status === "SELESAI").length;
    const pctSelesaiPrev = previous.length ? (selesaiPrev / previous.length) * 100 : 0;

    const stats = [
      {
        label: "Total Distribusi", value: `${fmt(totalTonCurrent)} Ton`,
        delta: fmtPct(deltaPercent(totalTonCurrent, totalTonPrev)), up: totalTonCurrent >= totalTonPrev,
        Icon: Truck, color: { bg: "bg-green-500/10", text: "text-green-500" },
      },
      {
        label: "Distributor Aktif", value: String(distributorAktifCurrent),
        delta: `${distributorAktifCurrent - distributorAktifPrev >= 0 ? "+" : ""}${distributorAktifCurrent - distributorAktifPrev}`,
        up: distributorAktifCurrent >= distributorAktifPrev,
        Icon: Building2, color: { bg: "bg-blue-500/10", text: "text-blue-500" },
      },
      {
        label: "Produk Tersedia", value: `${produkTersedia} / ${totalProduk}`,
        delta: `${produkTersedia - totalProduk >= 0 ? "+" : ""}${produkTersedia - totalProduk}`,
        up: totalProduk === 0 ? true : produkTersedia === totalProduk,
        Icon: Package, color: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
      },
      {
        label: "Distribusi Selesai", value: `${fmt(pctSelesaiCurrent)}%`,
        delta: fmtPct(deltaPercent(pctSelesaiCurrent, pctSelesaiPrev) || (pctSelesaiCurrent - pctSelesaiPrev)),
        up: pctSelesaiCurrent >= pctSelesaiPrev,
        Icon: CheckCircle2, color: { bg: "bg-green-500/10", text: "text-green-500" },
      },
    ];

    // ── Tren distribusi bulanan (jumlah bulan mengikuti filter periode) ──
    const monthCount = periode === "bulan_ini" ? 1 : periode === "3bulan" ? 3 : periode === "tahun_ini" ? now.getMonth() + 1 : 6;
    const months = Array.from({ length: monthCount }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1 - i), 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
    const tren = months.map(({ year, month }) => {
      const ton = distribusiList
        .filter((d) => {
          const dt = new Date(d.tanggalDistribusi);
          return dt.getFullYear() === year && dt.getMonth() === month;
        })
        .reduce((s, d) => s + tonDistribusi(d), 0);
      return { bulan: MONTH_LABELS[month], ton: Math.round(ton) };
    });

    // ── Distribusi per kategori produk (jenisProduk) ──
    const kategoriMap = new Map();
    current.forEach((d) => {
      (d.detailDistribusi || []).forEach((item) => {
        const kategori = item.produk?.jenisProduk ?? "Lainnya";
        kategoriMap.set(kategori, (kategoriMap.get(kategori) ?? 0) + toNum(item.jumlah));
      });
    });
    const perKategori = [...kategoriMap.entries()]
      .map(([kategori, ton]) => ({ kategori, ton: Math.round(ton) }))
      .sort((a, b) => b.ton - a.ton);

    // ── Top 5 distributor (tujuan distribusi) ──
    const distributorMap = new Map();
    current.forEach((d) => {
      const nama = d.tujuanDistribusi?.namaTujuan ?? "Tidak diketahui";
      distributorMap.set(nama, (distributorMap.get(nama) ?? 0) + tonDistribusi(d));
    });
    const topDistributor = [...distributorMap.entries()]
      .map(([nama, ton]) => ({ nama, ton: Math.round(ton) }))
      .sort((a, b) => b.ton - a.ton)
      .slice(0, 5);

    // ── Status stok produk ──
    let tersedia = 0, menipis = 0, habis = 0;
    produkList.forEach((p) => {
      const jumlah = toNum(p.stok?.jumlahStok);
      const minimal = toNum(p.stok?.minimalStok);
      if (!p.stok || jumlah <= 0) habis += 1;
      else if (jumlah <= minimal) menipis += 1;
      else tersedia += 1;
    });
    const stokStatus = [
      { name: "Tersedia", value: tersedia, color: STOK_COLOR.Tersedia },
      { name: "Menipis", value: menipis, color: STOK_COLOR.Menipis },
      { name: "Habis", value: habis, color: STOK_COLOR.Habis },
    ];

    // ── Aktivitas distribusi terbaru (3 terakhir, seluruh data) ──
    const aktivitasTerbaru = [...distribusiList]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .map((d) => {
        const namaProduk = [...new Set((d.detailDistribusi || []).map((i) => i.produk?.namaProduk).filter(Boolean))];
        return {
          kode: d.kodeDistribusi,
          distributor: d.tujuanDistribusi?.namaTujuan ?? "-",
          produk: namaProduk.length > 1 ? `${namaProduk[0]} +${namaProduk.length - 1}` : (namaProduk[0] ?? "-"),
          ton: Math.round(tonDistribusi(d)),
          status: d.status,
          tanggal: d.tanggalDistribusi,
        };
      });

    return { stats, tren, perKategori, topDistributor, stokStatus, aktivitasTerbaru, totalProduk };
  }, [distribusiList, produkList, periode]);

  // ── Export PDF ──
  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setTextColor(21, 128, 61);
    doc.text("Laporan Distribusi Kelapa Sawit", 14, 16);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Periode: ${periodeLabel}`, 14, 22);
    doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`, 14, 27);

    autoTable(doc, {
      startY: 33,
      head: [["Metrik", "Nilai", "Perubahan"]],
      body: report.stats.map((s) => [s.label, s.value, s.delta]),
      theme: "grid",
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 9 },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Bulan", "Volume (Ton)"]],
      body: report.tren.map((d) => [d.bulan, fmt(d.ton)]),
      theme: "grid",
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 9 },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Kategori Produk", "Volume (Ton)"]],
      body: report.perKategori.map((d) => [d.kategori, fmt(d.ton)]),
      theme: "grid",
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 9 },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Distributor", "Volume (Ton)"]],
      body: report.topDistributor.map((d) => [d.nama, fmt(d.ton)]),
      theme: "grid",
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 9 },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["No. SJ", "Distributor", "Produk", "Volume", "Tanggal", "Status"]],
      body: report.aktivitasTerbaru.map((a) => [
        a.kode, a.distributor, a.produk, `${fmt(a.ton)} Ton`, fmtTanggal(a.tanggal), STATUS_MAP[a.status]?.label ?? a.status,
      ]),
      theme: "grid",
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 9 },
    });

    doc.save(`laporan-distribusi-${periode}.pdf`);
  };

  // ── Export Excel ──
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb,
      XLSX.utils.json_to_sheet(report.stats.map((s) => ({ Metrik: s.label, Nilai: s.value, Perubahan: s.delta }))),
      "Ringkasan");

    XLSX.utils.book_append_sheet(wb,
      XLSX.utils.json_to_sheet(report.tren.map((d) => ({ Bulan: d.bulan, "Volume (Ton)": d.ton }))),
      "Tren Distribusi");

    XLSX.utils.book_append_sheet(wb,
      XLSX.utils.json_to_sheet(report.perKategori.map((d) => ({ Kategori: d.kategori, "Volume (Ton)": d.ton }))),
      "Per Kategori");

    XLSX.utils.book_append_sheet(wb,
      XLSX.utils.json_to_sheet(report.topDistributor.map((d) => ({ Distributor: d.nama, "Volume (Ton)": d.ton }))),
      "Top Distributor");

    XLSX.utils.book_append_sheet(wb,
      XLSX.utils.json_to_sheet(report.stokStatus.map((s) => ({ Status: s.name, "Jumlah Produk": s.value }))),
      "Status Stok");

    XLSX.utils.book_append_sheet(wb,
      XLSX.utils.json_to_sheet(report.aktivitasTerbaru.map((a) => ({
        "No. SJ": a.kode, Distributor: a.distributor, Produk: a.produk,
        "Volume (Ton)": a.ton, Tanggal: fmtTanggal(a.tanggal), Status: STATUS_MAP[a.status]?.label ?? a.status,
      }))),
      "Aktivitas Terbaru");

    XLSX.writeFile(wb, `laporan-distribusi-${periode}.xlsx`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 gap-2">
        <Loader2 size={18} className="animate-spin" /> Memuat data laporan...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl">
          <AlertTriangle size={18} /> {error}
        </div>
      </div>
    );
  }

  const totalStok = report.stokStatus.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-transparent min-h-screen">
      <div className="px-6 lg:px-8 py-8 max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="mb-7 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
              <FileBarChart size={22} className="text-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Laporan</h1>
              <p className="text-slate-400 mt-0.5 text-sm">Ringkasan produk, distributor, dan distribusi kelapa sawit</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select className={inputCls} value={periode} onChange={(e) => setPeriode(e.target.value)}>
              {PERIODE_OPT.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <button onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-200 text-sm font-semibold hover:bg-slate-700 transition-colors">
              <Download size={14} /> Excel
            </button>
            <button onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-200 text-sm font-semibold hover:bg-slate-700 transition-colors">
              <FileText size={14} /> PDF
            </button>
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-slate-900 text-sm font-bold transition-colors">
              <Printer size={14} /> Cetak
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {report.stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <StatCard {...s} />
            </motion.div>
          ))}
        </div>

        {/* Baris 1: Tren distribusi + Status stok */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <div className="lg:col-span-2">
            <CardShell title="Tren Distribusi" subtitle={`Volume distribusi per bulan · ${periodeLabel}`}>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={report.tren} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="bulan" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#475569", strokeDasharray: "4 4" }} />
                  <Line type="monotone" dataKey="ton" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: "#22c55e", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardShell>
          </div>

          <CardShell title="Status Stok Produk" subtitle={`${totalStok} produk terdaftar`}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={report.stokStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                  {report.stokStatus.map((s, i) => <Cell key={i} fill={s.color} stroke="none" />)}
                </Pie>
                <Tooltip content={<ChartTooltip suffix=" produk" />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 mt-2">
              {report.stokStatus.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }} /> {s.name}
                  </span>
                  <span className="text-slate-400 font-semibold">{s.value} produk</span>
                </div>
              ))}
            </div>
          </CardShell>
        </div>

        {/* Baris 2: Kategori produk + Top distributor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <CardShell title="Distribusi per Kategori Produk" subtitle={`Total volume (ton) · ${periodeLabel}`}>
            {report.perKategori.length === 0 ? (
              <div className="h-[230px] flex items-center justify-center text-sm text-slate-500">Belum ada data pada periode ini.</div>
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={report.perKategori} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="kategori" stroke="#94a3b8" fontSize={11} width={140} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
                  <Bar dataKey="ton" fill="#22c55e" radius={[0, 6, 6, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardShell>

          <CardShell title="Top 5 Distributor" subtitle={`Berdasarkan volume distribusi · ${periodeLabel}`}>
            {report.topDistributor.length === 0 ? (
              <div className="h-[230px] flex items-center justify-center text-sm text-slate-500">Belum ada data pada periode ini.</div>
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={report.topDistributor} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="nama" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} interval={0}
                    tickFormatter={(v) => v.replace("PT ", "")} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
                  <Bar dataKey="ton" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardShell>
        </div>

        {/* Baris 3: Aktivitas terbaru */}
        <CardShell
          title="Aktivitas Distribusi Terbaru"
          subtitle="3 transaksi distribusi terakhir"
          action={
            <span className="flex items-center gap-1 text-xs font-semibold text-green-500 cursor-pointer hover:text-green-400 transition-colors">
              Lihat semua <ArrowUpRight size={13} />
            </span>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                  <th className="py-2.5 px-2 font-semibold">No. SJ</th>
                  <th className="py-2.5 px-2 font-semibold">Distributor</th>
                  <th className="py-2.5 px-2 font-semibold">Produk</th>
                  <th className="py-2.5 px-2 font-semibold">Volume</th>
                  <th className="py-2.5 px-2 font-semibold">Tanggal</th>
                  <th className="py-2.5 px-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {report.aktivitasTerbaru.map((a) => (
                  <tr key={a.kode} className="border-t border-slate-700">
                    <td className="py-3 px-2 font-bold text-slate-100">{a.kode}</td>
                    <td className="py-3 px-2 text-slate-300">{a.distributor}</td>
                    <td className="py-3 px-2 text-slate-300">{a.produk}</td>
                    <td className="py-3 px-2 text-slate-300">{fmt(a.ton)} Ton</td>
                    <td className="py-3 px-2 text-slate-300">{fmtTanggal(a.tanggal)}</td>
                    <td className="py-3 px-2"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardShell>
      </div>
    </div>
  );
}