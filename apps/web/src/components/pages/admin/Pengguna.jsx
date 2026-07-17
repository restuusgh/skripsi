import { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  UserCog,
  UserX,
  Search,
  Download,
  FileText,
  RefreshCw,
  Pencil,
  Trash2,
  KeyRound,
} from "lucide-react";

// ------------------------------------------------------------------
// Dummy data - ganti dengan data dari API/backend Anda
// ------------------------------------------------------------------
const initialUsers = [
  {
    id: 1,
    nama: "Andi Saputra",
    email: "andi.saputra@sidistribusi.id",
    role: "Admin",
    status: "Aktif",
    terakhirLogin: "17 Jul 2026, 08:12",
  },
  {
    id: 2,
    nama: "Sri Wahyuni",
    email: "sri.wahyuni@sidistribusi.id",
    role: "Staff Gudang",
    status: "Aktif",
    terakhirLogin: "17 Jul 2026, 07:45",
  },
  {
    id: 3,
    nama: "Budi Hartono",
    email: "budi.hartono@sidistribusi.id",
    role: "Staff Distribusi",
    status: "Aktif",
    terakhirLogin: "16 Jul 2026, 19:30",
  },
  {
    id: 4,
    nama: "Dewi Lestari",
    email: "dewi.lestari@sidistribusi.id",
    role: "Supervisor",
    status: "Nonaktif",
    terakhirLogin: "10 Jun 2026, 14:02",
  },
  {
    id: 5,
    nama: "Rian Pratama",
    email: "rian.pratama@sidistribusi.id",
    role: "Staff Distribusi",
    status: "Aktif",
    terakhirLogin: "17 Jul 2026, 06:58",
  },
];

const roleBadgeStyle = {
  Admin: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Supervisor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Staff Gudang": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Staff Distribusi": "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

function StatusBadge({ status }) {
  const isActive = status === "Aktif";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
        isActive
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : "bg-red-500/10 text-red-400 border-red-500/20"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-emerald-400" : "bg-red-400"
        }`}
      />
      {status}
    </span>
  );
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-800/60 p-5">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
      >
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-2xl font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

export default function Pengguna() {
  const [users] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Semua Role");
  const [statusFilter, setStatusFilter] = useState("Semua Status");

  const roles = ["Semua Role", "Admin", "Supervisor", "Staff Gudang", "Staff Distribusi"];
  const statuses = ["Semua Status", "Aktif", "Nonaktif"];

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.nama.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "Semua Role" || u.role === roleFilter;
      const matchStatus =
        statusFilter === "Semua Status" || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const total = users.length;
  const admin = users.filter((u) => u.role === "Admin").length;
  const staff = users.filter((u) => u.role !== "Admin").length;
  const nonaktif = users.filter((u) => u.status === "Nonaktif").length;

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-slate-200">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-700 bg-slate-800/60 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500">
            <Users className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">
              Manajemen Pengguna
            </h1>
            <p className="text-sm text-slate-400">
              Kelola seluruh akun dan hak akses pengguna sistem
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-slate-950 hover:bg-emerald-400 transition-colors">
          <UserPlus className="h-4 w-4" />
          Tambah Pengguna
        </button>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          iconBg="bg-slate-800"
          iconColor="text-slate-300"
          label="Total Pengguna"
          value={total}
        />
        <StatCard
          icon={ShieldCheck}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-400"
          label="Admin"
          value={admin}
        />
        <StatCard
          icon={UserCog}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
          label="Staff"
          value={staff}
        />
        <StatCard
          icon={UserX}
          iconBg="bg-red-500/10"
          iconColor="text-red-400"
          label="Nonaktif"
          value={nonaktif}
        />
      </div>

      {/* Search & filters */}
      <div className="mb-6 space-y-3 rounded-xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email pengguna..."
            className="w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
          >
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
          >
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>


      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/60">
        <div className="flex items-center justify-between border-b border-slate-700 p-5">
          <h2 className="font-semibold text-white">Daftar Pengguna</h2>
          <span className="text-sm text-slate-400">
            {filtered.length} dari {total}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Nama</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Terakhir Login</th>
                <th className="px-5 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-700/60 last:border-0 hover:bg-slate-800/30"
                >
                  <td className="px-5 py-3.5 font-medium text-white">
                    {u.nama}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                        roleBadgeStyle[u.role] ??
                        "bg-slate-700/30 text-slate-300 border-slate-600/40"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">
                    {u.terakhirLogin}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        title="Reset password"
                        className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition-colors"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                      <button
                        title="Edit pengguna"
                        className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-blue-400 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        title="Hapus pengguna"
                        className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Tidak ada pengguna yang cocok dengan pencarian atau filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}