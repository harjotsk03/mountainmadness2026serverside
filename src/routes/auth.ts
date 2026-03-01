import { Router } from "express";
import jwt from "jsonwebtoken";
import { supabase } from "../services/supabase";

const router = Router();
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "7d") as string;

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? "dev-secret-change-in-production" : null);
  if (!jwtSecret) return res.status(500).json({ error: "JWT_SECRET is not set in environment (.env)" });

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (password !== user.password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed";
    res.status(500).json({ error: message });
  }
});

export default router;
