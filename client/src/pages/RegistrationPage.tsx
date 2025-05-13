import * as React from "react";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";
import { useAuth } from "@/lib/context/AuthContext";
import { toast } from "sonner";

const validateEmail = (email: string) => /.+@.+\..+/.test(email);

export const RegistrationPage: React.FC<{ onSwitchToLogin?: () => void }> = ({
  onSwitchToLogin,
}) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState("");
  const { register } = useAuth();

  const handleTogglePassword = () => setShowPassword((v) => !v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    if (!email) newErrors.email = "Email is required";
    else if (!validateEmail(email)) newErrors.email = "Invalid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Minimum 6 characters";
    if (!confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        const result = await register(email, password);

        if (!result.session || !result.session.access_token) {
          toast.success("Registration successful!", {
            description:
              "A confirmation email has been sent to your address. Please check your inbox.",
            duration: 5000,
          });
          setEmail("");
          setPassword("");
          setConfirmPassword("");
        } else {
          // If session exists (auto-confirmation or already confirmed), AuthContext will redirect
          // No specific message needed here as redirection will happen
        }
      } catch (err) {
        console.error(err);
        const errorMessage =
          err instanceof Error ? err.message : "Registration error";
        setApiError(errorMessage);
        toast.error("Registration Failed", {
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white p-8 rounded-lg shadow-md flex flex-col gap-6"
        aria-label="Registration form"
      >
        <h1 className="text-2xl font-bold text-center mb-2">Sign Up</h1>

        {apiError && !loading && (
          <div
            className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
            role="alert"
          >
            {apiError}
          </div>
        )}

        <TextField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
          placeholder="Enter your email"
          ariaLabel="Email"
        />
        <div className="relative">
          <TextField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
            placeholder="Enter your password"
            ariaLabel="Password"
          />
          <button
            type="button"
            tabIndex={0}
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={handleTogglePassword}
            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
        <TextField
          label="Confirm password"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          required
          placeholder="Re-enter your password"
          ariaLabel="Confirm password"
        />
        <Button
          type="submit"
          loading={loading}
          ariaLabel="Sign up"
          tabIndex={0}
        >
          Sign up
        </Button>
        <button
          type="button"
          tabIndex={0}
          className="text-blue-600 hover:underline text-sm mt-2"
          aria-label="Already have an account? Sign in"
          onClick={onSwitchToLogin}
        >
          Already have an account? Sign in
        </button>
      </form>
    </div>
  );
};

export default RegistrationPage;
