import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3, PackageCheck, X,
  Package, ChevronRight, LogOut, User,
} from "lucide-react";

// ── Nav items ─────────────────────────────────────────────────────────────────
export const NAV_ITEMS = [
  {
    path:  "/kepala-gudang/monitoring",
    label: "Monitoring Stok",
    icon:  BarChart3,
    desc:  "Pantau level stok gudang",
  },
  {
    path:  "/kepala-gudang/update-stok",
    label: "Update Stok",
    icon:  PackageCheck,
    desc:  "Tambah atau kurangi stok",
  },
];

// ── Aksen warna: rose ─────────────────────────────────────────────────────────
export const ACCENT = {
  bg:      "#f43f5e",
  bgLight: "rgba(244,63,94,0.10)",
  bgHover: "rgba(244,63,94,0.06)",
  text:    "#fb7185",
  border:  "rgba(244,63,94,0.25)",
};

// ── Dummy user (ganti dengan useAuth()) ──────────────────────────────────────
export const USER = {
  nama:   "Siti Rahayu",
  email:  "siti.gudang@sawit.id",
  avatar: "https://i.pravatar.cc/100?img=5",
};

// ── Komponen ──────────────────────────────────────────────────────────────────
const SidebarKepalaGudang = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full" style={{ background: "#0c1325" }}>

      {/* Brand */}
      <div
        className="px-5 py-5 flex items-center justify-between border-b"
        style={{ borderColor: "#1c2740" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: ACCENT.bgLight, border: `1px solid ${ACCENT.border}` }}
          >
            <Package size={18} style={{ color: ACCENT.text }} />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">SI Distribusi</p>
            <p className="text-xs mt-0.5" style={{ color: ACCENT.text }}>Sawit</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Info user */}
      <div
        className="mx-3 mt-3 rounded-xl px-4 py-3 border"
        style={{ background: ACCENT.bgLight, borderColor: ACCENT.border }}
      >
        <div className="flex items-center gap-3">
          <img
            src={USER.avatar}
            alt="avatar"
            className="w-9 h-9 rounded-lg object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{USER.nama}</p>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
              style={{ color: ACCENT.text, background: ACCENT.bgLight, borderColor: ACCENT.border }}
            >
              Kepala Gudang
            </span>
          </div>
        </div>
      </div>

      {/* Navigasi */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p
          className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2"
          style={{ color: "#3a4863" }}
        >
          Menu Utama
        </p>

        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon, desc }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border ${
                  isActive ? "" : "border-transparent"
                }`
              }
              style={({ isActive }) => ({
                background:  isActive ? ACCENT.bgLight : "transparent",
                borderColor: isActive ? ACCENT.border  : "transparent",
              })}
              onMouseEnter={(e) => {
                const isActive = e.currentTarget.style.background !== "transparent";
                if (!isActive) e.currentTarget.style.background = ACCENT.bgHover;
              }}
              onMouseLeave={(e) => {
                const isActive = e.currentTarget.style.borderColor !== "transparent";
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              {({ isActive }) => (
                <>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
                    style={{
                      background: isActive ? ACCENT.bgLight : "#1a2440",
                      color:      isActive ? ACCENT.text    : "#5b6c87",
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold leading-none truncate"
                      style={{ color: isActive ? ACCENT.text : "#cbd5e1" }}
                    >
                      {label}
                    </p>
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: "#3a4863" }}>
                      {desc}
                    </p>
                  </div>
                  {isActive && (
                    <ChevronRight size={14} style={{ color: ACCENT.text, flexShrink: 0 }} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div
        className="px-3 pb-4 pt-3 border-t flex flex-col gap-1"
        style={{ borderColor: "#1c2740" }}
      >
        <button
          onClick={() => navigate("/kepala-gudang/profil")}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-[#1a2440] flex items-center justify-center">
            <User size={14} className="text-slate-500" />
          </div>
          Profil Saya
        </button>

        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-[#1a2440] flex items-center justify-center">
            <LogOut size={14} className="text-red-500" />
          </div>
          Logout
        </button>
      </div>
    </div>
  );
};

export default SidebarKepalaGudang;