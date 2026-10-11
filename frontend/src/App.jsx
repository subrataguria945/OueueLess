import { useState } from "react";
import { Login } from "./Login";
import { Register } from "./register";
import { ForgotPassword } from "./ForgotPassword";

export default function App() {
  const [view, setView] = useState("login"); // "login" | "register" | "forgot"

  if (view === "register") {
    return <Register onSwitchToLogin={() => setView("login")} />;
  }

  if (view === "forgot") {
    return <ForgotPassword onSwitchToLogin={() => setView("login")} />;
  }

  return (
    <Login
      onSwitchToRegister={() => setView("register")}
      onSwitchToForgot={() => setView("forgot")}
    />
  );
}