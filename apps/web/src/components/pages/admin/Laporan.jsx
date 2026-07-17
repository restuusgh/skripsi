import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileBarChart, Download, FileText, Printer, Package, Truck, Building2,
  TrendingUp, TrendingDown, CheckCircle2, Clock, XCircle, ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

// ── Data dummy (ganti dengan agregasi dari API produk/distributor/distribusi) ──
const PERIODE_OPT = [
  { value: "bulan_ini", label: "Bulan Ini" },
  { value: "3bulan", label: "3 Bulan Terakhir" },
  { value: "6bulan", label: "6 Bulan Terakhir" },
  { value: "tahun_ini", label: "Tahun Ini" },
];

const TREN_DISTRIBUSI = [
  { bulan: "Feb", ton: 820 },
  { bulan: "Mar", ton: 910 },
  { bulan: "Apr", ton: 760 },
  { bulan: "Mei", ton: 1040 },
  { bulan: "Jun", ton: 980 },
  { bulan: "Jul", ton: 1150 },
];

const DISTRIBUSI_PER_KATEGORI = [
  { kategori: "Minyak Sawit Mentah", ton: 1680 },
  { kategori: "Minyak Inti Sawit", ton: 640 },
  { kategori: "Minyak Sawit Olahan", ton: 320 },
];

const TOP_DISTRIBUTOR = [
  { nama: "PT Sinar Sawit", ton: 620 },
  { nama: "PT Sawit Mandiri", ton: 540 },
  { nama: "PT Agro Palma", ton: 415 },
  { nama: "PT Sawit Refinery", ton: 380 },
  { nama: "PT Nusantara Oil", ton: 210 },
];

const STOK_STATUS = [
  { name: "Tersedia", value: 7, color: "#22c55e" },
  { name: "Menipis", value: 2, color: "#eab308" },
  { name: "Habis", value: 2, color: "#ef4444" },
];

const AKTIVITAS_TERBARU = [
  { kode: "SJ-2026-0003", distributor: "PT Nusantara Oil", produk: "CPO", ton: 300, status: "PROSES", tanggal: "2026-07-07" },
  { kode: "SJ-2026-0002", distributor: "PT Agro Palma", produk: "Minyak Goreng", ton: 180, status: "PROSES", tanggal: "2026-07-06" },
  { kode: "SJ-2026-0001", distributor: "PT Sinar Sawit", produk: "CPO", ton: 250, status: "SELESAI", tanggal: "2026-07-05" },
];

const STATUS_MAP = {
  SELESAI: { bg: "bg-green-500/10", color: "text-green-500", label: "Selesai", dot: "bg-green-500" },
  PROSES: { bg: "bg-blue-500/10", color: "text-blue-500", label: "Proses", dot: "bg-blue-500" },
  DIBATALKAN: { bg: "bg-red-500/10", color: "text-red-500", label: "Dibatalkan", dot: "bg-red-500" },
};

const fmt = (n) => new Intl.NumberFormat("id-ID").format(n || 0);
const fmtTanggal = (iso) => new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
const inputCls = "px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm outline-none";

const STATS = [
  { label: "Total Distribusi", value: "1.150 Ton", delta: "+12,4%", up: true, Icon: Truck, color: { bg: "bg-green-500/10", text: "text-green-500" } },
  { label: "Distributor Aktif", value: "9", delta: "+1", up: true, Icon: Building2, color: { bg: "bg-blue-500/10", text: "text-blue-500" } },
  { label: "Produk Tersedia", value: "7 / 11", delta: "-2", up: false, Icon: Package, color: { bg: "bg-yellow-500/10", text: "text-yellow-500" } },
  { label: "Distribusi Selesai", value: "82%", delta: "+5,1%", up: true, Icon: CheckCircle2, color: { bg: "bg-green-500/10", text: "text-green-500" } },
];

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

// Tooltip Recharts custom biar konsisten sama tema gelap
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

  const totalStok = useMemo(() => STOK_STATUS.reduce((s, d) => s + d.value, 0), []);

  const handleExport = (type) => alert(`Export ${type} — hubungkan dengan library export sesuai kebutuhan.`);

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
            <button onClick={() => handleExport("Excel")}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-200 text-sm font-semibold hover:bg-slate-700 transition-colors">
              <Download size={14} /> Excel
            </button>
            <button onClick={() => handleExport("PDF")}
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
          {STATS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <StatCard {...s} />
            </motion.div>
          ))}
        </div>

        {/* Baris 1: Tren distribusi + Status stok */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <div className="lg:col-span-2">
            <CardShell title="Tren Distribusi" subtitle={`Volume distribusi per bulan · ${PERIODE_OPT.find((p) => p.value === periode)?.label}`}>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={TREN_DISTRIBUSI} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
                <Pie data={STOK_STATUS} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                  {STOK_STATUS.map((s, i) => <Cell key={i} fill={s.color} stroke="none" />)}
                </Pie>
                <Tooltip content={<ChartTooltip suffix=" produk" />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 mt-2">
              {STOK_STATUS.map((s) => (
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
          <CardShell title="Distribusi per Kategori Produk" subtitle="Total volume (ton) berdasarkan kategori">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={DISTRIBUSI_PER_KATEGORI} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="kategori" stroke="#94a3b8" fontSize={11} width={140} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
                <Bar dataKey="ton" fill="#22c55e" radius={[0, 6, 6, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </CardShell>

          <CardShell title="Top 5 Distributor" subtitle="Berdasarkan total volume distribusi (ton)">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={TOP_DISTRIBUTOR} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="nama" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} interval={0}
                  tickFormatter={(v) => v.replace("PT ", "")} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
                <Bar dataKey="ton" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
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
                {AKTIVITAS_TERBARU.map((a) => (
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