-- CreateTable
CREATE TABLE "riwayat_stok" (
    "id" SERIAL NOT NULL,
    "produkId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "tipe" TEXT NOT NULL,
    "jumlah" DECIMAL(10,2) NOT NULL,
    "alasan" TEXT NOT NULL,
    "catatan" TEXT,
    "stokAwal" DECIMAL(10,2) NOT NULL,
    "stokAkhir" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riwayat_stok_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "riwayat_stok" ADD CONSTRAINT "riwayat_stok_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "produk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_stok" ADD CONSTRAINT "riwayat_stok_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
