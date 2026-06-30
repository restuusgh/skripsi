import app from "./app.js";
import { appConfig } from "./config/app.config.js";

app.listen(appConfig.port, () => {
  console.log(`Server berjalan di http://localhost:${appConfig.port}`);
});