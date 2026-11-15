import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Login } from "./Login";
import { checkIsAdmin } from "./authRole";

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("ql_admin_token") ||
      sessionStorage.getItem("token");

    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    let user = null;
    try {
      user = JSON.parse(userStr);
    } catch {}

    const role = localStorage.getItem("role") || sessionStorage.getItem("role") || user?.role;

    if (token && checkIsAdmin({ user, role, token, email: user?.email })) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  return <Login />;
}