import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import {
  Truck, MapPin, Clock, CheckCircle2, AlertTriangle, Package,
  Search, Loader2, Navigation, Filter, ChevronRight, Activity,
} from "lucide-react";
import api from "../../utils/api";


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
const ICON_DISTRIBUTOR = markerIcon("#3b82f6");

// Pusat peta default (Sumatera bagian utara) — dipakai kalau belum ada
// satupun kendaraan/tujuan yang punya koordinat
const DEFAULT_CENTER = [3.5952, 98.6722];

const STATUS_LABEL = {
  PROSES: { bg: "bg-blue-500/10", color: "text-blue-500", label: "Dalam Perjalanan" },
  SELESAI: { bg: "bg-green-500/10", color: "text-green-500", label: "Selesai" },
  DIBATALKAN: { bg: "bg-slate-700", color: "text-slate-300", label: "Dibatalkan" },
  TERLAMBAT: { bg: "bg-red-500/10", color: "text-red-500", label: "Terlambat" },
};

function StatusBadge({ status }) {
  const s = STATUS_LABEL[status] ?? { bg: "bg-slate-700", color: "text-slate-300", label: status };
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

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// Status tampilan: PROSES yang tanggalnya sudah lewat hari ini dianggap "Terlambat"
const displayStatus = (d) => {
  if (d.status === "PROSES" && new Date(d.tanggalDistribusi) < startOfToday()) return "TERLAMBAT";
  return d.status;
};

const namaProdukGabungan = (d) => {
  const nama = [...new Set((d.detailDistribusi || []).map((i) => i.produk?.namaProduk).filter(Boolean))];
  if (nama.length === 0) return "-";
  return nama.length > 1 ? `${nama[0]} +${nama.length - 1}` : nama[0];
};

const fmtRelativeWaktu = (iso) => {
  const menit = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (menit < 1) return "Baru saja";
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  return `${Math.floor(jam / 24)} hari lalu`;
};

const AKTIVITAS_ICON = (teks = "") => {
  const t = teks.toLowerCase();
  if (t.includes("konfirmasi") || t.includes("selesai")) return { Icon: CheckCircle2, color: "text-green-500" };
  if (t.includes("buat distribusi") || t.includes("berangkat")) return { Icon: Truck, color: "text-blue-500" };
  if (t.includes("stok") || t.includes("muat")) return { Icon: Package, color: "text-yellow-500" };
  return { Icon: Activity, color: "text-slate-400" };
};

export default function Monitoring() {
  const [distribusiList, setDistribusiList] = useState([]);
  const [kendaraanList, setKendaraanList] = useState([]);
  const [aktivitas, setAktivitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterWilayah, setFilterWilayah] = useState("semua");
  const [search, setSearch] = useState("");
  const [selectedKendaraanId, setSelectedKendaraanId] = useState(null);

  const fetchMonitoring = async () => {
    try {
      const [resDistribusi, resKendaraan, resAktivitas] = await Promise.all([
        api.get("/distribusi"),
        api.get("/kendaraan"),
        api.get("/aktivitas"),
      ]);
      setDistribusiList(resDistribusi.data?.data ?? []);
      setKendaraanList(resKendaraan.data?.data ?? []);
      setAktivitas(resAktivitas.data?.data ?? []);
      setError("");
    } catch (e) {
      setError(e.response?.data?.message ?? "Gagal memuat data monitoring.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoring();
    const interval = setInterval(fetchMonitoring, 20000); // refresh tiap 20 detik
    return () => clearInterval(interval);
  }, []);

  // Pilih kendaraan pertama yang punya lokasi begitu data datang
  useEffect(() => {
    if (selectedKendaraanId == null && kendaraanList.length > 0) {
      setSelectedKendaraanId(kendaraanList[0].id);
    }
  }, [kendaraanList, selectedKendaraanId]);

  const wilayahOptions = useMemo(() => {
    const unik = new Set(distribusiList.map((d) => d.tujuanDistribusi?.namaTujuan).filter(Boolean));
    return ["semua", ...unik];
  }, [distribusiList]);

  const filteredDistribusi = useMemo(() => {
    return distribusiList.filter((d) => {
      const status = displayStatus(d);
      const matchStatus = filterStatus === "semua" || status === filterStatus;
      const matchWilayah = filterWilayah === "semua" || d.tujuanDistribusi?.namaTujuan === filterWilayah;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        d.kodeDistribusi?.toLowerCase().includes(q) ||
        namaProdukGabungan(d).toLowerCase().includes(q);
      return matchStatus && matchWilayah && matchSearch;
    });
  }, [distribusiList, filterStatus, filterWilayah, search]);

  // ── Statistik ──
  const stats = useMemo(() => {
    const totalPengiriman = distribusiList.length;
    const sedangJalan = distribusiList.filter((d) => d.status === "PROSES").length;
    const selesai = distribusiList.filter((d) => d.status === "SELESAI").length;
    const terlambat = distribusiList.filter((d) => displayStatus(d) === "TERLAMBAT").length;
    // "Aktif" = kendaraan yang sedang ditugaskan ke distribusi berstatus PROSES
    const kendaraanAktifIds = new Set(
      distribusiList.filter((d) => d.status === "PROSES" && d.kendaraan).map((d) => d.kendaraan.id)
    );
    return { totalPengiriman, sedangJalan, selesai, terlambat, kendaraanAktif: kendaraanAktifIds.size };
  }, [distribusiList]);

  // ── Marker peta: hanya yang benar-benar punya koordinat ──
  const kendaraanBerLokasi = useMemo(() => kendaraanList.filter((k) => k.lokasi), [kendaraanList]);

  const tujuanBerLokasi = useMemo(() => {
    const map = new Map();
    distribusiList.forEach((d) => {
      const t = d.tujuanDistribusi;
      if (t?.lat != null && t?.lng != null && !map.has(t.id)) map.set(t.id, t);
    });
    return [...map.values()];
  }, [distribusiList]);

  const mapCenter =
    kendaraanBerLokasi[0]
      ? [Number(kendaraanBerLokasi[0].lokasi.lat), Number(kendaraanBerLokasi[0].lokasi.lng)]
      : tujuanBerLokasi[0]
      ? [Number(tujuanBerLokasi[0].lat), Number(tujuanBerLokasi[0].lng)]
      : DEFAULT_CENTER;

  const selectedKendaraan = kendaraanList.find((k) => k.id === selectedKendaraanId);
  const distribusiAktifSelected = distribusiList.find(
    (d) => d.status === "PROSES" && d.kendaraan?.id === selectedKendaraanId
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 gap-2">
        <Loader2 size={18} className="animate-spin" /> Memuat data monitoring...
      </div>
    );
  }

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

        {error && (
          <div className="bg-red-500/10 border border-red-500/35 rounded-xl p-3 text-sm text-red-500 mb-6 flex gap-2.5 items-start">
            <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" /> {error}
          </div>
        )}

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
              <option value="PROSES">Dalam Perjalanan</option>
              <option value="TERLAMBAT">Terlambat</option>
              <option value="SELESAI">Selesai</option>
              <option value="DIBATALKAN">Dibatalkan</option>
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

              {kendaraanBerLokasi.map((k) => (
                <Marker key={k.id} position={[Number(k.lokasi.lat), Number(k.lokasi.lng)]} icon={ICON_KENDARAAN}>
                  <Popup>
                    <strong>{k.platNomor}</strong><br />
                    Supir: {k.namaSupir}<br />
                    Update terakhir: {fmtRelativeWaktu(k.lokasi.updatedAt)}
                  </Popup>
                </Marker>
              ))}

              {tujuanBerLokasi.map((t) => (
                <Marker key={t.id} position={[Number(t.lat), Number(t.lng)]} icon={ICON_DISTRIBUTOR}>
                  <Popup>Tujuan: {t.namaTujuan}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <div className="flex gap-5 mt-3 px-1 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Kendaraan
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Tujuan Distribusi
            </span>
          </div>
          {kendaraanBerLokasi.length === 0 && tujuanBerLokasi.length === 0 && (
            <p className="text-xs text-slate-500 mt-2 px-1">
              Belum ada kendaraan yang melaporkan lokasi atau tujuan dengan koordinat.
            </p>
          )}
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
                  onClick={() => setSelectedKendaraanId(k.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    selectedKendaraanId === k.id
                      ? "bg-green-500 text-slate-900 border-green-500"
                      : "bg-transparent text-slate-300 border-slate-700"
                  }`}
                >
                  {k.platNomor}
                </button>
              ))}
              {kendaraanList.length === 0 && (
                <p className="text-sm text-slate-500">Belum ada data kendaraan.</p>
              )}
            </div>

            {selectedKendaraan && (
              <div className="bg-slate-900 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Truck size={18} className="text-green-500" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-100">{selectedKendaraan.platNomor}</div>
                    <div className="text-xs text-slate-400">{selectedKendaraan.namaSupir}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin size={13} className="text-slate-400" />
                    {selectedKendaraan.lokasi
                      ? `${Number(selectedKendaraan.lokasi.lat).toFixed(4)}, ${Number(selectedKendaraan.lokasi.lng).toFixed(4)}`
                      : "Belum ada lokasi"}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock size={13} className="text-slate-400" />
                    {selectedKendaraan.lokasi ? fmtRelativeWaktu(selectedKendaraan.lokasi.updatedAt) : "-"}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Tugas saat ini</span>
                  {distribusiAktifSelected ? (
                    <span className="text-xs font-semibold text-slate-200">
                      {distribusiAktifSelected.kodeDistribusi} → {distribusiAktifSelected.tujuanDistribusi?.namaTujuan}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">Tidak ada tugas aktif</span>
                  )}
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
              {aktivitas.slice(0, 6).map((a) => {
                const teks = a.deskripsi ? `${a.aktivitas} — ${a.deskripsi}` : a.aktivitas;
                const { Icon, color } = AKTIVITAS_ICON(a.aktivitas ?? "");
                return (
                  <div key={a.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className={color} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-300">{teks}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{fmtRelativeWaktu(a.tanggal)}</div>
                    </div>
                  </div>
                );
              })}
              {aktivitas.length === 0 && (
                <p className="text-sm text-slate-500">Belum ada aktivitas tercatat.</p>
              )}
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
              {filteredDistribusi.length} dari {distribusiList.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                  <th className="py-2.5 px-2 font-semibold">Kode</th>
                  <th className="py-2.5 px-2 font-semibold">Produk</th>
                  <th className="py-2.5 px-2 font-semibold">Tujuan</th>
                  <th className="py-2.5 px-2 font-semibold">Tanggal</th>
                  <th className="py-2.5 px-2 font-semibold">Status</th>
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
                      <td className="py-3 px-2 font-bold text-slate-100">{d.kodeDistribusi}</td>
                      <td className="py-3 px-2 text-slate-300">{namaProdukGabungan(d)}</td>
                      <td className="py-3 px-2 text-slate-300">{d.tujuanDistribusi?.namaTujuan ?? "-"}</td>
                      <td className="py-3 px-2 text-slate-300">
                        {new Date(d.tanggalDistribusi).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-3 px-2"><StatusBadge status={displayStatus(d)} /></td>
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

            {filteredDistribusi.length === 0 && (
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