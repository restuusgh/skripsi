import { motion, AnimatePresence } from "framer-motion";
import { Truck, ClipboardCheck, FileText, LogOut, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

// ── Variants (sama persis dengan Sidebar admin) ───────
const sidebarVariants = {
  hidden: { x: -40, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

const navContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const navItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

const drawerVariants = {
  hidden: {
    x: "-100%", opacity: 0,
    transition: {
      type: "spring", stiffness: 400, damping: 40,
      when: "afterChildren", staggerChildren: 0.03, staggerDirection: -1,
    },
  },
  visible: {
    x: 0, opacity: 1,
    transition: {
      type: "spring", stiffness: 300, damping: 30,
      when: "beforeChildren", staggerChildren: 0.05, delayChildren: 0.1,
    },
  },
};

const drawerItemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
};

const backdropVariants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: { opacity: 1, backdropFilter: "blur(4px)", transition: { duration: 0.25 } },
};

// ── Menu supir ────────────────────────────────────────
const menus = [
  { name: "Data Distribusi",      path: "/supir/distribusi",   icon: Truck          },
  { name: "Konfirmasi Distribusi", path: "/supir/konfirmasi",   icon: ClipboardCheck },
  { name: "Surat Jalan",          path: "/supir/surat-jalan",  icon: FileText       },
];

// ── Hamburger Icon ────────────────────────────────────
function HamburgerIcon({ isOpen }) {
  return (
    <div className="w-5 h-5 relative flex flex-col justify-center items-center">
      <motion.span className="absolute h-0.5 w-5 bg-white rounded-full"
        animate={isOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.span className="absolute h-0.5 bg-white rounded-full"
        animate={isOpen ? { width: 0, opacity: 0 } : { width: 20, opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
      <motion.span className="absolute h-0.5 w-5 bg-white rounded-full"
        animate={isOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

// ── SidebarContent ────────────────────────────────────
function SidebarContent({ onClose, isMobile = false }) {
  const itemWrapper = isMobile ? drawerItemVariants : navItemVariants;

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <motion.div
        className="p-6 border-b border-slate-800 flex items-center justify-between"
        variants={isMobile ? drawerItemVariants : undefined}
        initial={isMobile ? "hidden" : { opacity: 0 }}
        animate={isMobile ? "visible" : { opacity: 1 }}
        transition={isMobile ? undefined : { delay: 0.1, duration: 0.3 }}
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center flex-shrink-0"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <span className="text-white text-xs font-bold">SI</span>
          </motion.div>
          <div>
            <h1 className="text-sm font-bold leading-tight">SI Distribusi Sawit</h1>
            <p className="text-[10px] text-amber-400 font-semibold">Portal Supir</p>
          </div>
        </div>

        {onClose && (
          <motion.button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <X size={18} />
          </motion.button>
        )}
      </motion.div>

      {/* Nav */}
      <motion.nav
        className="p-4 flex-1 overflow-y-auto"
        variants={isMobile ? undefined : navContainerVariants}
        initial={isMobile ? undefined : "hidden"}
        animate={isMobile ? undefined : "visible"}
      >
        {menus.map((menu, index) => {
          const Icon = menu.icon;
          return (
            <motion.div
              key={index}
              variants={itemWrapper}
              whileHover="hovered"
              initial="rest"
              animate="rest"
              custom={index}
            >
              <NavLink
                to={menu.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl mb-2 relative overflow-hidden ${
                    isActive ? "bg-amber-600 text-white" : "text-slate-400"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {!isActive && (
                      <motion.span
                        className="absolute inset-0 rounded-xl bg-slate-700/60"
                        variants={{
                          rest:    { scaleX: 0, originX: 0, opacity: 0 },
                          hovered: { scaleX: 1, originX: 0, opacity: 1 },
                        }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                    {!isActive && (
                      <motion.span
                        className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-amber-400"
                        variants={{
                          rest:    { scaleY: 0, opacity: 0 },
                          hovered: { scaleY: 1, opacity: 1 },
                        }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                      />
                    )}
                    <motion.span
                      className="relative z-10"
                      variants={{
                        rest:    { scale: 1,   rotate: 0,  color: isActive ? "#fff" : "#94a3b8" },
                        hovered: { scale: 1.2, rotate: -8, color: "#fbbf24" },
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Icon size={20} />
                    </motion.span>
                    <motion.span
                      className="relative z-10 text-sm font-medium flex-1"
                      variants={{
                        rest:    { x: 0, color: isActive ? "#fff" : "#94a3b8" },
                        hovered: { x: 3, color: "#ffffff" },
                      }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                    >
                      {menu.name}
                    </motion.span>
                    {!isActive && (
                      <motion.span
                        className="relative z-10 text-amber-400"
                        variants={{
                          rest:    { opacity: 0, x: -6 },
                          hovered: { opacity: 1, x: 0 },
                        }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </motion.span>
                    )}
                    {isActive && (
                      <motion.span
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-white relative z-10"
                        layoutId="active-dot-supir"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </motion.nav>

      {/* Logout */}
      <motion.div
        className="p-4 border-t border-slate-800"
        variants={isMobile ? drawerItemVariants : undefined}
        initial={isMobile ? "hidden" : { opacity: 0, y: 10 }}
        animate={isMobile ? "visible" : { opacity: 1, y: 0 }}
        transition={isMobile ? undefined : { delay: 0.4, duration: 0.3 }}
        whileHover="hovered"
      >
        <motion.button
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 relative overflow-hidden"
          whileTap={{ scale: 0.97 }}
        >
          <motion.span
            className="absolute inset-0 rounded-xl bg-red-500"
            variants={{ rest: { scaleX: 0, originX: 0 }, hovered: { scaleX: 1, originX: 0 } }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.span
            className="relative z-10"
            variants={{ rest: { rotate: 0, color: "#94a3b8" }, hovered: { rotate: -15, color: "#fff" } }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <LogOut size={20} />
          </motion.span>
          <motion.span
            className="relative z-10 text-sm font-medium"
            variants={{ rest: { x: 0, color: "#94a3b8" }, hovered: { x: 3, color: "#fff" } }}
            transition={{ duration: 0.18 }}
          >
            Logout
          </motion.span>
        </motion.button>
      </motion.div>
    </div>
  );
}

// ── Export ────────────────────────────────────────────
export default function SidebarSupir() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop */}
      <motion.aside
        className="hidden lg:flex w-64 bg-slate-900 text-white min-h-screen flex-col border-r border-slate-700/50 flex-shrink-0"
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
      >
        <SidebarContent onClose={null} isMobile={false} />
      </motion.aside>

      {/* Mobile — Hamburger */}
      <motion.button
        onClick={() => setMobileOpen((prev) => !prev)}
        className="lg:hidden fixed top-3.5 left-4 z-50 p-2.5 rounded-xl bg-slate-800 border border-slate-700 shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
      >
        <HamburgerIcon isOpen={mobileOpen} />
      </motion.button>

      {/* Mobile — Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 z-40 bg-black/60"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile — Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            className="lg:hidden fixed top-0 left-0 h-full w-72 bg-slate-900 text-white z-50 border-r border-slate-700/50 shadow-2xl flex flex-col"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-amber-500/40 to-transparent"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              exit={{ scaleY: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
            <SidebarContent onClose={() => setMobileOpen(false)} isMobile={true} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}