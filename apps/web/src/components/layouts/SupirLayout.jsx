import { Outlet } from "react-router-dom";
import SidebarSupir from "../SidebarSupir";
import Header from "../Header";
import { useAuth, AuthProvider } from "../hooks/useAuth";

export default function SupirLayout() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-900">
      <SidebarSupir />
      <div className="flex-1 flex flex-col">
        <Header user={user} />
        <main className="flex-1 p-6 bg-slate-900 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}