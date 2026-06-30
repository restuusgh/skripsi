import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, ChevronDown, LogOut, User, Settings, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasNotif, setHasNotif] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Tutup dropdown saat klik luar
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto focus search input saat terbuka di mobile
  useEffect(() => {
    if (showSearch) searchRef.current?.focus();
  }, [showSearch]);

  return (
    <>
      <header className="bg-slate-900 px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center border-b border-slate-800 sticky top-0 z-30">

        {/* ── Kiri: Title — sembunyikan subtitle di mobile ── */}
        <motion.div
          className="pl-10 lg:pl-0" // beri ruang untuk hamburger button di mobile
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-base sm:text-xl font-bold text-white leading-tight">
            Dashboard Admin
          </h2>
          <p className="hidden sm:block text-slate-400 text-sm">
            Sistem Informasi Distribusi Kelapa Sawit
          </p>
        </motion.div>

        {/* ── Kanan: Actions ── */}
        <motion.div
          className="flex items-center gap-2 sm:gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >

          {/* Search — desktop: selalu tampil, mobile: icon toggle */}
          <div className="relative">
            {/* Desktop search */}
            <div className="hidden sm:block relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Cari..."
                className="pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all duration-200 w-40 focus:w-52"
              />
            </div>

            {/* Mobile: icon search toggle */}
            <motion.button
              className="sm:hidden p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"
              onClick={() => setShowSearch(true)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
            >
              <Search size={17} />
            </motion.button>
          </div>

          {/* Bell */}
          <motion.button
            className="relative p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => setHasNotif(false)}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <motion.span
              animate={hasNotif ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Bell size={17} />
            </motion.span>
            <AnimatePresence>
              {hasNotif && (
                <motion.span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-green-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                />
              )}
            </AnimatePresence>
          </motion.button>

          {/* Avatar + Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <motion.button
              className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:pr-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowDropdown(!showDropdown)}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <img
                src="https://i.pravatar.cc/100"
                alt="avatar"
                className="w-7 h-7 rounded-lg object-cover"
              />
              {/* Nama hanya tampil di sm ke atas */}
              <span className="hidden sm:inline text-sm text-white font-medium">Admin</span>
              <motion.span
                animate={{ rotate: showDropdown ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={13} className="text-slate-400" />
              </motion.span>
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50"
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0,  scale: 1  }}
                  exit={{   opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Info user */}
                  <div className="px-4 py-3 border-b border-slate-700">
                    <p className="text-sm text-white font-medium">Admin</p>
                    <p className="text-xs text-slate-400">admin@sawit.id</p>
                  </div>

                  {[
                    { icon: User,     label: "Profil Saya"  },
                    { icon: Settings, label: "Pengaturan"   },
                  ].map(({ icon: Icon, label }, i) => (
                    <motion.button
                      key={i}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Icon size={14} className="text-slate-400" />
                      {label}
                    </motion.button>
                  ))}

                  <div className="border-t border-slate-700 mx-3 my-1" />

                  <motion.button
                    className="flex items-center gap-3 w-full px-4 py-2.5 mb-1 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.15 }}
                  >
                    <LogOut size={14} />
                    Logout
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </motion.div>
      </header>

      {/* ── Mobile Search Overlay ── */}
      <AnimatePresence>
        {showSearch && (
          <>
            {/* Backdrop */}
            <motion.div
              className="sm:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowSearch(false)}
            />

            {/* Search bar slide dari atas */}
            <motion.div
              className="sm:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3"
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0,   opacity: 1 }}
              exit={{   y: -60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
            >
              <Search size={16} className="text-slate-400 flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Cari menu, data, distribusi..."
                className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 outline-none"
              />
              <motion.button
                onClick={() => setShowSearch(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <X size={18} />
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}