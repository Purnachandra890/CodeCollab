import React from "react";
import { useNavigate } from "react-router-dom";

const EditProfileButton = ({ isLeetcodeMissing, isGfgMissing }) => {
  const navigate = useNavigate();

  return (
    <button
      className="sidebar-btn edit-profile-btn"
      onClick={() => navigate("/editProfile")}
    >
      {/* User Icon */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      
      <span>Edit Profile</span>

      {(isLeetcodeMissing || isGfgMissing) && (
        <span
          className="profile-warning-badge"
          title={
            isLeetcodeMissing && isGfgMissing
              ? "Add LeetCode & GFG usernames"
              : isLeetcodeMissing
              ? "Add LeetCode username"
              : "Add GFG username"
          }
        >
          !
        </span>
      )}
    </button>
  );
};

export default EditProfileButton;