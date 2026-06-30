import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { appConfig } from "../../config/app.config.js";
import { findUserByEmail, findUserById } from "./auth.repository.js";
import { validateLogin } from "./auth.validation.js";

export const loginService = async (body) => {
  validateLogin(body);

  const { email, password } = body;

  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Email tidak ditemukan");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Password salah");
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    appConfig.jwtSecret,
    { expiresIn: "1d" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const meService = async (userId) => {
  return findUserById(userId);
};