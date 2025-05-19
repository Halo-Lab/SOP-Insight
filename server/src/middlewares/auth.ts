import { Request, Response, NextFunction } from "express";
import supabase from "../config/database.js";
import { AuthRequest } from "../types/index.js";

// Authentication middleware
const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  // Check for token in cookies first (preferred method)
  let token = req.cookies?.access_token;

  // Fallback to Authorization header if no cookie (for backward compatibility)
  if (!token) {
    const authHeader = req.headers["authorization"];
    token = authHeader && authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error) throw error;

    if (user) {
      req.user = {
        id: user.id,
        email: user.email || "",
        role: user.role || "user",
      };
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default authenticateToken;
