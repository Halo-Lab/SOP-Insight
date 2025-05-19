import { Request, Response } from "express";
import supabase from "../config/database.js";
import { Role } from "../types/index.js";

export const getRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("roles")
      .select("*")
      .order("name");

    if (error) throw error;
    res.json(data as Role[]);
  } catch (error: any) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: error.message });
  }
};
