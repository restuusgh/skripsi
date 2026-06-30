import { motion } from "framer-motion";
import {
  Truck, Building2, PackageCheck, BrainCircuit,
  TrendingUp, TrendingDown, ArrowRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const stats = [
  { label: "Total Distribusi",   value: "1.245", change: "+12%", up: true,  icon: Truck,        accent: "green"  },
  { label: "Distributor Aktif",  value: "78",    change: "+3%",  up: true,  icon: Building2,    accent: "blue"   },
  { label: "Pengiriman Aktif",   value: "43",    change: "-5%",  up: false, icon: PackageCheck, accent: "amber"  },
  { label: "Akurasi Prediksi AI",value: "98%",   change: "+1%",  up: true,  icon: BrainCircuit, accent: "purple" },
];

const chartData = [
  { bulan: "Jan", distribusi: 820  },
  { bulan: "Feb", distribusi: 940  },
  { bulan: "Mar", distribusi: 880  },
  { bulan: "Apr", distribusi: 1020 },
  { bulan: "Mei", distribusi: 1150 },
  { bulan: "Jun", distribusi: 1080 },
  { bulan: "Jul", distribusi: 1245 },
];

const activities = [
  { id: "D-0091", distributor: "PT Sawit Makmur",   lokasi: "Medan",     status: "Terkirim", time: "2 menit lalu"  },
  { id: "D-0090", distributor: "CV Hijau Lestari",  lokasi: "Pekanbaru", status: "Proses",   time: "15 menit lalu" },
  { id: "D-0089", distributor: "UD Berkah Tani",    lokasi: "Jambi",     status: "Terkirim", time: "1 jam lalu"    },
  { id: "D-0088", distributor: "PT Agro Nusantara", lokasi: "Palembang", status: "Pending",  time: "2 jam lalu"    },
  { id: "D-0087", distributor: "CV Mitra Sawit",    lokasi: "Lampung",   status: "Terkirim", time: "3 jam lalu"    },
];

const accentMap = {
  green:  { bg: "bg-green-500/10",  icon: "text-green-400",  border: "border-green-500/20"  },
  blue:   { bg: "bg-blue-500/10",   icon: "text-blue-400",   border: "border-blue-500/20"   },
  amber:  { bg: "bg-amber-500/10",  icon: "text-amber-400",  border: "border-amber-500/20"  },
  purple: { bg: "bg-purple-500/10", icon: "text-purple-400", border: "border-purple-500/20" },
};

const statusStyle = {
  Terkirim: "bg-green-500/10 text-green-400 border border-green-500/20",
  Proses:   "bg-blue-500/10  text-blue-400  border border-blue-500/20",
  Pending:  "bg-amber-500/10 text-amber-400 border border-amber-500/20",
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2 text-sm shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-green-400 font-bold">{payload[0].value.toLocaleString()} ton</p>
    </div>
  );
};

export default function Dashboard() {
  return (
    <div className="space-y-4 min-[480px]:space-y-6">

      {/* ── Stat Cards ── */}
      <motion.div
        className="grid grid-cols-1 min-[480px]:grid-cols-2 xl:grid-cols-4 gap-3 min-[480px]:gap-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((s, i) => {
          const Icon = s.icon;
          const a = accentMap[s.accent];
          return (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`bg-slate-800/80 border ${a.border} rounded-2xl p-4 min-[480px]:p-5 cursor-default`}
            >
              <div className="flex items-start justify-between mb-3 min-[480px]:mb-4">
                <div className={`w-9 h-9 min-[480px]:w-10 min-[480px]:h-10 rounded-xl ${a.bg} flex items-center justify-center`}>
                  <Icon size={18} className={a.icon} />
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  s.up ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                }`}>
                  {s.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {s.change}
                </span>
              </div>

              <p className="text-2xl min-[480px]:text-3xl font-bold text-white mb-1">{s.value}</p>
              <p className="text-xs min-[480px]:text-sm text-slate-400">{s.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Chart ── */}
      <motion.div
        className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 min-[480px]:p-6"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.35 }}
      >
        <div className="flex items-start min-[480px]:items-center justify-between mb-4 min-[480px]:mb-6 gap-2">
          <div>
            <h3 className="text-white font-semibold text-sm min-[480px]:text-base">Grafik Distribusi Bulanan</h3>
            <p className="text-slate-400 text-xs min-[480px]:text-sm">Total pengiriman kelapa sawit (ton)</p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-700 px-2.5 py-1.5 rounded-lg flex-shrink-0">
            2025
          </span>
        </div>

        <ResponsiveContainer width="100%" height={180} className="min-[480px]:!h-[220px]">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="bulan"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="distribusi"
              stroke="#22c55e"
              strokeWidth={2.5}
              fill="url(#greenGrad)"
              dot={{ fill: "#22c55e", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#22c55e", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ── Aktivitas Terbaru ── */}
      <motion.div
        className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-4 min-[480px]:p-6"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.45 }}
      >
        <div className="flex items-center justify-between mb-4 min-[480px]:mb-5">
          <div>
            <h3 className="text-white font-semibold text-sm min-[480px]:text-base">Aktivitas Terbaru</h3>
            <p className="text-slate-400 text-xs min-[480px]:text-sm">Distribusi yang baru diproses</p>
          </div>
          <motion.button
            className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 flex-shrink-0"
            whileHover={{ x: 3 }}
            transition={{ duration: 0.15 }}
          >
            Lihat semua <ArrowRight size={12} />
          </motion.button>
        </div>

        {/* ── DESKTOP: tabel (md ke atas) ── */}
        <div className="hidden md:block space-y-1">
          <div className="flex items-center gap-4 px-4 pb-2 border-b border-slate-700/50">
            <span className="text-xs text-slate-500 w-14 flex-shrink-0">ID</span>
            <span className="text-xs text-slate-500 flex-1">Distributor</span>
            <span className="text-xs text-slate-500 w-24 flex-shrink-0">Lokasi</span>
            <span className="text-xs text-slate-500 w-24 flex-shrink-0 text-center">Status</span>
            <span className="text-xs text-slate-500 w-24 flex-shrink-0 text-right">Waktu</span>
          </div>

          {activities.map((a, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-700/40 transition-colors cursor-default"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.07, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ x: 4 }}
            >
              <span className="text-xs font-mono text-slate-500 w-14 flex-shrink-0">{a.id}</span>
              <span className="text-sm text-white flex-1 font-medium">{a.distributor}</span>
              <span className="text-sm text-slate-400 w-24 flex-shrink-0">{a.lokasi}</span>
              <span className={`text-xs font-medium px-3 py-1 rounded-full w-24 text-center flex-shrink-0 ${statusStyle[a.status]}`}>
                {a.status}
              </span>
              <span className="text-xs text-slate-500 w-24 text-right flex-shrink-0">{a.time}</span>
            </motion.div>
          ))}
        </div>

        {/* ── MOBILE: card list (di bawah md) ── */}
        <div className="md:hidden space-y-2">
          {activities.map((a, i) => (
            <motion.div
              key={i}
              className="bg-slate-700/30 border border-slate-700/50 rounded-xl p-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.07, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono text-slate-500">{a.id}</span>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusStyle[a.status]}`}>
                  {a.status}
                </span>
              </div>

              <p className="text-sm text-white font-medium mb-1">{a.distributor}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{a.lokasi}</span>
                <span className="text-xs text-slate-500">{a.time}</span>
              </div>
            </motion.div>
          ))}
        </div>

      </motion.div>
    </div>
  );
}