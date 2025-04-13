import {  useEffect } from "react";
import React from "react";
import { useNavigate, Outlet } from "react-router-dom";
import c from "./protectedRoute.module.scss";

const ProtectedRoute = ({ redirectTo = "/authorization" }) => {
  const token = localStorage.getItem("token");
  console.log(token)
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate(redirectTo, { replace: true });
  }, [token, navigate, redirectTo]);

  return token ? (
    <div className={c.mainRouterContainer}>
      <Outlet />
    </div>
  ) : null;
};

export default ProtectedRoute;
