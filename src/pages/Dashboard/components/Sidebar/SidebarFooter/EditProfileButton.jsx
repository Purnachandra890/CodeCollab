// components/EditProfileButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const EditProfileButton = ({ isLeetcodeMissing, isGfgMissing }) => {
  const navigate = useNavigate();

  return (
    <button
      className="sidebar-btn edit-profile-btn"
      onClick={() => navigate("/editProfile")}
    >
      Edit Profile
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
