import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

// Samakan dengan enum Role di Prisma schema & JWT payload dari backend
export const ROLES = {
  ADMIN:         "ADMIN",
  SUPIR:         "SUPIR",
  KEPALA_GUDANG: "KEPALA_GUDANG",
  PIMPINAN:      "PIMPINAN",
};

const TOKEN_KEY = "sawit_token";
const USER_KEY  = "sawit_user";

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore sesi saat app dimuat
  useEffect(() => {
    const restoreSession = async () => {
      const token      = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (!token || !storedUser) {
        setLoading(false);
        return;
      }

      try {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        const res = await api.get("/auth/me");
        // Backend GET /auth/me mengembalikan { success, data: { ...user } }
        setUser(res.data.data);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.data));
      } catch {
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
    // Backend POST /auth/login mengembalikan { success, token, user }
    const res = await api.post("/auth/login", { email, password });
    const { token, user: loggedInUser } = res.data;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
    api.defaults.headers.common.Authorization = `Bearer ${token}`;

    setUser(loggedInUser);
    return loggedInUser; // caller bisa pakai ini untuk redirect
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // abaikan error logout dari server
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      delete api.defaults.headers.common.Authorization;
      setUser(null);
    }
  }, []);

  const hasRole = useCallback(
    (...allowedRoles) => !!user && allowedRoles.includes(user.role),
    [user]
  );

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
      hasRole,
      ROLES,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}