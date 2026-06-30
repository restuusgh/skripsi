import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { appConfig } from "./config/app.config.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors({
  origin: appConfig.clientUrl,
  credentials: true,
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API Skripsi berjalan" });
});

app.use("/api", routes);

app.use(errorMiddleware);

export default app;