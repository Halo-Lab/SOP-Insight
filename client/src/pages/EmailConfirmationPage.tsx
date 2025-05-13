import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/Button";

export const EmailConfirmationPage: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Token will be in location.hash (e.g., "#access_token=...")
        let accessToken: string | null = null;

        if (location.hash && location.hash.includes("access_token")) {
          const params = new URLSearchParams(location.hash.substring(1)); // Remove # at the beginning
          accessToken = params.get("access_token");
        } else {
          // Fallback to query parameters if Supabase changes behavior or for direct testing
          const queryParams = new URLSearchParams(location.search);
          accessToken = queryParams.get("access_token");
        }

        if (!accessToken) {
          throw new Error(
            "No access token found in URL hash or query parameters"
          );
        }

        localStorage.setItem("token", accessToken);

        // Get user data
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Failed to parse error response" }));
          throw new Error(
            errorData.error ||
              "Failed to get user data after email confirmation"
          );
        }

        // setUser in AuthContext should be called to update state.
        // This is best done through a login function or a dedicated function in AuthContext.
        // For now, just redirecting; AuthContext will update user on HomePage load.

        setStatus("success");
        setMessage("Email successfully confirmed! Redirecting to home page...");

        setTimeout(() => {
          navigate("/");
        }, 2500);
      } catch (error) {
        console.error("Email confirmation error:", error);
        setStatus("error");
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred.";
        setMessage(`Failed to confirm email: ${errorMessage}`);
      }
    };

    handleEmailConfirmation();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-lg w-full space-y-8 p-10 bg-white rounded-xl shadow-2xl text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Confirming Your Email
            </h2>
            <p className="text-gray-500">Please wait a moment...</p>
          </>
        )}
        {status === "success" && (
          <>
            <svg
              className="mx-auto h-20 w-20 text-green-500 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Email Confirmed!
            </h2>
            <p className="text-lg text-gray-600">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <svg
              className="mx-auto h-20 w-20 text-red-500 mb-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Oops!</h2>
            <p className="text-lg text-red-600 bg-red-100 p-4 rounded-md">
              {message}
            </p>
            <Button
              onClick={() => navigate("/auth")}
              className="mt-8 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold transition duration-300 ease-in-out"
              ariaLabel="Back to Login"
            >
              Back to Login
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
