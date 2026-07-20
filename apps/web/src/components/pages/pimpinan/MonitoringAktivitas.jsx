import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, CheckCircle2, Filter, Package, Truck, UserRound } from "lucide-react";

const activities = [
  { id: 1, type: "Distribusi", icon: Truck, title: "Distribusi SJ-2026-003 telah dikonfirmasi", user: "Budi Santoso", time: "10 menit lalu", color: "#60a5fa" },
  { id: 2, type: "Stok", icon: Package, title: "Stok Crude Palm Oil diperbarui menjadi 1.060 ton", user: "Siti Rahayu", time: "45 menit lalu", color: "#4ade80" },
  { id: 3, type: "Pengguna", icon: UserRound, title: "Pengguna baru ditambahkan ke sistem", user: "Admin Sistem", time: "2 jam lalu", color: "#a78bfa" },
  { id: 4, type: "Distribusi", icon: Truck, title: "Distribusi SJ-2026-002 dibuat", user: "Admin Sistem", time: "4 jam lalu", color: "#60a5fa" },
];

export default function MonitoringAktivitas() {
  const [filter, setFilter] = useState("Semua");
  const shown = useMemo(() => filter === "Semua" ? activities : activities.filter((item) => item.type === filter), [filter]);
  return (
    <div className="min-h-full p-6 sm:p-8"><motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-7 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-xl sm:text-2xl font-bold text-white">Monitoring Aktivitas</h1><p className="mt-1 text-sm" style={{ color: "#8896ab" }}>Jejak aktivitas operasional terbaru di sistem.</p></div><div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ background: "#1a2440", borderColor: "#26314a" }}><Filter size={15} style={{ color: "#a78bfa" }} /><select value={filter} onChange={(event) => setFilter(event.target.value)} className="bg-transparent text-sm text-white outline-none"><option>Semua</option><option>Distribusi</option><option>Stok</option><option>Pengguna</option></select></div></motion.div><div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Aktivitas hari ini", "24"], ["Distribusi selesai", "8"], ["Update stok", "5"], ["Pengguna aktif", "12"]].map(([label, value], index) => <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="rounded-2xl border p-4" style={{ background: "#1a2440", borderColor: "#26314a" }}><p className="text-2xl font-black text-white">{value}</p><p className="mt-1 text-xs" style={{ color: "#5b6c87" }}>{label}</p></motion.div>)}</div><section className="rounded-2xl border p-5" style={{ background: "#1a2440", borderColor: "#26314a" }}><div className="mb-5 flex items-center gap-2"><Activity size={18} style={{ color: "#a78bfa" }} /><h2 className="font-bold text-white">Aktivitas Terbaru</h2></div><div className="space-y-1">{shown.map((item, index) => { const Icon = item.icon; return <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center gap-4 rounded-xl p-3 hover:bg-white/5"><div className="rounded-xl p-2.5" style={{ background: `${item.color}1a`, color: item.color }}><Icon size={18} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{item.title}</p><p className="mt-1 text-xs" style={{ color: "#8896ab" }}>{item.user} · {item.time}</p></div><CheckCircle2 size={17} style={{ color: "#4ade80" }} /></motion.div>; })}</div>{shown.length === 0 && <p className="py-10 text-center text-sm" style={{ color: "#8896ab" }}>Tidak ada aktivitas untuk filter ini.</p>}</section></div>
  );
}
