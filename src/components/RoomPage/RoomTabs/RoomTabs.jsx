import React from "react";
import "./RoomTabs.css";

const RoomTabs = ({
  activeTab,
  setActiveTab,
  problemsCount = 0,
  membersCount = 0,
  pendingRequestCount = 0,
}) => {
  const tabs = [
    { id: "Problems", label: `Problems (${problemsCount})` },
    { id: "Leaderboard", label: "Leaderboard" },
    { id: "Members", label: `Members (${membersCount})` },
    {
      id: "Requests",
      label: "Requests",
      badge: pendingRequestCount,
    },
    { id: "Friends", label: "Friends" },
  ];

  return (
    <nav className="room-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
        >
          {tab.label}

          {/* Render Badge if it exists and is > 0 */}
          {tab.badge > 0 && (
            <span className="notification-badge">{tab.badge}</span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default RoomTabs;
