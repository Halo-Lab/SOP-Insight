import * as React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "@/pages/AuthPage";
import HomePage from "@/pages/HomePage";
import { useAuth } from "@/lib/context/AuthContext";
import { AuthProvider } from "@/lib/context/AuthContext";
import { EmailConfirmationPage } from "@/pages/EmailConfirmationPage";
import { Toaster } from "@/components/ui/Toast";
import { Loader } from "@/components/ui/Loader";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AuthRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <AuthPage />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthRedirect />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route path="/email-confirmation" element={<EmailConfirmationPage />} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
