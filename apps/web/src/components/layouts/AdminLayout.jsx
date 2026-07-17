import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar"
import Header from "../Header";

export default function AdminLayout() {
  return (
<div className="flex min-h-screen bg-slate-900">
  <Sidebar />
  <div className="flex-1 flex flex-col">
    <Header />
    <main className="flex-1 p-6 bg-slate-900 overflow-auto">
      <Outlet />
    </main>
  </div>
</div>
  );
}