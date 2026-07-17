import bcrypt from "bcryptjs";
import prisma from "@skripsi/db";

const select = { id: true, nama: true, email: true, role: true, status: true, createdAt: true };

export const getAllUsers = () => prisma.user.findMany({ select, orderBy: { createdAt: "desc" } });

export const getUserById = async (id) => {
  const u = await prisma.user.findUnique({ where: { id }, select });
  if (!u) throw { status: 404, message: "User tidak ditemukan." };
  return u;
};

export const createUser = async ({ nama, email, password, role, status }) => {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw { status: 409, message: "Email sudah terdaftar." };
  const hash = await bcrypt.hash(password, 10);
  return prisma.user.create({ data: { nama, email, password: hash, role, status: status ?? "AKTIF" }, select });
};

export const updateUser = async (id, { nama, email, password, role, status }) => {
  const data = { nama, email, role, status };
  if (password) data.password = await bcrypt.hash(password, 10);
  return prisma.user.update({ where: { id }, data, select });
};

export const deleteUser = (id) => prisma.user.delete({ where: { id } });
