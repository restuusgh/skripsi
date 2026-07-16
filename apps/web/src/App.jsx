import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AdminLayout from "./components/layouts/AdminLayout";
import Dashboard from "./components/pages/Dashboard";
import PrediksiAI from "./components/pages/PrediksiAi";
import DataProduk from "./components/pages/DataProduk";
import Monitoring from "./components/pages/Monitoring";
import Distributor from "./components/pages/Distributor";
import Distribusi from "./components/pages/Distribusi";
import Laporan from "./components/pages/Laporan";

function App() {
  return (
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

      </Route>

        <Route
        path="distribusi"
        element={<Distribusi/>}
        />
      

    </Routes>
  );
}

export default App;