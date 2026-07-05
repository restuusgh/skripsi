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
      </Route>

    </Routes>
  );
}

export default App;