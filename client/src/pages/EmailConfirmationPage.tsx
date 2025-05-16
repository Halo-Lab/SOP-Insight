import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/lib/context/AuthContext";
import { Icons } from "@/components/ui/Icons";
import { toast } from "sonner";

export const EmailConfirmationPage: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

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
        setStatus("success");
        setMessage(
          "Email confirmed successfully! Redirecting to login page..."
        );

        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
            }
          );

          if (response.ok) {
            const userData = await response.json();
            // Update user in AuthContext
            setUser(userData.user);

            // If we successfully got user data, redirect to home page
            setTimeout(() => {
              navigate("/");
            }, 1000);
            return;
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          // Log error details for debugging
          if (error instanceof Error) {
            console.log("Could not fetch user data:", error.message);
          } else {
            console.log("Could not fetch user data, redirecting to login page");
          }
        }

        setTimeout(() => {
          navigate("/auth");
        }, 1000);
      } catch (error) {
        console.error("Email confirmation error:", error);
        setStatus("error");
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred.";
        setMessage(`Failed to confirm email: ${errorMessage}`);

        // Show toast with instructions
        toast.info(
          "If you've already confirmed your email, please try logging in",
          {
            duration: 5000,
          }
        );
      }
    };

    handleEmailConfirmation();
  }, [location, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-lg w-full space-y-8 p-10 bg-white rounded-xl shadow-2xl text-center">
        {status === "loading" && (
          <>
            <Loader size="lg" className="mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Confirming Your Email
            </h2>
            <p className="text-gray-500">Please wait a moment...</p>
          </>
        )}
        {status === "success" && (
          <>
            <Icons.check className="mx-auto h-20 w-20 text-green-500 mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Email Confirmed!
            </h2>
            <p className="text-lg text-gray-600">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <Icons.warning className="mx-auto h-20 w-20 text-red-500 mb-6" />
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
