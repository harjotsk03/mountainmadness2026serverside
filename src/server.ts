import path from "path";
import * as dotenv from "dotenv";

// Load .env from project root (cwd when you run npm run dev)
dotenv.config({ path: path.join(process.cwd(), ".env") });
// Fallback: from server file location (e.g. src/server.ts -> project root)
dotenv.config({ path: path.join(__dirname, "..", ".env") });


import express from "express"
import cors from "cors";

import aiRoutes from "./routes/ai";
import eventRoutes from "./routes/events";
import transactionRoutes from "./routes/transactions";
import { requireAuth } from "./middleware/auth";
import authRoutes from "./routes/auth";


const app = express()
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// any ai request now requires a token
app.use("/api/auth", authRoutes);
app.use("/api/ai", requireAuth, aiRoutes);
app.use("/api/boards", requireAuth, aiRoutes);
app.use("/api/events", requireAuth, eventRoutes);
app.use("/api/transactions", requireAuth, transactionRoutes);

app.get("/", (req, res) => res.send("Hackathon backend running 🚀"));

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
