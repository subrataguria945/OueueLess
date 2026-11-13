import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Login } from "./Login";

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("ql_admin_token") ||
      sessionStorage.getItem("token");
    if (token) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  return <Login />;
}