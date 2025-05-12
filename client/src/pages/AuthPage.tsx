import * as React from "react";
import LoginPage from "./LoginPage";
import RegistrationPage from "./RegistrationPage";

const AuthPage: React.FC = () => {
  const [mode, setMode] = React.useState<"login" | "register">("login");

  return mode === "login" ? (
    <LoginPage onSwitchToRegister={() => setMode("register")} />
  ) : (
    <RegistrationPage onSwitchToLogin={() => setMode("login")} />
  );
};

export default AuthPage;
