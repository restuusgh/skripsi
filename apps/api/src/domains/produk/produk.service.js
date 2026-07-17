import prisma from "@skripsi/db";

export const getAllProduk = () =>
  prisma.produk.findMany({ include: { stok: true }, orderBy: { createdAt: "desc" } });

export const getProdukById = async (id) => {
  const p = await prisma.produk.findUnique({ where: { id }, include: { stok: true } });
  if (!p) throw { status: 404, message: "Produk tidak ditemukan." };
  return p;
};

export const createProduk = ({ namaProduk, jenisProduk, satuan, deskripsi }) =>
  prisma.produk.create({ data: { namaProduk, jenisProduk, satuan, deskripsi } });

export const updateProduk = (id, { namaProduk, jenisProduk, satuan, deskripsi }) =>
  prisma.produk.update({ where: { id }, data: { namaProduk, jenisProduk, satuan, deskripsi } });

export const deleteProduk = (id) => prisma.produk.delete({ where: { id } });
