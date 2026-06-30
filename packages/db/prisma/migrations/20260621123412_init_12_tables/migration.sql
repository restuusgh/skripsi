/*
  Warnings:

  - The values [USER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The values [DIPROSES,DIKIRIM] on the enum `StatusDistribusi` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `distribusi` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `jumlah` on the `distribusi` table. All the data in the column will be lost.
  - You are about to drop the column `tanggalKirim` on the `distribusi` table. All the data in the column will be lost.
  - You are about to drop the column `tujuan` on the `distribusi` table. All the data in the column will be lost.
  - The `id` column on the `distribusi` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `stok` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `stok` table. All the data in the column will be lost.
  - You are about to drop the column `jumlah` on the `stok` table. All the data in the column will be lost.
  - You are about to drop the column `namaProduk` on the `stok` table. All the data in the column will be lost.
  - You are about to drop the column `satuan` on the `stok` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `stok` table. All the data in the column will be lost.
  - The `id` column on the `stok` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `aktivitas` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[produkId]` on the table `stok` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdBy` to the `distribusi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tanggalDistribusi` to the `distribusi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tujuanDistribusiId` to the `distribusi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jumlahStok` to the `stok` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minimalStok` to the `stok` table without a default value. This is not possible if the table is not empty.
  - Added the required column `produkId` to the `stok` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nama` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusUser" AS ENUM ('AKTIF', 'NONAKTIF');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'PIMPINAN');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'ADMIN';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "StatusDistribusi_new" AS ENUM ('PROSES', 'SELESAI', 'DIBATALKAN');
ALTER TABLE "public"."distribusi" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "distribusi" ALTER COLUMN "status" TYPE "StatusDistribusi_new" USING ("status"::text::"StatusDistribusi_new");
ALTER TYPE "StatusDistribusi" RENAME TO "StatusDistribusi_old";
ALTER TYPE "StatusDistribusi_new" RENAME TO "StatusDistribusi";
DROP TYPE "public"."StatusDistribusi_old";
ALTER TABLE "distribusi" ALTER COLUMN "status" SET DEFAULT 'PROSES';
COMMIT;

-- DropForeignKey
ALTER TABLE "aktivitas" DROP CONSTRAINT "aktivitas_distribusiId_fkey";

-- DropForeignKey
ALTER TABLE "aktivitas" DROP CONSTRAINT "aktivitas_userId_fkey";

-- AlterTable
ALTER TABLE "distribusi" DROP CONSTRAINT "distribusi_pkey",
DROP COLUMN "jumlah",
DROP COLUMN "tanggalKirim",
DROP COLUMN "tujuan",
ADD COLUMN     "createdBy" INTEGER NOT NULL,
ADD COLUMN     "kendaraanId" INTEGER,
ADD COLUMN     "keterangan" TEXT,
ADD COLUMN     "nomorSuratJalan" TEXT,
ADD COLUMN     "tanggalDistribusi" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "tujuanDistribusiId" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PROSES',
ADD CONSTRAINT "distribusi_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "stok" DROP CONSTRAINT "stok_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "jumlah",
DROP COLUMN "namaProduk",
DROP COLUMN "satuan",
DROP COLUMN "updatedAt",
ADD COLUMN     "jumlahStok" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "minimalStok" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "produkId" INTEGER NOT NULL,
ADD COLUMN     "tanggalUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "stok_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "name",
ADD COLUMN     "nama" TEXT NOT NULL,
ADD COLUMN     "status" "StatusUser" NOT NULL DEFAULT 'AKTIF',
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'ADMIN',
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "aktivitas";

-- CreateTable
CREATE TABLE "produk" (
    "id" SERIAL NOT NULL,
    "namaProduk" TEXT NOT NULL,
    "jenisProduk" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tujuan_distribusi" (
    "id" SERIAL NOT NULL,
    "namaTujuan" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "kontak" TEXT,

    CONSTRAINT "tujuan_distribusi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kendaraan" (
    "id" SERIAL NOT NULL,
    "platNomor" TEXT NOT NULL,
    "namaSupir" TEXT NOT NULL,
    "kapasitas" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'tersedia',

    CONSTRAINT "kendaraan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_distribusi" (
    "id" SERIAL NOT NULL,
    "distribusiId" INTEGER NOT NULL,
    "produkId" INTEGER NOT NULL,
    "jumlah" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "detail_distribusi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aktivitas_log" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "aktivitas" TEXT NOT NULL,
    "deskripsi" TEXT,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aktivitas_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prediksi_stok" (
    "id" SERIAL NOT NULL,
    "produkId" INTEGER NOT NULL,
    "periode" TEXT NOT NULL,
    "hasilPrediksi" DECIMAL(65,30) NOT NULL,
    "metode" TEXT NOT NULL,
    "nilaiAkurasi" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prediksi_stok_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hasil_prediksi" (
    "id" SERIAL NOT NULL,
    "prediksiStokId" INTEGER NOT NULL,
    "bulan" TEXT NOT NULL,
    "nilaiPrediksi" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "hasil_prediksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laporan" (
    "id" SERIAL NOT NULL,
    "judulLaporan" TEXT NOT NULL,
    "jenisLaporan" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "tanggalCetak" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "laporan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifikasi" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "statusBaca" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kendaraan_platNomor_key" ON "kendaraan"("platNomor");

-- CreateIndex
CREATE UNIQUE INDEX "stok_produkId_key" ON "stok"("produkId");

-- AddForeignKey
ALTER TABLE "stok" ADD CONSTRAINT "stok_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "produk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribusi" ADD CONSTRAINT "distribusi_tujuanDistribusiId_fkey" FOREIGN KEY ("tujuanDistribusiId") REFERENCES "tujuan_distribusi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribusi" ADD CONSTRAINT "distribusi_kendaraanId_fkey" FOREIGN KEY ("kendaraanId") REFERENCES "kendaraan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribusi" ADD CONSTRAINT "distribusi_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_distribusi" ADD CONSTRAINT "detail_distribusi_distribusiId_fkey" FOREIGN KEY ("distribusiId") REFERENCES "distribusi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_distribusi" ADD CONSTRAINT "detail_distribusi_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "produk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aktivitas_log" ADD CONSTRAINT "aktivitas_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediksi_stok" ADD CONSTRAINT "prediksi_stok_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "produk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hasil_prediksi" ADD CONSTRAINT "hasil_prediksi_prediksiStokId_fkey" FOREIGN KEY ("prediksiStokId") REFERENCES "prediksi_stok"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laporan" ADD CONSTRAINT "laporan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
