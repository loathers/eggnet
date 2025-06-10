import dotenv from "dotenv";
import { env } from "process";

dotenv.config();

export const config = {
  website: "https://www.kingdomofloathing.com",
  kol: {
    username: env.KOL_USERNAME || "",
    password: env.KOL_PASSWORD || "",
  },
  database: {
    host: env.DB_HOST || "localhost",
    name: env.DB_NAME || "eggnet",
    username: env.DB_USERNAME || "",
    password: env.DB_PASSWORD || "",
  },
  server: {
    port: parseInt(env.PORT || "3000", 10),
  },
};

if (!config.kol.username || !config.kol.password) {
  console.warn(
    "Warning: KOL_USERNAME and KOL_PASSWORD environment variables should be set",
  );
}

if (!config.database.username || !config.database.password) {
  console.warn(
    "Warning: DB_USERNAME and DB_PASSWORD environment variables should be set",
  );
}
