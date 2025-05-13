/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Import service functions
import {
  loginUser,
  registerUser,
  fetchCurrentUser,
} from "@/lib/services/auth.service";

interface User {
  id: string;
  email: string;
  role_id?: number | null;
}

interface Session {
  access_token: string;
}

interface RegisterServiceResponse {
  user: User;
  session?: Session | null;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string
  ) => Promise<RegisterServiceResponse>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchCurrentUser(token);
      setUser(data.user);
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await loginUser(email, password);
      if (data.session?.access_token) {
        localStorage.setItem("token", data.session.access_token);
        const me = await fetchCurrentUser(data.session.access_token);
        setUser(me.user);
        navigate("/");
      } else {
        console.error("Login response did not include a session token.");
        throw new Error("Login failed: No session token received.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string
  ): Promise<RegisterServiceResponse> => {
    try {
      const data = await registerUser(email, password);

      if (data.session?.access_token) {
        localStorage.setItem("token", data.session.access_token);
        setUser(data.user);
        navigate("/");
      }

      return {
        user: data.user,
        session: data.session,
        message: data.message,
      };
    } catch (error) {
      console.error("Registration failed context:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/auth");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
