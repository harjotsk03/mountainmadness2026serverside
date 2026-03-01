import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const getJwtSecret = () =>
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV !== "production"
    ? "dev-secret-change-in-production"
    : null);

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
      email: string;
    };
    (req as Request & { user: { userId: string; email: string } }).user =
      decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid token" });
    }
    console.error("Auth middleware error:", err);
    res
      .status(500)
      .json({ error: "Internal server error during authentication" });
  }
};
