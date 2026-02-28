import * as dotenv from "dotenv";
dotenv.config();


import express from "express"
import cors from "cors";

import aiRoutes from "./routes/ai";
// import middlware here
import { requireAuth } from "./middleware/auth";


const app = express()
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// any ai request now requires a token
app.use("/api/ai", requireAuth, aiRoutes);

app.get("/", (req, res) => res.send("Hackathon backend running 🚀"));

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
