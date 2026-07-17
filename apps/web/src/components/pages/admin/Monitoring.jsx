import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import {
  Truck, MapPin, Clock, CheckCircle2, AlertTriangle, Package,
  Search, Loader2, Warehouse, Building2, Navigation, Filter,
  ChevronRight, Activity,
} from "lucide-react";

const API_BASE = "http://localhost:4000/api/monitoring";

// --- Icon marker kustom (tema hijau, sesuai dashboard) ---
function markerIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};border:2px solid #0c1325;
      box-shadow:0 0 0 3px ${color}33;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

const ICON_KENDARAAN = markerIcon("#22c55e");
const ICON_GUDANG = markerIcon("#f0b13e");
const ICON_DISTRIBUTOR = markerIcon("#3b82f6");

// --- Data dummy (ganti dengan fetch ke API_BASE) ---
const DUMMY_STATS = {
  totalPengiriman: 24,
  sedangJalan: 6,
  selesai: 15,
  terlambat: 2,
  kendaraanAktif: 3,
};

const DUMMY_KENDARAAN = [
  {
    id: 1,
    plat: "B 9123 XX",
    supir: "Budi Santoso",
    lokasi: "Kota Medan",
    lat: 3.5952,
    lng: 98.6722,
    eta: "2 jam",
    status: "Dalam Perjalanan",
  },
  {
    id: 2,
    plat: "D 5678 CD",
    supir: "Andi Wijaya",
    lokasi: "Kota Aceh",
    lat: 5.5483,
    lng: 95.3238,
    eta: "Tiba",
    status: "Selesai",
  },
];

const DUMMY_GUDANG = [{ id: "g1", nama: "Gudang Pusat", lat: 3.5952, lng: 98.65 }];
const DUMMY_DISTRIBUTOR = [
  { id: "d1", nama: "Distributor Cirebon", lat: 3.6, lng: 98.7 },
];

const DUMMY_AKTIVITAS = [
  { id: 1, teks: "Distribusi SJ002 selesai", waktu: "5 menit lalu", Icon: CheckCircle2, color: "text-green-500" },
  { id: 2, teks: "Kendaraan B 9123 XX berangkat dari gudang", waktu: "20 menit lalu", Icon: Truck, color: "text-blue-500" },
  { id: 3, teks: "Muat barang untuk SJ003 (CPO)", waktu: "40 menit lalu", Icon: Package, color: "text-yellow-500" },
  { id: 4, teks: "Kendaraan D 5678 CD sampai di distributor", waktu: "1 jam lalu", Icon: MapPin, color: "text-slate-400" },
];

const DUMMY_DISTRIBUSI = [
  { id: 1, kode: "SJ001", produk: "CPO", tujuan: "Medan", status: "Dalam Perjalanan", progress: 75 },
  { id: 2, kode: "SJ002", produk: "Minyak Goreng", tujuan: "Aceh", status: "Selesai", progress: 100 },
  { id: 3, kode: "SJ003", produk: "CPO", tujuan: "Riau", status: "Loading", progress: 20 },
];

// --- Helper ---
function StatusBadge({ status }) {
  const map = {
    "dalam perjalanan": { bg: "bg-blue-500/10", color: "text-blue-500", label: "Dalam Perjalanan" },
    selesai: { bg: "bg-green-500/10", color: "text-green-500", label: "Selesai" },
    loading: { bg: "bg-yellow-500/10", color: "text-yellow-500", label: "Loading" },
    terlambat: { bg: "bg-red-500/10", color: "text-red-500", label: "Terlambat" },
  };
  const key = Object.keys(map).find((k) => status?.toLowerCase().includes(k));
  const s = key ? map[key] : { bg: "bg-slate-700", color: "text-slate-300", label: status };
  return (
    <span className={`${s.bg} ${s.color} px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap`}>
      {s.label}
    </span>
  );
}

