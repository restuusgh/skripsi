import ai from "./ai.service.js";

export const prediksiKebutuhan = async (req, res, next) => {
  try {
    const { data } = await ai.post("/prediksi/kebutuhan", req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const prediksiStok = async (req, res, next) => {
  try {
    const { data } = await ai.post("/prediksi/stok", req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const trenPrediksi = async (req, res, next) => {
  try {
    const { data } = await ai.get(
      `/prediksi/tren?bulan=${req.query.bulan ?? 6}`
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const riwayatPrediksi = async (req, res, next) => {
  try {
    const { data } = await ai.get("/prediksi/riwayat");
    res.json(data);
  } catch (err) {
    next(err);
  }
};