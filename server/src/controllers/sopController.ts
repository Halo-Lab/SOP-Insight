import { Response } from "express";
import supabase from "../config/database.js";
import { AuthRequest } from "../types/index.js";

export const createSop = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { name, content } = req.body as { name: string; content: string };

  if (!name || !content) {
    res.status(400).json({ error: "Name and content are required" });
    return;
  }

  if (!req.user) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    const { data, error } = await supabase
      .from("sops")
      .insert([{ name, content, user_id: req.user.id }])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSops = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    const { data, error } = await supabase
      .from("sops")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSop = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name, content } = req.body as { name: string; content: string };

  if (!name || !content) {
    res.status(400).json({ error: "Name and content are required" });
    return;
  }

  if (!req.user) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    // First check if SOP exists and belongs to user
    const { data: existingSop, error: checkError } = await supabase
      .from("sops")
      .select("id")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();

    if (checkError) throw checkError;
    if (!existingSop) {
      res.status(404).json({ error: "SOP not found" });
      return;
    }

    // Update SOP
    const { data, error } = await supabase
      .from("sops")
      .update({ name, content })
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSop = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!req.user) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    // First check if SOP exists and belongs to user
    const { data: existingSop, error: checkError } = await supabase
      .from("sops")
      .select("id")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();

    if (checkError) throw checkError;
    if (!existingSop) {
      res.status(404).json({ error: "SOP not found" });
      return;
    }

    // Delete SOP
    const { error } = await supabase
      .from("sops")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDefaultSops = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { role_id } = req.query;

  if (!role_id) {
    res.status(400).json({ error: "role_id is required" });
    return;
  }

  try {
    const { data, error } = await supabase
      .from("default_sops")
      .select("*")
      .eq("role_id", Number(role_id));

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
