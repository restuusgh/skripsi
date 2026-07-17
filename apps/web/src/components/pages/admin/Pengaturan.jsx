import { useState } from "react";
import {
  Settings,
  Building2,
  UserCircle,
  Bell,
  ShieldCheck,
  DatabaseBackup,
  Upload,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

// ------------------------------------------------------------------
// Konfigurasi tab pengaturan
// ------------------------------------------------------------------
const tabs = [
  { key: "umum", label: "Umum", icon: Building2 },
  { key: "profil", label: "Profil Akun", icon: UserCircle },
  { key: "notifikasi", label: "Notifikasi", icon: Bell },
  { key: "keamanan", label: "Keamanan", icon: ShieldCheck },
  { key: "sistem", label: "Sistem & Backup", icon: DatabaseBackup },
];

function SectionCard({ title, description, children }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-6">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
    />
  );
}

function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
    >
      {children}
    </select>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-700 bg-slate-900/40 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-200">{label}</p>
        {description && (
          <p className="text-xs text-slate-500">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-emerald-500" : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function SaveButton({ children = "Simpan Perubahan" }) {
  return (
    <div className="flex justify-end pt-2">
      <button className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-slate-950 hover:bg-emerald-400 transition-colors">
        <Save className="h-4 w-4" />
        {children}
      </button>
    </div>
  );
}

export default function Pengaturan() {
  const [activeTab, setActiveTab] = useState("umum");
  const [showPassword, setShowPassword] = useState(false);

  const [notif, setNotif] = useState({
    email: true,
    stokRendah: true,
    distribusiSelesai: true,
    distribusiGagal: true,
  });

  const [backupOtomatis, setBackupOtomatis] = useState(true);

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-slate-200">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-800/60 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500">
          <Settings className="h-6 w-6 text-slate-950" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Pengaturan</h1>
          <p className="text-sm text-slate-400">
            Kelola konfigurasi sistem, akun, dan preferensi aplikasi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        {/* Tab navigation */}
        <div className="h-fit rounded-xl border border-slate-700 bg-slate-800/60 p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-colors last:mb-0 ${
                  isActive
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-300 hover:bg-slate-700/50"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="space-y-6">
          {activeTab === "umum" && (
            <SectionCard
              title="Informasi Perusahaan"
              description="Data ini akan tampil pada laporan dan surat jalan yang dicetak"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-slate-600 bg-slate-900/60 text-slate-500">
                  <Building2 className="h-6 w-6" />
                </div>
                <button className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors">
                  <Upload className="h-4 w-4" />
                  Unggah Logo
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nama Perusahaan">
                  <TextInput defaultValue="PT Universitas Islam Nusantara" />
                </Field>
                <Field label="Nama Sistem">
                  <TextInput defaultValue="SI Distribusi Sawit" />
                </Field>
                <Field label="Email Kontak">
                  <TextInput
                    type="email"
                    defaultValue="info@sidistribusi.id"
                  />
                </Field>
                <Field label="Nomor Telepon">
                  <TextInput defaultValue="(0561) 123 456" />
                </Field>
                <Field label="Zona Waktu">
                  <Select defaultValue="WIB">
                    <option>WIB</option>
                    <option>WITA</option>
                    <option>WIT</option>
                  </Select>
                </Field>
                <Field label="Satuan Berat Default">
                  <Select defaultValue="Ton">
                    <option>Ton</option>
                    <option>Kg</option>
                  </Select>
                </Field>
                <Field label="Alamat" hint="Digunakan pada kop surat jalan">
                  <TextInput defaultValue="Jl. Industri Sawit No. 12, Pontianak" />
                </Field>
              </div>
              <SaveButton />
            </SectionCard>
          )}

          {activeTab === "profil" && (
            <SectionCard
              title="Profil Akun"
              description="Informasi ini terlihat oleh pengguna lain di sistem"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <UserCircle className="h-9 w-9" />
                </div>
                <button className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors">
                  <Upload className="h-4 w-4" />
                  Ganti Foto
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nama Lengkap">
                  <TextInput defaultValue="Andi Saputra" />
                </Field>
                <Field label="Role">
                  <TextInput defaultValue="Admin" disabled />
                </Field>
                <Field label="Email">
                  <TextInput
                    type="email"
                    defaultValue="andi.saputra@sidistribusi.id"
                  />
                </Field>
                <Field label="Nomor HP">
                  <TextInput defaultValue="0812-3456-7890" />
                </Field>
              </div>
              <SaveButton />
            </SectionCard>
          )}

          {activeTab === "notifikasi" && (
            <SectionCard
              title="Preferensi Notifikasi"
              description="Atur kapan sistem mengirimkan pemberitahuan"
            >
              <Toggle
                label="Notifikasi email"
                description="Kirim ringkasan aktivitas ke email terdaftar"
                checked={notif.email}
                onChange={(v) => setNotif((s) => ({ ...s, email: v }))}
              />
              <Toggle
                label="Stok produk rendah"
                description="Peringatan saat stok mendekati batas minimum"
                checked={notif.stokRendah}
                onChange={(v) => setNotif((s) => ({ ...s, stokRendah: v }))}
              />
              <Toggle
                label="Distribusi selesai"
                description="Pemberitahuan saat pengiriman berhasil sampai"
                checked={notif.distribusiSelesai}
                onChange={(v) =>
                  setNotif((s) => ({ ...s, distribusiSelesai: v }))
                }
              />
              <Toggle
                label="Distribusi dibatalkan"
                description="Pemberitahuan saat pengiriman gagal atau dibatalkan"
                checked={notif.distribusiGagal}
                onChange={(v) =>
                  setNotif((s) => ({ ...s, distribusiGagal: v }))
                }
              />
              <SaveButton />
            </SectionCard>
          )}

          {activeTab === "keamanan" && (
            <SectionCard
              title="Ubah Kata Sandi"
              description="Gunakan kombinasi huruf, angka, dan simbol yang kuat"
            >
              <Field label="Kata Sandi Saat Ini">
                <div className="relative">
                  <TextInput
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Kata Sandi Baru">
                  <TextInput type="password" placeholder="••••••••" />
                </Field>
                <Field label="Konfirmasi Kata Sandi Baru">
                  <TextInput type="password" placeholder="••••••••" />
                </Field>
              </div>
              <SaveButton>Perbarui Kata Sandi</SaveButton>

              <div className="mt-6 border-t border-slate-700 pt-5">
                <Toggle
                  label="Verifikasi dua langkah (2FA)"
                  description="Tambahan lapisan keamanan saat masuk ke akun"
                  checked={false}
                  onChange={() => {}}
                />
              </div>
            </SectionCard>
          )}

          {activeTab === "sistem" && (
            <SectionCard
              title="Sistem & Backup Data"
              description="Pengaturan teknis yang memengaruhi seluruh pengguna"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Ambang Batas Stok Minimum"
                  hint="Notifikasi stok rendah muncul di bawah nilai ini"
                >
                  <TextInput type="number" defaultValue={50} />
                </Field>
                <Field label="Interval Prediksi AI">
                  <Select defaultValue="Mingguan">
                    <option>Harian</option>
                    <option>Mingguan</option>
                    <option>Bulanan</option>
                  </Select>
                </Field>
              </div>

              <Toggle
                label="Backup data otomatis"
                description="Sistem menyimpan cadangan data setiap hari pukul 00:00"
                checked={backupOtomatis}
                onChange={setBackupOtomatis}
              />

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-900/40 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Backup terakhir
                  </p>
                  <p className="text-xs text-slate-500">
                    17 Jul 2026, 00:00 — berhasil
                  </p>
                </div>
                <button className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors">
                  <DatabaseBackup className="h-4 w-4" />
                  Backup Sekarang
                </button>
              </div>
              <SaveButton />
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}