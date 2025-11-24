import React from "react";

const RoomTabs = ({
  activeTab,
  setActiveTab,
  problemsCount,
  membersCount,
  pendingRequestCount,
}) => {
  return (
    <nav className="room-tabs">
      <button
        onClick={() => setActiveTab("Problems")}
        className={`tab-btn ${activeTab === "Problems" ? "active" : ""}`}
      >
        Problems ({problemsCount})
      </button>

      <button
        onClick={() => setActiveTab("Leaderboard")}
        className={`tab-btn ${activeTab === "Leaderboard" ? "active" : ""}`}
      >
        Leaderboard
      </button>

      <button
        onClick={() => setActiveTab("Members")}
        className={`tab-btn ${activeTab === "Members" ? "active" : ""}`}
      >
        Members ({membersCount})
      </button>

      <button
        onClick={() => setActiveTab("Requests")}
        className={`tab-btn ${activeTab === "Requests" ? "active" : ""}`}
      >
        Requests
        {pendingRequestCount > 0 && (
          <span className="notification-badge">
            {pendingRequestCount}
          </span>
        )}
      </button>

      <button
        onClick={() => setActiveTab("Friends")}
        className={`tab-btn ${activeTab === "Friends" ? "active" : ""}`}
      >
        Friends
      </button>
    </nav>
  );
};

export default RoomTabs;
