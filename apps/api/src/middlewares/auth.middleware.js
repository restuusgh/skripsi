import jwt from "jsonwebtoken";
import { appConfig } from "../config/app.config.js";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Token tidak ditemukan",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, appConfig.jwtSecret);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Token tidak valid",
    });
  }
};