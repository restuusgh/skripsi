import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});


api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("sawit_token");
      localStorage.removeItem("sawit_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;