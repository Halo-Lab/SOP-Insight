import { Request, Response } from "express";
import supabase from "../config/database.js";
import { AuthRequest, UserCredentials } from "../types/index.js";

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as UserCredentials;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${
          process.env.CLIENT_URL || "http://localhost:3000"
        }/email-confirmation`,
      },
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error("Registration failed - no user data returned");
    }

    await supabase.from("profiles").insert([{ id: data.user.id }]);

    // Set cookies for tokens
    setAuthCookies(res, data.session);

    res.json({
      user: data.user,
      session: { access_token: data.session?.access_token },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as UserCredentials;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Check if email is confirmed
    if (!data.user.email_confirmed_at) {
      res.status(403).json({
        error: "Email not confirmed",
        code: "EMAIL_NOT_CONFIRMED",
      });
      return;
    }

    // Get user profile with role_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("role_id")
      .eq("id", data.user.id)
      .single();

    // Set cookies for tokens
    setAuthCookies(res, data.session);

    res.json({
      user: {
        ...data.user,
        role_id: profile?.role_id || null,
        email_confirmed: !!data.user.email_confirmed_at,
      },
      session: { access_token: data.session.access_token },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    res.status(401).json({ error: "No refresh token provided" });
    return;
  }

  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) throw error;

    // Set new cookies
    setAuthCookies(res, data.session);

    res.json({
      user: data.user,
      session: { access_token: data.session?.access_token || "" },
    });
  } catch (error: any) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Clear auth cookies
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    // Sign out from Supabase
    await supabase.auth.signOut();

    res.json({ message: "Logged out successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role_id")
      .eq("id", user.id)
      .single();

    // Include email_confirmed_at from user metadata
    res.json({
      user: {
        ...user,
        role_id: profile?.role_id || null,
        email_confirmed: !!(user as any).email_confirmed_at,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserRole = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { role_id } = req.body;

  if (role_id === undefined || role_id === null) {
    res.status(400).json({ error: "Role ID is required" });
    return;
  }

  if (!req.user) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    // Update the role_id field in the profiles table
    const { data, error } = await supabase
      .from("profiles")
      .update({ role_id: Number(role_id) })
      .eq("id", req.user.id)
      .select("id, role_id");

    if (error) {
      console.error("Error updating role:", error);
      throw error;
    }

    // Ensure we always return a valid JSON object, even if data[0] is undefined
    res.json({ success: true, profile: data[0] || null });
  } catch (error: any) {
    console.error("Error in updateUserRole:", error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to set auth cookies
interface Session {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

const setAuthCookies = (res: Response, session?: Session | null): void => {
  if (!session) return;

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
  };

  res.cookie("access_token", session.access_token, {
    ...cookieOptions,
    maxAge: (session.expires_in || 3600) * 1000, // Use token expiry or default to 1 hour
  });

  if (session.refresh_token) {
    res.cookie("refresh_token", session.refresh_token, cookieOptions);
  }
};
