import { useState, useEffect, useMemo } from "react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  UserCheck,
  UserX,
  Search,
  Pencil,
  Trash2,
  KeyRound,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import api from "../../utils/api";

// Samakan dengan enum di schema.prisma
const ROLES = ["ADMIN", "SUPIR", "KEPALA_GUDANG", "PIMPINAN"];
const ROLE_LABEL = {
  ADMIN: "Admin",
  SUPIR: "Supir",
  KEPALA_GUDANG: "Kepala Gudang",
  PIMPINAN: "Pimpinan",
};
const roleBadgeStyle = {
  ADMIN: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PIMPINAN: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  KEPALA_GUDANG: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  SUPIR: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const STATUS_LABEL = { AKTIF: "Aktif", NONAKTIF: "Nonaktif" };

const fmtTanggal = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
    : "-";

const inputCls =
  "w-full rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500";

function StatusBadge({ status }) {
  const isActive = status === "AKTIF";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
        isActive
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : "bg-red-500/10 text-red-400 border-red-500/20"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-red-400"}`} />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-800/60 p-5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-2xl font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

// ── Modal tambah / edit pengguna ──
function UserFormModal({ mode, initial, onClose, onSubmit, saving, formError }) {
  const isEdit = mode === "edit";
  const [nama, setNama] = useState(initial?.nama ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initial?.role ?? "ADMIN");
  const [status, setStatus] = useState(initial?.status ?? "AKTIF");

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { nama, email, role, status };
    if (!isEdit || password) payload.password = password;
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {isEdit ? "Edit Pengguna" : "Tambah Pengguna"}
          </h3>
          <button onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {formError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Nama</label>
            <input className={inputCls} value={nama} onChange={(e) => setNama(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Email</label>
            <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Password {isEdit && <span className="text-slate-500">(kosongkan jika tidak diubah)</span>}
            </label>
            <input
              type="password"
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEdit}
              minLength={6}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Role</label>
              <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Status</label>
              <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="AKTIF">Aktif</option>
                <option value="NONAKTIF">Nonaktif</option>
              </select>
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Simpan Perubahan" : "Tambah Pengguna"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal reset password ──
function ResetPasswordModal({ user, onClose, onSubmit, saving, formError }) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-800 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Reset Password</h3>
          <button onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-4 text-sm text-slate-400">
          Setel password baru untuk <span className="font-medium text-slate-200">{user.nama}</span>.
        </p>

        {formError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Password Baru</label>
            <input
              type="password"
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoFocus
            />
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-slate-950 hover:bg-amber-400 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Pengguna() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("SEMUA");
  const [statusFilter, setStatusFilter] = useState("SEMUA");

  const [modal, setModal] = useState(null); // { mode: "add" | "edit" | "reset", user? }
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/users");
      setUsers(res.data?.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? "Gagal memuat daftar pengguna.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch = u.nama.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = roleFilter === "SEMUA" || u.role === roleFilter;
      const matchStatus = statusFilter === "SEMUA" || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const total = users.length;
  const admin = users.filter((u) => u.role === "ADMIN").length;
  const aktif = users.filter((u) => u.status === "AKTIF").length;
  const nonaktif = users.filter((u) => u.status === "NONAKTIF").length;

  // ── CRUD handlers ──
  const handleCreate = async (payload) => {
    setSaving(true);
    setFormError(null);
    try {
      await api.post("/users", payload);
      await loadUsers();
      setModal(null);
    } catch (err) {
      setFormError(err.response?.data?.message ?? "Gagal menambah pengguna.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (payload) => {
    setSaving(true);
    setFormError(null);
    try {
      await api.put(`/users/${modal.user.id}`, payload);
      await loadUsers();
      setModal(null);
    } catch (err) {
      setFormError(err.response?.data?.message ?? "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (password) => {
    setSaving(true);
    setFormError(null);
    try {
      await api.put(`/users/${modal.user.id}`, { password });
      setModal(null);
    } catch (err) {
      setFormError(err.response?.data?.message ?? "Gagal mereset password.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Hapus pengguna "${user.nama}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await api.delete(`/users/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      alert(err.response?.data?.message ?? "Gagal menghapus pengguna.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400 gap-2">
        <Loader2 size={18} className="animate-spin" /> Memuat daftar pengguna...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-slate-200">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-700 bg-slate-800/60 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500">
            <Users className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Manajemen Pengguna</h1>
            <p className="text-sm text-slate-400">Kelola seluruh akun dan hak akses pengguna sistem</p>
          </div>
        </div>
        <button
          onClick={() => { setFormError(null); setModal({ mode: "add" }); }}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-slate-950 hover:bg-emerald-400 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Tambah Pengguna
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} iconBg="bg-slate-800" iconColor="text-slate-300" label="Total Pengguna" value={total} />
        <StatCard icon={ShieldCheck} iconBg="bg-emerald-500/10" iconColor="text-emerald-400" label="Admin" value={admin} />
        <StatCard icon={UserCheck} iconBg="bg-blue-500/10" iconColor="text-blue-400" label="Aktif" value={aktif} />
        <StatCard icon={UserX} iconBg="bg-red-500/10" iconColor="text-red-400" label="Nonaktif" value={nonaktif} />
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
            <option value="SEMUA">Semua Role</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABEL[r]}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
          >
            <option value="SEMUA">Semua Status</option>
            <option value="AKTIF">Aktif</option>
            <option value="NONAKTIF">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/60">
        <div className="flex items-center justify-between border-b border-slate-700 p-5">
          <h2 className="font-semibold text-white">Daftar Pengguna</h2>
          <span className="text-sm text-slate-400">{filtered.length} dari {total}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Nama</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Terdaftar</th>
                <th className="px-5 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-slate-700/60 last:border-0 hover:bg-slate-800/30">
                  <td className="px-5 py-3.5 font-medium text-white">{u.nama}</td>
                  <td className="px-5 py-3.5 text-slate-400">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                        roleBadgeStyle[u.role] ?? "bg-slate-700/30 text-slate-300 border-slate-600/40"
                      }`}
                    >
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">{fmtTanggal(u.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        title="Reset password"
                        onClick={() => { setFormError(null); setModal({ mode: "reset", user: u }); }}
                        className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition-colors"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                      <button
                        title="Edit pengguna"
                        onClick={() => { setFormError(null); setModal({ mode: "edit", user: u }); }}
                        className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-blue-400 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        title="Hapus pengguna"
                        onClick={() => handleDelete(u)}
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
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    Tidak ada pengguna yang cocok dengan pencarian atau filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {modal?.mode === "add" && (
        <UserFormModal
          mode="add"
          onClose={() => setModal(null)}
          onSubmit={handleCreate}
          saving={saving}
          formError={formError}
        />
      )}
      {modal?.mode === "edit" && (
        <UserFormModal
          mode="edit"
          initial={modal.user}
          onClose={() => setModal(null)}
          onSubmit={handleUpdate}
          saving={saving}
          formError={formError}
        />
      )}
      {modal?.mode === "reset" && (
        <ResetPasswordModal
          user={modal.user}
          onClose={() => setModal(null)}
          onSubmit={handleResetPassword}
          saving={saving}
          formError={formError}
        />
      )}
    </div>
  );
}