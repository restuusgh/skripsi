import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Bell, Search, ChevronDown, Settings, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SidebarPimpinan, { NAV_ITEMS, ACCENT, USER } from "../SidebarPimpinan"

// ── Desktop Header ────────────────────────────────────────────────────────────
const DesktopHeader = () => {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const [showDrop,  setShowDrop]  = useState(false);
  const [hasNotif,  setHasNotif]  = useState(true);

  const current   = NAV_ITEMS.find((n) => pathname.startsWith(n.path));
  const pageTitle = current?.label ?? "Dashboard";

  return (
    <header className="hidden lg:flex sticky top-0 z-30 items-center justify-between px-8 py-3.5 border-b"
      style={{ background: "#0c1325", borderColor: "#1c2740" }}>

      <div>
        <h2 className="text-white font-bold text-lg leading-tight">{pageTitle}</h2>
        <p className="text-xs" style={{ color: "#5b6c87" }}>Sistem Informasi Distribusi Kelapa Sawit</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#5b6c87" }} />
          <input type="text" placeholder="Cari..."
            className="pl-9 pr-4 py-2 text-sm rounded-xl border text-white placeholder-slate-600 outline-none w-40 focus:w-52 transition-all"
            style={{ background: "#1a2440", borderColor: "#26314a" }}
            onFocus={(e) => { e.target.style.borderColor = ACCENT.bg; }}
            onBlur={(e)  => { e.target.style.borderColor = "#26314a"; }} />
        </div>

        {/* Bell */}
        <button className="relative p-2 rounded-xl border text-slate-400 hover:text-white"
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

        {/* Avatar */}
        <div className="relative">
          <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl border"
            style={{ background: "#1a2440", borderColor: "#26314a" }}
            onClick={() => setShowDrop(!showDrop)}>
            <img src={USER.avatar} alt="avatar" className="w-7 h-7 rounded-lg object-cover" />
            <span className="text-sm text-white font-medium">{USER.nama}</span>
            <motion.span animate={{ rotate: showDrop ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={13} style={{ color: "#5b6c87" }} />
            </motion.span>
          </button>

          <AnimatePresence>
            {showDrop && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDrop(false)} />
                <motion.div className="absolute right-0 mt-2 w-52 rounded-2xl border shadow-2xl z-50 overflow-hidden"
                  style={{ background: "#1a2440", borderColor: "#26314a" }}
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0,  scale: 1  }}
                  exit={{   opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.18 }}>

                  <div className="px-4 py-3 border-b" style={{ borderColor: "#26314a" }}>
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-white text-sm font-semibold truncate">{USER.nama}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{ color: ACCENT.text, background: ACCENT.bgLight, borderColor: ACCENT.border }}>
                        Pimpinan
                      </span>
                    </div>
                    <p className="text-xs truncate" style={{ color: "#5b6c87" }}>{USER.email}</p>
                  </div>

                  {[
                    { icon: User,     label: "Profil Saya", path: "/pimpinan/profil"     },
                    { icon: Settings, label: "Pengaturan",  path: "/pimpinan/pengaturan" },
                  ].map(({ icon: Icon, label, path }) => (
                    <motion.button key={path} whileHover={{ x: 3 }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                      onClick={() => { navigate(path); setShowDrop(false); }}>
                      <Icon size={14} className="text-slate-500" />
                      {label}
                    </motion.button>
                  ))}

                  <div className="border-t mx-3 my-1" style={{ borderColor: "#26314a" }} />
                  <motion.button whileHover={{ x: 3 }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 mb-1 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
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

// ── Mobile Header ─────────────────────────────────────────────────────────────
const MobileHeader = ({ onOpen }) => {
  const { pathname } = useLocation();
  const current      = NAV_ITEMS.find((n) => pathname.startsWith(n.path));
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b lg:hidden"
      style={{ background: "#0c1325", borderColor: "#1c2740" }}>
      <div className="flex items-center gap-3">
        <button onClick={onOpen} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
          <Menu size={20} />
        </button>
        <div>
          <p className="text-white font-bold text-sm">{current?.label ?? "Pimpinan"}</p>
          <p className="text-[11px]" style={{ color: "#5b6c87" }}>Sistem Distribusi Sawit</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg border text-slate-400"
          style={{ background: "#1a2440", borderColor: "#26314a" }}>
          <Bell size={16} />
        </button>
        <img src={USER.avatar} alt="avatar" className="w-8 h-8 rounded-lg object-cover border-2"
          style={{ borderColor: ACCENT.border }} />
      </div>
    </header>
  );
};

// ── Layout Utama ──────────────────────────────────────────────────────────────
const PimpinanLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0c1325" }}>

      {/* ── Sidebar desktop ── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r h-full" style={{ borderColor: "#1c2740" }}>
        <SidebarPimpinan />
      </aside>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)} />
            <motion.aside className="fixed left-0 top-0 bottom-0 z-50 w-72 border-r lg:hidden"
              style={{ borderColor: "#1c2740" }}
              initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}>
              <SidebarPimpinan onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Konten ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileHeader onOpen={() => setSidebarOpen(true)} />
        <DesktopHeader />
        <main className="flex-1 overflow-y-auto" style={{ background: "#0c1325" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PimpinanLayout;