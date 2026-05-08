import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../AuthContext"; // Adjust path as needed
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase"; // Adjust path as needed
import "./RoomHeader.css";

// --- Icons ---
const ListIcon = () => (
  <svg
    className="btn-icon"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6h16M4 10h16M4 14h16M4 18h16"
    />
  </svg>
);

const ChatIcon = () => (
  <svg
    className="btn-icon"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
    />
  </svg>
);

const InviteIcon = () => (
  <svg
    className="btn-icon"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg
    className="btn-icon"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

const RoomHeader = ({ room, roomId, unreadCount, setIsInviteModalOpen }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const defaultPhoto =
    "https://static.vecteezy.com/system/resources/previews/000/550/731/original/user-icon-vector.jpg";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="room-header">
      <div className="name-profile">
        <h1 className="room-title">{room?.name || "Room"}</h1>

        <div className="right-side-group">

          {/* My Problems Button */}
          <button
            className="header-btn secondary-btn"
            onClick={() => navigate(`/room/${roomId}/problems`)}
            title="View My Problems"
          >
            <ListIcon /> My Problems
          </button>

          {/* Chat Button */}
          <button
            className="header-btn primary-btn chat-btn-wrapper"
            onClick={() => navigate(`/room/${roomId}/chatMessages`)}
            title="Open Chat"
          >
            <ChatIcon /> Chat
            {unreadCount > 0 && (
              <span className="chat-badge">{unreadCount}</span>
            )}
          </button>

          {/* Invite Button */}
          <button
            className="header-btn secondary-btn"
            onClick={() => setIsInviteModalOpen(true)}
            title="Invite Members"
          >
            <InviteIcon /> Invite
          </button>

          {/* Profile Dropdown */}
          <div className="profile-wrapper" ref={profileRef}>
            <img
              src={user?.photoURL || defaultPhoto}
              alt="Profile"
              className="profile-avatar"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              onError={(e) => (e.target.src = defaultPhoto)}
            />

            {isProfileOpen && (
              <div className="profile-dropdown">
                <button
                  className="profile-dropdown-item logout"
                  onClick={handleLogout}
                >
                  <LogoutIcon /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default RoomHeader;
