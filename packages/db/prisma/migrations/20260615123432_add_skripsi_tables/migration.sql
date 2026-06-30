-- CreateEnum
CREATE TYPE "StatusDistribusi" AS ENUM ('DIPROSES', 'DIKIRIM', 'SELESAI', 'DIBATALKAN');

-- CreateTable
CREATE TABLE "distribusi" (
    "id" TEXT NOT NULL,
    "kodeDistribusi" TEXT NOT NULL,
    "tujuan" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "tanggalKirim" TIMESTAMP(3) NOT NULL,
    "status" "StatusDistribusi" NOT NULL DEFAULT 'DIPROSES',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distribusi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aktivitas" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "keterangan" TEXT,
    "userId" TEXT NOT NULL,
    "distribusiId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aktivitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stok" (
    "id" TEXT NOT NULL,
    "namaProduk" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "satuan" TEXT NOT NULL DEFAULT 'Ton',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stok_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "distribusi_kodeDistribusi_key" ON "distribusi"("kodeDistribusi");

-- AddForeignKey
ALTER TABLE "aktivitas" ADD CONSTRAINT "aktivitas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aktivitas" ADD CONSTRAINT "aktivitas_distribusiId_fkey" FOREIGN KEY ("distribusiId") REFERENCES "distribusi"("id") ON DELETE SET NULL ON UPDATE CASCADE;
