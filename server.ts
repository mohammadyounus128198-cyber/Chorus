import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { kernel } from "./src/lib/chorus-stack/control-kernel";
import { assignmentEngine } from "./src/lib/chorus-stack/assignment-engine";
import { rttsEngine } from "./src/lib/chorus-stack/rtts-evidence";
import { webcrypto } from "node:crypto";
import { canonicalize } from "./src/lib/chorus-stack/canonical";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server-side Trusted Key Pair
let serverPrivateKey: webcrypto.CryptoKey;
let serverPublicKeyString: string;

// Oracle Authority Key (Hardcoded for Omega-Directive Consistency)
const MASTER_PRIV_PKCS8 = "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgfXm8Z6q6X6vP9Ym8P8p8u8w7e8r6q6w8p6lB9n1V6y+hRANCAAE7p6lB9n1V6y/yS8Z6q6X6vP9Ym8P8p8u8w7e8r6q6w8p6lB9n1V6y/yS8Z6q6X6vP9Ym8P8p8u8w7e8r6q6w==";
const MASTER_PUB_SPKI = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7p6lB9n1V6y/yS8Z6q6X6vP9Ym8P8p8u8w7e8r6q6X6vP9Ym8P8p8u8w7e8r6q6w8p6lB9n1V6y/yS8Z6q6X6vP9Ym8P8p8u8w7e8r6q6w==";

async function initServerCrypto() {
  const { subtle } = webcrypto;
  try {
    // Import stable key for deterministic demo environment
    const privBuffer = Buffer.from(MASTER_PRIV_PKCS8, 'base64');
    serverPrivateKey = await subtle.importKey(
      "pkcs8",
      privBuffer,
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign"]
    );
    serverPublicKeyString = MASTER_PUB_SPKI;
    console.log("Ω-DIRECTIVE: Master Authority Key loaded (SEALED)");
  } catch (e) {
    console.warn("Authority Key load failed, falling back to ephemeral key.");
    const keyPair = await subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"]
    );
    serverPrivateKey = keyPair.privateKey;
    const exported = await subtle.exportKey("spki", keyPair.publicKey);
    serverPublicKeyString = Buffer.from(new Uint8Array(exported)).toString('base64');
  }
}

async function startServer() {
  await initServerCrypto();
  
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // Placeholder for API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "active", version: "sentinel-2.1" });
  });

  // Proof Authority Endpoint
  app.post("/api/sign-proof", async (req, res) => {
    try {
      const { subtle } = webcrypto;
      const data = req.body;
      const canonical = canonicalize(data);
      
      const msgBuffer = new TextEncoder().encode(canonical);
      const hashBuffer = await subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const signatureBuffer = await subtle.sign(
        { name: "ECDSA", hash: { name: "SHA-256" } },
        serverPrivateKey,
        msgBuffer
      );
      
      const signatureArray = Array.from(new Uint8Array(signatureBuffer));
      const signatureBase64 = Buffer.from(signatureArray).toString('base64');
      
      res.json({
        hash,
        signature: signatureBase64,
        publicKey: serverPublicKeyString
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to sign proof" });
    }
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
