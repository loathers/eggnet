import express from "express";
import path from "path";
import { config } from "./config";
import { setupDatabase, getEggStatus } from "./database";

const app = express()
  // Serve static files (CSS, JS, etc.)
  .use(express.static(path.join(__dirname, "../static")))
  // Serve the main HTML page
  .use("/", express.static(path.join(__dirname, "../static", "index.html")))
  // API endpoint for egg status (replaces status.php)
  .get("/status.php", async (req, res) => {
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
    // Setup database
    await setupDatabase();
    console.log("Database setup completed");

    // Start listening
    app.listen(config.server.port, () => {
      console.log(
        `EggNet Monitor server running on port ${config.server.port}`,
      );
      console.log(
        `Visit http://localhost:${config.server.port} to view the monitor`,
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
