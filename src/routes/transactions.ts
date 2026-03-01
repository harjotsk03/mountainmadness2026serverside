import { Router } from "express";
import { supabase } from "../services/supabase";

const router = Router();

// Example route: get all transactions
router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("transactions").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
