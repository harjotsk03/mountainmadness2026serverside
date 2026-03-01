import { Request, Response, NextFunction } from "express";
import { supabase } from "../services/supabase";


export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.headers["x-user-id"];

        if (!userId) {
            return res.status(401).json({ error: "Missing user-id header" });
        }

        const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: "Unauthorized User" });
        }

        (req as any).user = user;

        next();
    } catch (err) {
        res.status(500).json({ error: "Internal Auth Error" });
    }
};
