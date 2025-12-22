// components/LogoutButton.jsx
import React from "react";

const LogoutButton = ({ onClick }) => {
  return (
    <button className="sidebar-btn" onClick={onClick}>
      Logout
    </button>
  );
};

export default LogoutButton;
