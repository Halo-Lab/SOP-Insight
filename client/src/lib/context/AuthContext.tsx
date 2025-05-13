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
}

// Adjusted to match the return type of registerUser service function
interface RegisterServiceResponse {
  user: User;
  session?: {
    // Session is optional, especially with email confirmation flow
    access_token: string;
  };
  message?: string; // For messages like 'check email for confirmation'
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  // Update register to reflect service response and how it's used in RegistrationPage
  register: (
    email: string,
    password: string
  ) => Promise<RegisterServiceResponse>;
  logout: () => void;
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
      // Use service function
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Consider dependencies if navigate or other external factors affect checkAuth

  const login = async (email: string, password: string) => {
    try {
      // Use service function
      const data = await loginUser(email, password);
      if (data.session?.access_token) {
        localStorage.setItem("token", data.session.access_token);
        setUser(data.user);
        navigate("/");
      } else {
        // Handle cases where login might succeed but no token (e.g. MFA step needed - though not in current scope)
        console.error("Login response did not include a session token.");
        throw new Error("Login failed: No session token received.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Re-throw for the component to handle (e.g., display error message)
    }
  };

  const register = async (
    email: string,
    password: string
  ): Promise<RegisterServiceResponse> => {
    try {
      // Use service function
      const data = await registerUser(email, password);

      // If session exists and has a token (e.g. auto-confirm is on, or user is already confirmed)
      if (data.session?.access_token) {
        localStorage.setItem("token", data.session.access_token);
        setUser(data.user);
        navigate("/");
      }
      // If no session token, it means email confirmation is likely pending.
      // The service response (data) which includes user and possibly a message will be returned.
      // The component (RegistrationPage) will handle showing the message.
      return data;
    } catch (error) {
      console.error("Registration failed context:", error);
      throw error; // Re-throw for the component to handle
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
