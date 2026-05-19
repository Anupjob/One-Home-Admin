import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

const AdminAccess = ({ children, socket }) => {
  const [auth, setAuth] = useState({ token: null, role: null, loading: true });
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("loginDetails");
    const role = localStorage.getItem("role");
    setAuth({ token, role, loading: false });
  }, []);

  if (auth.loading) return null; // or a loader

  if (!auth.token) return <Navigate to="/login" replace state={{ from: location }} />;

  return React.cloneElement(children, { socket });
};

export default AdminAccess;
