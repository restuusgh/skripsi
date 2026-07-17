import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useAuth, AuthProvider } from "../src/components/hooks/useAuth";

import AdminLayout from "./components/layouts/AdminLayout";
import Dashboard from "./components/pages/admin/Dashboard"
import PrediksiAI from "./components/pages/admin/PrediksiAi";
import DataProduk from "./components/pages/admin/DataProduk";
import Monitoring from "./components/pages/admin/Monitoring";
import Distributor from "./components/pages/admin/Distributor";
import Distribusi from "./components/pages/admin/Distribusi";
import Laporan from "./components/pages/admin/Laporan";
import Pengguna from "./components/pages/admin/Pengguna";
import Pengaturan from "./components/pages/admin/Pengaturan";

function App() {
  return (
    <AuthProvider>
      <Routes>

        <Route
          path="/"
          element={
            <Navigate
              to="/admin/dashboard"
              replace
            />
          }
        />

        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          <Route
            path="dashboard"
            element={<Dashboard />}
          />
          <Route
          path="prediksiai"
          element={<PrediksiAI/>}
          />
          <Route
          path="produk"
          element={<DataProduk/>}
          />
          <Route
          path="monitoring"
          element={<Monitoring/>}
          />
          <Route
          path="distributor"
          element={<Distributor/>}
          />
          <Route
          path="distribusi"
          element={<Distribusi/>}
          />

          <Route
          path="laporan"
          element={<Laporan/>}
          />

          <Route
          path="pengguna"
          element={<Pengguna/>}
          />

          <Route
          path="pengaturan"
          element={<Pengaturan/>}
          />

        </Route>

      </Routes>
    </AuthProvider>
  );
}

export default App;