-- AlterTable
ALTER TABLE "tujuan_distribusi" ADD COLUMN     "lat" DECIMAL(9,6),
ADD COLUMN     "lng" DECIMAL(9,6);

-- CreateTable
CREATE TABLE "lokasi_kendaraan" (
    "id" SERIAL NOT NULL,
    "kendaraanId" INTEGER NOT NULL,
    "lat" DECIMAL(9,6) NOT NULL,
    "lng" DECIMAL(9,6) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lokasi_kendaraan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lokasi_kendaraan_kendaraanId_key" ON "lokasi_kendaraan"("kendaraanId");

-- AddForeignKey
ALTER TABLE "lokasi_kendaraan" ADD CONSTRAINT "lokasi_kendaraan_kendaraanId_fkey" FOREIGN KEY ("kendaraanId") REFERENCES "kendaraan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
