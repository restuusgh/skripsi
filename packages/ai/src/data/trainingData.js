export const kebutuhanFallback = [
  { input: { wilayah: 0,   musim: 0, stok: 0.8, permintaan: 0.3 }, output: { kebutuhan: 0.2 } },
  { input: { wilayah: 0,   musim: 1, stok: 0.5, permintaan: 0.6 }, output: { kebutuhan: 0.5 } },
  { input: { wilayah: 0.5, musim: 0, stok: 0.6, permintaan: 0.5 }, output: { kebutuhan: 0.4 } },
  { input: { wilayah: 0.5, musim: 1, stok: 0.3, permintaan: 0.8 }, output: { kebutuhan: 0.7 } },
  { input: { wilayah: 1,   musim: 0, stok: 0.4, permintaan: 0.7 }, output: { kebutuhan: 0.6 } },
  { input: { wilayah: 1,   musim: 1, stok: 0.2, permintaan: 0.9 }, output: { kebutuhan: 0.9 } },
  { input: { wilayah: 0,   musim: 0, stok: 0.9, permintaan: 0.2 }, output: { kebutuhan: 0.1 } },
  { input: { wilayah: 1,   musim: 1, stok: 0.1, permintaan: 1.0 }, output: { kebutuhan: 1.0 } },
  { input: { wilayah: 0.5, musim: 0, stok: 0.7, permintaan: 0.4 }, output: { kebutuhan: 0.3 } },
  { input: { wilayah: 1,   musim: 0, stok: 0.5, permintaan: 0.6 }, output: { kebutuhan: 0.55 } },
];

export const stokFallback = [
  { input: { stok: 0.5, produksi: 0.6, permintaan: 0.4, hargaTBS: 0.5 }, output: { stokBerikutnya: 0.7 } },
  { input: { stok: 0.3, produksi: 0.4, permintaan: 0.7, hargaTBS: 0.3 }, output: { stokBerikutnya: 0.3 } },
  { input: { stok: 0.8, produksi: 0.7, permintaan: 0.3, hargaTBS: 0.7 }, output: { stokBerikutnya: 0.9 } },
  { input: { stok: 0.2, produksi: 0.3, permintaan: 0.8, hargaTBS: 0.4 }, output: { stokBerikutnya: 0.2 } },
  { input: { stok: 0.6, produksi: 0.5, permintaan: 0.5, hargaTBS: 0.6 }, output: { stokBerikutnya: 0.6 } },
  { input: { stok: 0.4, produksi: 0.8, permintaan: 0.3, hargaTBS: 0.8 }, output: { stokBerikutnya: 0.75 } },
  { input: { stok: 0.1, produksi: 0.2, permintaan: 0.9, hargaTBS: 0.2 }, output: { stokBerikutnya: 0.1 } },
  { input: { stok: 0.9, produksi: 0.9, permintaan: 0.2, hargaTBS: 0.9 }, output: { stokBerikutnya: 1.0 } },
  { input: { stok: 0.5, produksi: 0.4, permintaan: 0.6, hargaTBS: 0.5 }, output: { stokBerikutnya: 0.45 } },
  { input: { stok: 0.7, produksi: 0.6, permintaan: 0.4, hargaTBS: 0.7 }, output: { stokBerikutnya: 0.8 } },
];