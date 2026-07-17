import axios from "axios";

// Ambil base URL dari environment variable Vite.
// Buat file .env di root project: VITE_API_URL=http://localhost:8000/api
const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Selalu sisipkan token terbaru dari localStorage ke setiap request,
// jaga-jaga kalau ada request yang jalan sebelum useAuth sempat
// mengatur api.defaults.headers.common.Authorization.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sawit_token");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Kalau token expired/invalid (401), bersihkan sesi dan lempar
// user kembali ke halaman login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("sawit_token");
      localStorage.removeItem("sawit_user");
      delete api.defaults.headers.common.Authorization;

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;