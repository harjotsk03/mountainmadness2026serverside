import path from "path";
import * as dotenv from "dotenv";

// Load .env from project root (cwd when you run npm run dev)
dotenv.config({ path: path.join(process.cwd(), ".env") });
// Fallback: from server file location (e.g. src/server.ts -> project root)
dotenv.config({ path: path.join(__dirname, "..", ".env") });


import express from "express"
import cors from "cors";
const app = express()
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Hackathon backend running 🚀"));

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
