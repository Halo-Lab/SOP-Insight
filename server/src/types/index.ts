import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface SOP {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  status: string;
  metadata?: Record<string, any>;
}

export interface SOPCreateInput {
  title: string;
  content: string;
  userId: string;
  status?: string;
  metadata?: Record<string, any>;
}

export interface SOPUpdateInput {
  title?: string;
  content?: string;
  status?: string;
  metadata?: Record<string, any>;
}

export interface AnalyzeRequest {
  sopId: string;
  prompt?: string;
  options?: AnalyzeOptions;
}

export interface AnalyzeOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  additionalContext?: string;
}

export interface AnalyzeResult {
  id: string;
  sopId: string;
  result: any;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
