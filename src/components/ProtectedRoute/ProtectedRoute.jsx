// ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    window.alert("You must be logged in to access this page!");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
