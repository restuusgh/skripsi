import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/hooks/useAuth";

// ── Layouts ───────────────────────────────────────────
import AdminLayout        from "./components/layouts/AdminLayout";
import SupirLayout        from "./components/layouts/SupirLayout";
import KepalaGudangLayout from "./components/layouts/KepalaGudangLayout";
import PimpinanLayout     from "./components/layouts/PimpinanLayout";

// ── Auth ──────────────────────────────────────────────
import Login from "./components/pages/auth/Login";

// ── Admin pages ───────────────────────────────────────
import Dashboard    from "./components/pages/admin/Dashboard";
import PrediksiAI   from "./components/pages/admin/PrediksiAi";
import DataProduk   from "./components/pages/admin/DataProduk";
import Monitoring   from "./components/pages/admin/Monitoring";
import Distributor  from "./components/pages/admin/Distributor";
import Distribusi   from "./components/pages/admin/Distribusi";
import Laporan      from "./components/pages/admin/Laporan";
import Pengguna     from "./components/pages/admin/Pengguna";
import Pengaturan   from "./components/pages/admin/Pengaturan";

// ── Supir pages ───────────────────────────────────────
import DataDistribusi      from "./components/pages/supir/DataDistribusi";
import KonfirmasiDistribusi from "./components/pages/supir/KonfirmasiDistribusi";
import SuratJalan          from "./components/pages/supir/SuratJalan";

// ── Kepala Gudang pages 
import UpdateStok    from "./components/pages/kepalaGudang/UpdateStok";
import MonitoringStok from "./components/pages/kepalaGudang/MonitoringStok";

// ── Pimpinan pages 
import DashboardPimpinan from "./components/pages/pimpinan/DashboardPimpinan";
import GrafikTren           from "./components/pages/pimpinan/GrafikTren";
import LaporanPimpinan      from "./components/pages/pimpinan/Laporan";
import HasilPrediksiAI      from "./components/pages/pimpinan/HasilPrediksiAI";
import MonitoringAktivitas  from "./components/pages/pimpinan/MonitoringAktivitas";

// ── ProtectedRoute ────────────────────────────────────
// Redirect ke login jika belum auth, atau ke halaman sesuai role
function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) return null; // atau bisa return <SplashScreen />

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRole && user.role !== allowedRole) {
    // Redirect ke halaman awal sesuai role yang sebenarnya
    const roleHome = {
      ADMIN:         "/admin/dashboard",
      SUPIR:         "/supir/distribusi",
      KEPALA_GUDANG: "/kepala-gudang/monitoring",
      PIMPINAN:      "/pimpinan/dashboard",
    };
    return <Navigate to={roleHome[user.role] ?? "/login"} replace />;
  }

  return children;
}

// ── Redirect awal berdasarkan role ────────────────────
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const roleHome = {
    ADMIN:         "/admin/dashboard",
    SUPIR:         "/supir/distribusi",
    KEPALA_GUDANG: "/kepala-gudang/monitoring",
    PIMPINAN:      "/pimpinan/dashboard",
  };
  return <Navigate to={roleHome[user.role] ?? "/login"} replace />;
}

// ── App ───────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* Root — redirect sesuai role */}
        <Route path="/" element={<RootRedirect />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* ── Admin ── */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"  element={<Dashboard />} />
          <Route path="prediksiai" element={<PrediksiAI />} />
          <Route path="produk"     element={<DataProduk />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="distributor" element={<Distributor />} />
          <Route path="distribusi" element={<Distribusi />} />
          <Route path="laporan"    element={<Laporan />} />
          <Route path="pengguna"   element={<Pengguna />} />
          <Route path="pengaturan" element={<Pengaturan />} />
        </Route>

        {/* ── Supir ── */}
        <Route path="/supir" element={
          <ProtectedRoute allowedRole="SUPIR">
            <SupirLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="distribusi" replace />} />
          <Route path="distribusi"  element={<DataDistribusi />} />
          <Route path="konfirmasi"  element={<KonfirmasiDistribusi />} />
          <Route path="surat-jalan" element={<SuratJalan />} />
        </Route>

        {/* ── Kepala Gudang ── */}
        <Route path="/kepala-gudang" element={
          <ProtectedRoute allowedRole="KEPALA_GUDANG">
            <KepalaGudangLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="monitoring" replace />} />
          <Route path="monitoring" element={<MonitoringStok />} />
          <Route path="update-stok" element={<UpdateStok />} />
        </Route>

        {/* ── Pimpinan ── */}
        <Route path="/pimpinan" element={
          <ProtectedRoute allowedRole="PIMPINAN">
            <PimpinanLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"           element={<DashboardPimpinan />} />
          <Route path="grafik-tren"         element={<GrafikTren />} />
          <Route path="laporan"             element={<LaporanPimpinan />} />
          <Route path="prediksi-ai"         element={<HasilPrediksiAI />} />
          <Route path="monitoring"          element={<MonitoringAktivitas />} />
        </Route>

        {/* 404 — fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </AuthProvider>
  );
}

export default App;
