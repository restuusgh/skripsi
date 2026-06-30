import dotenv from "dotenv";

dotenv.config();

export const appConfig = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL,
};