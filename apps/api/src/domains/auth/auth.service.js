import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@skripsi/db";
import { appConfig } from "../../config/app.config.js";

export const loginService = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw { status: 401, message: "Email atau password salah." };
  if (user.status === "NONAKTIF") throw { status: 403, message: "Akun tidak aktif." };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw { status: 401, message: "Email atau password salah." };

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, nama: user.nama },
    appConfig.jwtSecret,
    { expiresIn: "8h" }
  );

  return {
    token,
    user: { id: user.id, nama: user.nama, email: user.email, role: user.role },
  };
};

export const getMeService = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, nama: true, email: true, role: true, status: true, createdAt: true },
  });
  if (!user) throw { status: 404, message: "User tidak ditemukan." };
  return user;
};
