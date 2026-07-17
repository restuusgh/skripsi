import { useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Printer, Download, Truck, CheckCircle2,
  Clock, Package, MapPin, User, Hash, Calendar,
  Building2, Phone, FileText,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

// ── Dummy data surat jalan lengkap ────────────────────────────────────────────
const DUMMY_SURAT = {
  2: {
    id: 2,
    noSuratJalan:     "SJ-2025-0048",
    tanggal:          "2025-07-14",
    status:           "dalam_perjalanan",

    // Kendaraan & supir
    noKendaraan:      "D 8821 AB",
    namaSupir:        "Budi Santoso",
    noTeleponSupir:   "0812-3456-7890",

    // Pengirim
    pengirim: {
      nama:     "PT Sawit Nusantara",
      alamat:   "Jl. Perkebunan Raya No. 1, Ciamis, Jawa Barat",
      telp:     "(0265) 771234",
      pic:      "Agus Setiawan",
    },

    // Penerima
    penerima: {
      nama:     "PT Nusantara Sawit",
      alamat:   "Jl. Raya Cikaret No. 5, Bogor, Jawa Barat",
      telp:     "(0251) 889900",
      pic:      "Rina Wijaya",
    },

    // Barang
    items: [
      { no: 1, nama: "Kernel Palm Oil", jumlah: 8200, satuan: "kg", keterangan: "Dikemas dalam drum 200L" },
    ],

    // Estimasi
    tanggalEstimasi: "2025-07-15",
    catatan:         "Harap berhati-hati saat pembongkaran. Simpan di tempat kering.",
  },

  1: {
    id: 1,
    noSuratJalan:     "SJ-2025-0041",
    tanggal:          "2025-07-10",
    status:           "selesai",
    noKendaraan:      "D 4410 CD",
    namaSupir:        "Budi Santoso",
    noTeleponSupir:   "0812-3456-7890",
    pengirim: {
      nama:     "PT Sawit Nusantara",
      alamat:   "Jl. Perkebunan Raya No. 1, Ciamis, Jawa Barat",
      telp:     "(0265) 771234",
      pic:      "Agus Setiawan",
    },
    penerima: {
      nama:     "CV Maju Jaya",
      alamat:   "Jl. Industri No. 12, Bandung, Jawa Barat",
      telp:     "(022) 601234",
      pic:      "Herman Susilo",
    },
    items: [
      { no: 1, nama: "CPO (Crude Palm Oil)", jumlah: 12500, satuan: "kg", keterangan: "Tangki 1" },
    ],
    tanggalEstimasi: "2025-07-11",
    catatan:         "",
  },

  5: {
    id: 5,
    noSuratJalan:     "SJ-2025-0055",
    tanggal:          "2025-07-18",
    status:           "pending",
    noKendaraan:      "D 5533 EF",
    namaSupir:        "Budi Santoso",
    noTeleponSupir:   "0812-3456-7890",
    pengirim: {
      nama:     "PT Sawit Nusantara",
      alamat:   "Jl. Perkebunan Raya No. 1, Ciamis, Jawa Barat",
      telp:     "(0265) 771234",
      pic:      "Agus Setiawan",
    },
    penerima: {
      nama:     "PT Kelapa Mas",
      alamat:   "Jl. Gatot Subroto No. 3, Jakarta Selatan",
      telp:     "(021) 525800",
      pic:      "Dewi Lestari",
    },
    items: [
      { no: 1, nama: "CPO (Crude Palm Oil)", jumlah: 9800, satuan: "kg", keterangan: "Tangki utama" },
    ],
    tanggalEstimasi: "2025-07-19",
    catatan:         "Pastikan tangki dalam keadaan bersih sebelum pengisian.",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt     = (n)   => new Intl.NumberFormat("id-ID").format(n);
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
const fmtDateShort = (iso) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
  });

const STATUS_CFG = {
  pending:          { label: "Menunggu",         bg: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Clock        },
  dalam_perjalanan: { label: "Dalam Perjalanan", bg: "bg-blue-500/10 text-blue-400 border-blue-500/20",   icon: Truck        },
  selesai:          { label: "Selesai",           bg: "bg-green-500/10 text-[#22c55e] border-green-500/20", icon: CheckCircle2 },
};

// ── Halaman utama ─────────────────────────────────────────────────────────────
const SuratJalan = () => {
  const navigate    = useNavigate();
  const [params]    = useSearchParams();
  const id          = Number(params.get("id")) || 2;
  const data        = DUMMY_SURAT[id] ?? DUMMY_SURAT[2];
  const printRef    = useRef(null);
  const cfg         = STATUS_CFG[data.status];
  const StatusIcon  = cfg.icon;

  const handlePrint = () => window.print();

  return (
    <>
      {/* ── Print style (hanya aktif saat window.print()) ── */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #print-area { display: block !important; }
          #print-area {
            position: fixed; inset: 0;
            background: white; color: black;
            font-family: Arial, sans-serif;
            padding: 32px; font-size: 12px;
          }
        }
      `}</style>

      <div className="min-h-full p-6 sm:p-8">

        {/* ── Toolbar ── */}
        <motion.div
          className="flex items-center justify-between mb-6 flex-wrap gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-3 transition-colors group"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              Kembali
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Surat Jalan</h1>
            <p className="text-slate-400 text-sm mt-0.5">Dokumen pengiriman resmi</p>
          </div>

          {/* Aksi */}
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#1a2440] border border-[#26314a] text-slate-300 hover:text-white hover:border-slate-500 transition-all"
            >
              <Printer size={15} />
              Cetak
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#22c55e] text-[#0c1325] hover:bg-[#16a34a] transition-all"
            >
              <Download size={15} />
              Unduh PDF
            </button>
          </div>
        </motion.div>

        {/* ── Status chip + no. SJ ── */}
        <motion.div
          className="flex items-center gap-3 mb-5 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
        >
          <span className="font-mono text-white text-base font-bold bg-[#1a2440] border border-[#26314a] px-3 py-1.5 rounded-xl">
            {data.noSuratJalan}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.bg}`}>
            <StatusIcon size={12} />
            {cfg.label}
          </span>
        </motion.div>

        {/* ── Dokumen surat jalan ── */}
        <motion.div
          id="print-area"
          ref={printRef}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-3xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ color: "#111" }}
        >

          {/* ── Kop surat ── */}
          <div className="bg-[#0f3d1f] px-8 pt-7 pb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-[#22c55e] flex items-center justify-center">
                    <Package size={20} className="text-[#0f3d1f]" />
                  </div>
                  <div>
                    <p className="text-white font-black text-lg leading-none">PT Sawit Nusantara</p>
                    <p className="text-green-300 text-xs">Distribusi Kelapa Sawit</p>
                  </div>
                </div>
                <p className="text-green-200 text-xs mt-2 leading-relaxed">
                  Jl. Perkebunan Raya No. 1, Ciamis, Jawa Barat 46200<br />
                  Telp: (0265) 771234 &nbsp;|&nbsp; info@sawitnusantara.co.id
                </p>
              </div>

              {/* Judul dokumen */}
              <div className="text-right shrink-0">
                <p className="text-white font-black text-2xl tracking-wider">SURAT JALAN</p>
                <p className="text-green-300 text-xs font-mono mt-0.5">{data.noSuratJalan}</p>
                <p className="text-green-200 text-xs mt-1">{fmtDateShort(data.tanggal)}</p>
              </div>
            </div>
          </div>

          {/* ── Body dokumen ── */}
          <div className="px-8 py-7 bg-white">

            {/* Info kendaraan & supir */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-7 pb-6 border-b border-gray-200">
              {[
                { icon: Truck,    label: "No. Kendaraan",    val: data.noKendaraan       },
                { icon: User,     label: "Nama Supir",       val: data.namaSupir         },
                { icon: Phone,    label: "No. Telepon Supir",val: data.noTeleponSupir    },
                { icon: Calendar, label: "Tgl Estimasi Tiba",val: fmtDateShort(data.tanggalEstimasi) },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={13} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">{label}</p>
                    <p className="text-gray-800 text-sm font-semibold">{val}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pengirim & Penerima */}
            <div className="grid grid-cols-2 gap-5 mb-7">
              {[
                { title: "Pengirim", data: data.pengirim, accent: "border-l-green-600" },
                { title: "Penerima", data: data.penerima, accent: "border-l-blue-500"  },
              ].map(({ title, data: d, accent }) => (
                <div key={title} className={`border-l-4 pl-4 ${accent}`}>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">{title}</p>
                  <div className="flex items-start gap-2 mb-1">
                    <Building2 size={13} className="text-gray-400 mt-0.5 shrink-0" />
                    <p className="text-gray-800 font-bold text-sm leading-snug">{d.nama}</p>
                  </div>
                  <div className="flex items-start gap-2 mb-1">
                    <MapPin size={12} className="text-gray-400 mt-0.5 shrink-0" />
                    <p className="text-gray-500 text-xs leading-snug">{d.alamat}</p>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <Phone size={12} className="text-gray-400 shrink-0" />
                    <p className="text-gray-500 text-xs">{d.telp}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={12} className="text-gray-400 shrink-0" />
                    <p className="text-gray-500 text-xs">PIC: <span className="font-semibold text-gray-700">{d.pic}</span></p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabel barang */}
            <div className="mb-7">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-3">Daftar Barang</p>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2.5 text-left text-xs font-bold text-gray-500 w-8">No</th>
                    <th className="border border-gray-200 px-3 py-2.5 text-left text-xs font-bold text-gray-500">Nama Barang</th>
                    <th className="border border-gray-200 px-3 py-2.5 text-right text-xs font-bold text-gray-500">Jumlah</th>
                    <th className="border border-gray-200 px-3 py-2.5 text-center text-xs font-bold text-gray-500">Satuan</th>
                    <th className="border border-gray-200 px-3 py-2.5 text-left text-xs font-bold text-gray-500">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.no} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-3 py-3 text-center text-gray-500 text-xs">{item.no}</td>
                      <td className="border border-gray-200 px-3 py-3 font-semibold text-gray-800">{item.nama}</td>
                      <td className="border border-gray-200 px-3 py-3 text-right font-bold text-gray-800">{fmt(item.jumlah)}</td>
                      <td className="border border-gray-200 px-3 py-3 text-center text-gray-500">{item.satuan}</td>
                      <td className="border border-gray-200 px-3 py-3 text-gray-500 text-xs">{item.keterangan || "-"}</td>
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr className="bg-[#f0fdf4]">
                    <td className="border border-gray-200 px-3 py-2.5" colSpan={2}>
                      <span className="text-xs font-bold text-gray-600">TOTAL</span>
                    </td>
                    <td className="border border-gray-200 px-3 py-2.5 text-right font-black text-[#166534]">
                      {fmt(data.items.reduce((s, i) => s + i.jumlah, 0))}
                    </td>
                    <td className="border border-gray-200 px-3 py-2.5 text-center text-xs text-gray-500">
                      {data.items[0]?.satuan}
                    </td>
                    <td className="border border-gray-200 px-3 py-2.5" />
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Catatan */}
            {data.catatan && (
              <div className="mb-7 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2.5">
                <FileText size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-700 text-xs font-bold mb-0.5">Catatan</p>
                  <p className="text-amber-800 text-xs leading-relaxed">{data.catatan}</p>
                </div>
              </div>
            )}

            {/* Tanda tangan */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {["Pengirim", "Supir / Pembawa", "Penerima"].map((label, i) => (
                <div key={label} className="text-center">
                  <p className="text-gray-500 text-xs font-semibold mb-1">{label}</p>

                  {/* Kotak tanda tangan */}
                  <div className="border border-gray-300 border-dashed rounded-xl h-20 mb-3 bg-gray-50 flex items-center justify-center">
                    {/* Jika status selesai, supir sudah TT */}
                    {data.status === "selesai" && i === 1 && (
                      <div className="flex flex-col items-center gap-1">
                        <CheckCircle2 size={18} className="text-green-500" />
                        <span className="text-[10px] text-green-600 font-semibold">Ditandatangani</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-400 pt-1.5 mx-2">
                    <p className="text-gray-700 text-xs font-bold">
                      {i === 0 ? data.pengirim.pic : i === 1 ? data.namaSupir : data.penerima.pic}
                    </p>
                    <p className="text-gray-400 text-[10px]">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer dokumen */}
            <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Hash size={11} className="text-gray-300" />
                <p className="text-gray-300 text-[10px] font-mono">{data.noSuratJalan}</p>
              </div>
              <p className="text-gray-300 text-[10px]">
                Dicetak pada {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
              <p className="text-gray-300 text-[10px]">Dokumen resmi — harap disimpan</p>
            </div>
          </div>
        </motion.div>

        {/* ── Info di bawah dokumen ── */}
        <motion.p
          className="text-center text-xs text-slate-600 mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Dokumen ini sah tanpa tanda tangan basah apabila dicetak dari sistem resmi.
        </motion.p>
      </div>
    </>
  );
};

export default SuratJalan;