import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, PackageCheck, LogOut, Menu, X,
  Package, ChevronRight, Bell, Search, ChevronDown,
  User, Settings,
} from "lucide-react";

// ── Nav items kepala gudang ───────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    path:  "/kepala-gudang/monitoring",
    label: "Monitoring Stok",
    icon:  BarChart3,
    desc:  "Pantau stok gudang",
  },
  {
    path:  "/kepala-gudang/update-stok",
    label: "Update Stok",
    icon:  PackageCheck,
    desc:  "Tambah atau kurangi stok",
  },
];

// ── Dummy user ────────────────────────────────────────────────────────────────
const USER = {
  nama:   "Siti Rahayu",
  email:  "siti.gudang@sawit.id",
  avatar: "https://i.pravatar.cc/100?img=5",
};

// ── Aksen warna: rose ─────────────────────────────────────────────────────────
const ACCENT = {
  bg:      "#f43f5e",
  bgLight: "rgba(244,63,94,0.10)",
  bgHover: "rgba(244,63,94,0.06)",
  text:    "#fb7185",
  border:  "rgba(244,63,94,0.25)",
};

// ── Sidebar content ───────────────────────────────────────────────────────────
const SidebarContent = ({ onClose }) => {
  const navigate     = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => navigate("/login");

  return (
    <div className="flex flex-col h-full" style={{ background: "#0c1325" }}>

      {/* Brand */}
      <div className="px-5 py-5 flex items-center justify-between border-b" style={{ borderColor: "#1c2740" }}>
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
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5">
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
          <img src={USER.avatar} alt="avatar" className="w-9 h-9 rounded-lg object-cover shrink-0" />
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
        <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2" style={{ color: "#3a4863" }}>
          Menu Utama
        </p>
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon, desc }) => {
            const active = pathname.startsWith(path);
            return (
              <NavLink
                key={path}
                to={path}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                style={{
                  background: active ? ACCENT.bgLight : "transparent",
                  border:     `1px solid ${active ? ACCENT.border : "transparent"}`,
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = ACCENT.bgHover; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
                  style={{ background: active ? ACCENT.bgLight : "#1a2440", color: active ? ACCENT.text : "#5b6c87" }}
                >
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-none truncate" style={{ color: active ? ACCENT.text : "#cbd5e1" }}>
                    {label}
                  </p>
                  <p className="text-[11px] mt-0.5 truncate" style={{ color: "#3a4863" }}>{desc}</p>
                </div>
                {active && <ChevronRight size={14} style={{ color: ACCENT.text, flexShrink: 0 }} />}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3 border-t flex flex-col gap-1" style={{ borderColor: "#1c2740" }}>
        <button
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
          onClick={() => navigate("/kepala-gudang/profil")}
        >
          <div className="w-8 h-8 rounded-lg bg-[#1a2440] flex items-center justify-center">
            <User size={14} className="text-slate-500" />
          </div>
          Profil Saya
        </button>
        <button
          onClick={handleLogout}
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

// ── Mobile header ─────────────────────────────────────────────────────────────
const MobileHeader = ({ onOpenSidebar }) => {
  const { pathname } = useLocation();
  const current      = NAV_ITEMS.find((n) => pathname.startsWith(n.path));
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b lg:hidden"
      style={{ background: "#0c1325", borderColor: "#1c2740" }}>
      <div className="flex items-center gap-3">
        <button onClick={onOpenSidebar} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
          <Menu size={20} />
        </button>
        <div>
          <p className="text-white font-bold text-sm">{current?.label ?? "Kepala Gudang"}</p>
          <p className="text-slate-500 text-[11px]">Sistem Distribusi Sawit</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg bg-[#1a2440] border border-[#26314a] text-slate-400 hover:text-white">
          <Bell size={16} />
        </button>
        <img src={USER.avatar} alt="avatar" className="w-8 h-8 rounded-lg object-cover border-2"
          style={{ borderColor: ACCENT.border }} />
      </div>
    </header>
  );
};

// ── Desktop header ────────────────────────────────────────────────────────────
const DesktopHeader = () => {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const [showDrop,  setShowDrop]  = useState(false);
  const [hasNotif,  setHasNotif]  = useState(true);
  const current = NAV_ITEMS.find((n) => pathname.startsWith(n.path));

  return (
    <header className="hidden lg:flex sticky top-0 z-30 items-center justify-between px-8 py-3.5 border-b"
      style={{ background: "#0c1325", borderColor: "#1c2740" }}>
      <div>
        <h2 className="text-white font-bold text-lg leading-tight">{current?.label ?? "Dashboard"}</h2>
        <p className="text-slate-500 text-xs">Sistem Informasi Distribusi Kelapa Sawit</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input type="text" placeholder="Cari..."
            className="pl-9 pr-4 py-2 text-sm rounded-xl border text-white placeholder-slate-600 outline-none w-40 focus:w-52 transition-all"
            style={{ background: "#1a2440", borderColor: "#26314a" }}
            onFocus={(e) => { e.target.style.borderColor = ACCENT.bg; }}
            onBlur={(e)  => { e.target.style.borderColor = "#26314a"; }} />
        </div>

        {/* Bell */}
        <button className="relative p-2 rounded-xl border text-slate-400 hover:text-white transition-colors"
          style={{ background: "#1a2440", borderColor: "#26314a" }}
          onClick={() => setHasNotif(false)}>
          <Bell size={17} />
          <AnimatePresence>
            {hasNotif && (
              <motion.span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: ACCENT.bg }}
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} />
            )}
          </AnimatePresence>
        </button>

        {/* Avatar dropdown */}
        <div className="relative">
          <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl border transition-all"
            style={{ background: "#1a2440", borderColor: "#26314a" }}
            onClick={() => setShowDrop(!showDrop)}>
            <img src={USER.avatar} alt="avatar" className="w-7 h-7 rounded-lg object-cover" />
            <span className="text-sm text-white font-medium">{USER.nama}</span>
            <motion.span animate={{ rotate: showDrop ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={13} className="text-slate-400" />
            </motion.span>
          </button>

          <AnimatePresence>
            {showDrop && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDrop(false)} />
                <motion.div className="absolute right-0 mt-2 w-52 rounded-2xl border shadow-2xl z-50 overflow-hidden"
                  style={{ background: "#1a2440", borderColor: "#26314a" }}
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.18 }}>
                  <div className="px-4 py-3 border-b" style={{ borderColor: "#26314a" }}>
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-white text-sm font-semibold truncate">{USER.nama}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{ color: ACCENT.text, background: ACCENT.bgLight, borderColor: ACCENT.border }}>
                        Kepala Gudang
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs truncate">{USER.email}</p>
                  </div>
                  {[
                    { icon: User,     label: "Profil Saya", path: "/kepala-gudang/profil"     },
                    { icon: Settings, label: "Pengaturan",  path: "/kepala-gudang/pengaturan" },
                  ].map(({ icon: Icon, label, path }) => (
                    <motion.button key={path}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                      whileHover={{ x: 3 }}
                      onClick={() => { navigate(path); setShowDrop(false); }}>
                      <Icon size={14} className="text-slate-500" />
                      {label}
                    </motion.button>
                  ))}
                  <div className="border-t mx-3 my-1" style={{ borderColor: "#26314a" }} />
                  <motion.button
                    className="flex items-center gap-3 w-full px-4 py-2.5 mb-1 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    whileHover={{ x: 3 }}
                    onClick={() => navigate("/login")}>
                    <LogOut size={14} />
                    Logout
                  </motion.button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

// ── Layout utama ──────────────────────────────────────────────────────────────
const KepalaGudangLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0c1325" }}>

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r h-full" style={{ borderColor: "#1c2740" }}>
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)} />
            <motion.aside className="fixed left-0 top-0 bottom-0 z-50 w-72 lg:hidden border-r"
              style={{ borderColor: "#1c2740" }}
              initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}>
              <SidebarContent onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Konten */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileHeader onOpenSidebar={() => setSidebarOpen(true)} />
        <DesktopHeader />
        <main className="flex-1 overflow-y-auto" style={{ background: "#0c1325" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default KepalaGudangLayout;