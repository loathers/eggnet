import express from "express";
import path from "path";

import { getEggStatus } from "./database.js";

const app = express()
  // Serve static files (CSS, JS, etc.)
  .use(express.static(path.join(import.meta.dirname, "../static")))
  // Serve the main HTML page
  .use(
    "/",
    express.static(path.join(import.meta.dirname, "../static", "index.html")),
  )
  .get("/status", async (req, res) => {
    try {
      res.json(await getEggStatus());
    } catch (error) {
      console.error("Error fetching egg status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

// Start server
const listener = app.listen(process.env.PORT || 3000, () => {
  const addr = listener.address();
  const link = !addr || typeof addr === "string" ? addr : `port ${addr.port}`;
  console.log(`EggNet Monitor server running on ${link}`);
});
