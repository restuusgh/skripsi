/*
  Warnings:

  - You are about to alter the column `jumlah` on the `detail_distribusi` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `nilaiPrediksi` on the `hasil_prediksi` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `kapasitas` on the `kendaraan` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `hasilPrediksi` on the `prediksi_stok` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `nilaiAkurasi` on the `prediksi_stok` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,2)`.
  - You are about to alter the column `jumlahStok` on the `stok` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `minimalStok` on the `stok` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - Added the required column `tipe` to the `hasil_prediksi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipe` to the `prediksi_stok` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipeAI" AS ENUM ('kebutuhan', 'stok');

-- AlterTable
ALTER TABLE "detail_distribusi" ALTER COLUMN "jumlah" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "hasil_prediksi" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "inputData" TEXT,
ADD COLUMN     "tipe" "TipeAI" NOT NULL,
ALTER COLUMN "nilaiPrediksi" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "kendaraan" ALTER COLUMN "kapasitas" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "prediksi_stok" ADD COLUMN     "tipe" "TipeAI" NOT NULL,
ALTER COLUMN "hasilPrediksi" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "nilaiAkurasi" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "stok" ALTER COLUMN "jumlahStok" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "minimalStok" SET DATA TYPE DECIMAL(10,2);
