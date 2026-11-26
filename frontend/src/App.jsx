import { useEffect } from "react";
import { useNavigate } from "react-router";
import { CustomerHome } from "./CustomerHome";
import { checkIsAdmin, checkIsOwner } from "./authRole";

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

    if (token) {
      if (checkIsAdmin({ user, role, token, email: user?.email })) {
        navigate("/admin", { replace: true });
        return;
      }
      if (checkIsOwner({ user, role, token, email: user?.email })) {
        localStorage.removeItem("token");
        localStorage.removeItem("ql_admin_token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        localStorage.removeItem("refresh_token");
        sessionStorage.clear();
        navigate("/login", { replace: true });
        return;
      }
    }
  }, [navigate]);

  return <CustomerHome />;
}

