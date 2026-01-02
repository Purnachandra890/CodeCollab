// ProtectedRoute.jsx
// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "../../AuthContext";

// const ProtectedRoute = ({ children }) => {
//   const { user } = useAuth();

//   if (!user) {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // if (!user) {
  //   // 🔴 Save where the user wanted to go
  //   sessionStorage.setItem(
  //     "redirectAfterLogin",
  //     location.pathname + location.search
  //   );

  //   return <Navigate to="/" replace />;
  // }
  if (!user) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
