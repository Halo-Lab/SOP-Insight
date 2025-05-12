import * as React from "react";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";
import { useAuth } from "@/lib/context/AuthContext";

const validateEmail = (email: string) => /.+@.+\..+/.test(email);

export const LoginPage: React.FC<{ onSwitchToRegister?: () => void }> = ({
  onSwitchToRegister,
}) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    email?: string;
    password?: string;
  }>({});
  const [loading, setLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState("");
  const { login } = useAuth();

  const handleTogglePassword = () => setShowPassword((v) => !v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "Email is required";
    else if (!validateEmail(email)) newErrors.email = "Invalid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Minimum 6 characters";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        await login(email, password);
      } catch (err) {
        console.error(err);
        setApiError("Invalid email or password");
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
        aria-label="Login form"
      >
        <h1 className="text-2xl font-bold text-center mb-2">Sign In</h1>
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
        {apiError && (
          <div className="text-red-500 text-sm text-center">{apiError}</div>
        )}
        <Button
          type="submit"
          loading={loading}
          ariaLabel="Sign in"
          tabIndex={0}
        >
          Sign in
        </Button>
        <button
          type="button"
          tabIndex={0}
          className="text-blue-600 hover:underline text-sm mt-2"
          aria-label="Don't have an account? Register"
          onClick={onSwitchToRegister}
        >
          Don't have an account? Register
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
