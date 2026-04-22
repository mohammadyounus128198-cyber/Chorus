import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { kernel } from "./src/lib/chorus-stack/control-kernel";
import { assignmentEngine } from "./src/lib/chorus-stack/assignment-engine";
import { rttsEngine } from "./src/lib/chorus-stack/rtts-evidence";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Placeholder for API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "active", version: "sentinel-2.1" });
  });

  // Chorus Stack Simulation Endpoints
  app.get("/api/chorus/kernel", (req, res) => {
    const { stress = "0", contamination = "0" } = req.query;
    const mode = kernel.evaluate(parseFloat(stress as string), parseFloat(contamination as string));
    res.json({ mode, timestamp: Date.now() });
  });

  app.get("/api/chorus/assignments", (req, res) => {
    res.json(assignmentEngine.getAssignments());
  });

  app.post("/api/chorus/rtts", express.json(), (req, res) => {
    const { targetId, score, notations } = req.body;
    const evidence = rttsEngine.logEvidence(targetId, score, notations);
    res.json(evidence);
  });

  app.get("/api/solve-stream", (req, res) => {
    // Exact headers mapped for Vercel/Proxy buffering fixes
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.setHeader("Content-Encoding", "none"); // Prevents compression buffer
    res.flushHeaders();

    // Immediate ok to test buffering
    res.write(": ok\n\n");

    let step = 0;
    const interval = setInterval(() => {
      step++;
      res.write(`data: ${JSON.stringify({ step, status: "solving", timestamp: Date.now() })}\n\n`);
      if (step >= 5) {
        clearInterval(interval);
        res.end();
      }
    }, 500);

    req.on("close", () => clearInterval(interval));
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CHORUS ENGINE ACTIVE AT http://localhost:${PORT}`);
  });
}

startServer();
