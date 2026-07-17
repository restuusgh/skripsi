import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

// Role yang dikenal aplikasi — samakan persis dengan nilai `role`
// yang dikirim backend/JWT kamu.
export const ROLES = {
  ADMIN: "admin",
  SUPIR: "supir",
  KEPALA_GUDANG: "kepalaGudang",
  PIMPINAN: "pimpinan",
};

const TOKEN_KEY = "sawit_token";
const USER_KEY = "sawit_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Saat app pertama kali dimuat, cek apakah ada sesi tersimpan
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (!token || !storedUser) {
        setLoading(false);
        return;
      }

      try {
        // Pasang token ke default header axios
        api.defaults.headers.common.Authorization = `Bearer ${token}`;

        // Validasi token masih hidup + ambil data user terbaru
        const res = await api.get("/auth/me");
        setUser(res.data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
      } catch (err) {
        // Token invalid/expired -> bersihkan sesi
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        delete api.defaults.headers.common.Authorization;
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user: loggedInUser } = res.data;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
    api.defaults.headers.common.Authorization = `Bearer ${token}`;

    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...allowedRoles) => !!user && allowedRoles.includes(user.role),
    [user]
  );

  const value = {
    user,               
    isAuthenticated: !!user,
    loading,            
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  }
  return ctx;
}