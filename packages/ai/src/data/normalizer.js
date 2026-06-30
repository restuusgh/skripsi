const RANGES = {
  stok: { min: 0, max: 2000 },
  distribusi: { min: 0, max: 1000 },
  produksi: { min: 0, max: 1000 },
  permintaan: { min: 0, max: 1000 },
  hargaTBS: { min: 1000, max: 5000 },
  kebutuhan: { min: 0, max: 1000 },
  stokBerikutnya: { min: 0, max: 2000 },
};

export function normalize(key, value) {
  const { min, max } = RANGES[key];
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

export function denormalize(key, value) {
  const { min, max } = RANGES[key];
  return value * (max - min) + min;
}

export function normalizeInput(obj, keys) {
  const result = {};

  for (const key of keys) {
    result[key] = normalize(key, obj[key]);
  }

  return result;
}

export { RANGES };