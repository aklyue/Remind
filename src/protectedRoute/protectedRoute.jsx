import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ redirectTo = "/authorization" }) => {
  const token = localStorage.getItem("token");
  console.log(token)
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate(redirectTo, { replace: true });
  }, [token, navigate, redirectTo]);

  return token ? <Outlet /> : null;
};

export default ProtectedRoute;
