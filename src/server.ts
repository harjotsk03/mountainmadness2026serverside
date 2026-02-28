import * as express from "express";
import cors from "cors";
import * as dotenv from "dotenv";

import aiRoutes from "./routes/ai";

dotenv.config();

const app = express.default();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => res.send("Hackathon backend running 🚀"));

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
