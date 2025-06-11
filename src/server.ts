import express from "express";
import path from "path";
import { getEggStatus } from "./database";

const app = express()
  // Serve static files (CSS, JS, etc.)
  .use(express.static(path.join(__dirname, "../static")))
  // Serve the main HTML page
  .use("/", express.static(path.join(__dirname, "../static", "index.html")))
  .get("/status", async (req, res) => {
    try {
      const data = await getEggStatus();
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.json(data);
    } catch (error) {
      console.error("Error fetching egg status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
  // Health check endpoint
  .get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

// Start server
async function startServer() {
  try {
    // Start listening
    const listener = app.listen(process.env.PORT || 3000, () => {
      const addr = listener.address();
      const link = (!addr || typeof addr === "string") ? addr : `port ${addr.port}`;
      console.log(
        `EggNet Monitor server running on ${link}`,
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Shutting down gracefully...");
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}