function StatCard({ label, value, Icon, color }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color.bg}`}>
        <Icon size={19} className={color.text} />
      </div>
      <div>
        <div className="text-[11px] text-slate-400 font-semibold mb-0.5">{label}</div>
        <div className="text-xl font-extrabold text-slate-100">{value}</div>
      </div>
    </div>
  );
}

export default function Monitoring() {
  const [stats, setStats] = useState(DUMMY_STATS);
  const [kendaraanList, setKendaraanList] = useState(DUMMY_KENDARAAN);
  const [aktivitas, setAktivitas] = useState(DUMMY_AKTIVITAS);
  const [distribusiList, setDistribusiList] = useState(DUMMY_DISTRIBUSI);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterWilayah, setFilterWilayah] = useState("semua");
  const [search, setSearch] = useState("");
  const [selectedKendaraan, setSelectedKendaraan] = useState(DUMMY_KENDARAAN[0]);

  // --- Ganti bagian ini dengan fetch API asli saat backend monitoring sudah siap ---
  const fetchMonitoring = async () => {
    setLoading(true);
    setError("");
    try {

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoring();
    const interval = setInterval(fetchMonitoring, 30000); // refresh tiap 30 detik
    return () => clearInterval(interval);
  }, []);

  const wilayahOptions = useMemo(() => {
    const unik = new Set(distribusiList.map((d) => d.tujuan));
    return ["semua", ...unik];
  }, [distribusiList]);

  const filteredDistribusi = useMemo(() => {
    return distribusiList.filter((d) => {
      const matchStatus =
        filterStatus === "semua" || d.status.toLowerCase() === filterStatus.toLowerCase();
      const matchWilayah = filterWilayah === "semua" || d.tujuan === filterWilayah;
      const matchSearch =
        !search ||
        d.kode.toLowerCase().includes(search.toLowerCase()) ||
        d.produk.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchWilayah && matchSearch;
    });
  }, [distribusiList, filterStatus, filterWilayah, search]);

  const mapCenter = kendaraanList[0]
    ? [kendaraanList[0].lat, kendaraanList[0].lng]
    : [3.5952, 98.6722];

  return (
    <div className="bg-transparent min-h-screen">
      <div className="px-6 lg:px-8 py-8 max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="mb-7 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
            <Activity size={22} className="text-slate-900" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              Monitoring Distribusi
            </h1>
            <p className="text-slate-400 mt-0.5 text-sm">
              Pantau seluruh aktivitas distribusi secara real-time
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard label="Total Pengiriman" value={stats.totalPengiriman}
            Icon={Package} color={{ bg: "bg-green-500/10", text: "text-green-500" }} />
          <StatCard label="Sedang Jalan" value={stats.sedangJalan}
            Icon={Truck} color={{ bg: "bg-blue-500/10", text: "text-blue-500" }} />
          <StatCard label="Selesai" value={stats.selesai}
            Icon={CheckCircle2} color={{ bg: "bg-green-500/10", text: "text-green-500" }} />
          <StatCard label="Terlambat" value={stats.terlambat}
            Icon={AlertTriangle} color={{ bg: "bg-red-500/10", text: "text-red-500" }} />
          <StatCard label="Kendaraan Aktif" value={stats.kendaraanAktif}
            Icon={Navigation} color={{ bg: "bg-yellow-500/10", text: "text-yellow-500" }} />
        </div>

        {/* Filter bar */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 mb-6 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Filter</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm outline-none min-w-[150px]"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="semua">Semua Status</option>
              <option value="dalam perjalanan">Dalam Perjalanan</option>
              <option value="selesai">Selesai</option>
              <option value="loading">Loading</option>
              <option value="terlambat">Terlambat</option>
            </select>

            <select
              className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm outline-none min-w-[150px]"
              value={filterWilayah}
              onChange={(e) => setFilterWilayah(e.target.value)}
            >
              {wilayahOptions.map((w) => (
                <option key={w} value={w}>{w === "semua" ? "Semua Wilayah" : w}</option>
              ))}
            </select>

            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kode surat jalan atau produk..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Peta */}

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 mb-6 shadow-lg overflow-hidden">
        <h3 className="text-base font-extrabold text-slate-100 mb-3 tracking-tight px-1">
            Peta Distribusi
        </h3>
        <div className="relative isolate z-0 rounded-xl overflow-hidden h-[380px]">
            <MapContainer
            center={mapCenter}
            zoom={7}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%", background: "#0c1325" }}
            >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            />

            {kendaraanList.map((k) => (
                <Marker key={k.id} position={[k.lat, k.lng]} icon={ICON_KENDARAAN}>
                <Popup>
                    <strong>{k.plat}</strong><br />
                    Supir: {k.supir}<br />
                    Status: {k.status}
                </Popup>
                </Marker>
            ))}

            {DUMMY_GUDANG.map((g) => (
                <Marker key={g.id} position={[g.lat, g.lng]} icon={ICON_GUDANG}>
                <Popup>Gudang: {g.nama}</Popup>
                </Marker>
            ))}

            {DUMMY_DISTRIBUTOR.map((d) => (
                <Marker key={d.id} position={[d.lat, d.lng]} icon={ICON_DISTRIBUTOR}>
                <Popup>Distributor: {d.nama}</Popup>
                </Marker>
            ))}
            </MapContainer>
        </div>
        <div className="flex gap-5 mt-3 px-1 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Kendaraan
            </span>
            <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" /> Gudang
            </span>
            <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Distributor
            </span>
        </div>
        </div>

        {/* Tracking + Aktivitas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Tracking Kendaraan */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
            <h3 className="text-base font-extrabold text-slate-100 mb-4 tracking-tight">
              Tracking Kendaraan
            </h3>

            <div className="flex gap-2 mb-4 flex-wrap">
              {kendaraanList.map((k) => (
                <button
                  key={k.id}
                  onClick={() => setSelectedKendaraan(k)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    selectedKendaraan?.id === k.id
                      ? "bg-green-500 text-slate-900 border-green-500"
                      : "bg-transparent text-slate-300 border-slate-700"
                  }`}
                >
                  {k.plat}
                </button>
              ))}
            </div>

            {selectedKendaraan && (
              <div className="bg-slate-900 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Truck size={18} className="text-green-500" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-100">{selectedKendaraan.plat}</div>
                    <div className="text-xs text-slate-400">{selectedKendaraan.supir}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin size={13} className="text-slate-400" /> {selectedKendaraan.lokasi}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock size={13} className="text-slate-400" /> ETA {selectedKendaraan.eta}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Status</span>
                  <StatusBadge status={selectedKendaraan.status} />
                </div>
              </div>
            )}
          </div>

          {/* Aktivitas Terbaru */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
            <h3 className="text-base font-extrabold text-slate-100 mb-4 tracking-tight">
              Aktivitas Terbaru
            </h3>
            <div className="flex flex-col gap-3">
              {aktivitas.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
                    <a.Icon size={14} className={a.color} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-slate-300">{a.teks}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{a.waktu}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daftar Distribusi */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-100 tracking-tight">
              Daftar Distribusi
            </h3>
            <span className="text-xs text-slate-400">
              {loading ? "Memuat..." : `${filteredDistribusi.length} dari ${distribusiList.length}`}
            </span>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/35 rounded-xl p-3 text-sm text-red-500 mb-4 flex gap-2.5 items-start">
              <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                  <th className="py-2.5 px-2 font-semibold">Kode</th>
                  <th className="py-2.5 px-2 font-semibold">Produk</th>
                  <th className="py-2.5 px-2 font-semibold">Tujuan</th>
                  <th className="py-2.5 px-2 font-semibold">Status</th>
                  <th className="py-2.5 px-2 font-semibold">Progress</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredDistribusi.map((d) => (
                    <motion.tr
                      key={d.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-t border-slate-700"
                    >
                      <td className="py-3 px-2 font-bold text-slate-100">{d.kode}</td>
                      <td className="py-3 px-2 text-slate-300">{d.produk}</td>
                      <td className="py-3 px-2 text-slate-300">{d.tujuan}</td>
                      <td className="py-3 px-2"><StatusBadge status={d.status} /></td>
                      <td className="py-3 px-2 w-[160px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-900 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                d.progress >= 100 ? "bg-green-500" : d.progress >= 50 ? "bg-yellow-500" : "bg-blue-500"
                              }`}
                              style={{ width: `${d.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 w-9 text-right">{d.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button className="inline-flex items-center gap-1 text-xs font-semibold text-green-500 hover:text-green-400">
                          Detail <ChevronRight size={13} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {!loading && filteredDistribusi.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <Package size={28} strokeWidth={1.4} className="mx-auto mb-2" />
                <p className="text-sm">Tidak ada distribusi yang cocok dengan filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}