// src/components/Sidebar/Sidebar.jsx

import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

// --- Icons ---
const LogoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z" />
  </svg>
);
const UserIcon = () => (
  <svg
    width="20"
    height="20"
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
);
const BugIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 21a9 9 0 0 0 9-9c0-3.3-1.6-6.2-4.1-7.8"></path>
    <path d="M12 21a9 9 0 0 1-9-9c0-3.3 1.6-6.2 4.1-7.8"></path>
    <path d="M12 3v3"></path>
    <path d="M8 12h8"></path>
  </svg>
);

// --- Sub-Component: RoomList ---
const RoomList = ({ userRooms, currentRoomId, handleNavigate }) => {
  return (
    <nav className="sidebar-rooms-section">
      <h3>YOUR ROOMS</h3>
      <ul className="sidebar-room-list">
        {userRooms.map((room) => (
          <li
            key={room.id}
            onClick={() => handleNavigate(`/dashboard/room/${room.id}`)}
            className={room.id === currentRoomId ? "active-room" : ""}
          >
            {room.name}
          </li>
        ))}
      </ul>
    </nav>
  );
};

// --- Sub-Component: SidebarFooter (Integrated with Bug Report Logic) ---
const SidebarFooter = ({ isLeetcodeMissing, isGfgMissing }) => {
  const showWarning = isLeetcodeMissing || isGfgMissing;

  const handleReportBug = () => {
    const recipientEmail = "purnachandra.n17@gmail.com";
    const subject = "Bug Report: Code Collab Application";
    const body = `
Hello Support Team,
I'd like to report a bug.

- Description of Bug:
[Please describe the issue here]

- Steps to Reproduce:
1.
2.
3.

Thank you.
    `;

    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body.trim())}`;

    window.location.href = mailtoLink;
  };

  return (
    <div className="sidebar-footer">
      <Link to="/editProfile" className="sidebar-btn profile-btn">
        <UserIcon />
        <span className="btn-text">Edit Profile</span>
        {showWarning && (
          <span className="warning-dot" title="Profile incomplete">
            !
          </span>
        )}
      </Link>

      {/* Integrated Report Bug Button */}
      <button className="sidebar-btn bug-btn" onClick={handleReportBug}>
        <BugIcon />
        <span className="btn-text">Report Bug</span>
      </button>
    </div>
  );
};

// --- Main Component: Sidebar ---
const Sidebar = ({
  isSidebarOpen,
  toggleSidebar,
  userRooms,
  currentRoomId,
  handleNavigate,
  hasNewInvites,
  isLeetcodeMissing,
  isGfgMissing,
  onCreateRoom,
}) => {
  return (
    <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
      {/* 1. Header */}
      <div className="sidebar-header">
        <div
          className="logo-container"
          onClick={() => handleNavigate("/dashboard/rooms")}
        >
          <LogoIcon />
          {isSidebarOpen && <span className="brand-name">Dashboard</span>}
          {isSidebarOpen && hasNewInvites && (
            <span className="invite-dot"></span>
          )}
        </div>

        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* 2. Content (Only visible when open) */}
      {isSidebarOpen && (
        <div className="sidebar-content fade-in">
          <button className="create-room-btn" onClick={onCreateRoom}>
            + Create New Room
          </button>

          <RoomList
            userRooms={userRooms}
            currentRoomId={currentRoomId}
            handleNavigate={handleNavigate}
          />

          <SidebarFooter
            isLeetcodeMissing={isLeetcodeMissing}
            isGfgMissing={isGfgMissing}
          />
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
