import { useEffect, useRef } from "react";
import api from "../utils/api";


export function useLokasiReporter(kendaraanId, { enabled = true, minIntervalMs = 15000 } = {}) {
  const watchIdRef = useRef(null);
  const lastSentRef = useRef(0);

  useEffect(() => {
    if (!enabled || !kendaraanId) return;
    if (!("geolocation" in navigator)) {
      console.warn("Perangkat tidak mendukung geolocation.");
      return;
    }

    const kirimLokasi = (position) => {
      const now = Date.now();
      if (now - lastSentRef.current < minIntervalMs) return; // throttle
      lastSentRef.current = now;

      const { latitude, longitude } = position.coords;
      api.patch(`/kendaraan/${kendaraanId}/lokasi`, { lat: latitude, lng: longitude }).catch(() => {
        // gagal kirim sekali tidak masalah, akan dicoba lagi di update GPS berikutnya
      });
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      kirimLokasi,
      (err) => console.warn("Gagal membaca lokasi:", err.message),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [kendaraanId, enabled, minIntervalMs]);
}