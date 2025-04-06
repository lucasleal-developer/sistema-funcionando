import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(_app: Express, _server: Server) {
  // Development only - not used in production
  throw new Error("Vite setup is not available in production");
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist/client");

  if (!fs.existsSync(distPath)) {
    log("Client build directory not found - skipping static file serving");
    return;
  }

  app.use(express.static(distPath));

  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ message: "Not Found" });
    }
  });
}
