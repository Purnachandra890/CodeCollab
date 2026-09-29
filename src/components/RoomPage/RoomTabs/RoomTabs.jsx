import React from "react";
import "./RoomTabs.css";

const RoomTabs = ({
  activeTab,
  setActiveTab,
  problemsCount = 0,
  membersCount = 0,
  pendingRequestCount = 0,
  solvedCount = 0,
  totalProblems = 0,
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

  // Progress calculations
  const total =
    typeof totalProblems === "number" && totalProblems >= 0
      ? totalProblems
      : parseInt(problemsCount, 10) || 0;
  const solved = Math.min(solvedCount, total);
  const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;

  const circleRadius = 14;
  const strokeWidth = 3.2;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset =
    circumference - (percentage / 100) * circumference;

  return (
    <div className="room-tabs-bar">
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

      {/* ✅ My Progress Widget */}
      <div
        className="room-my-progress"
        title={`Your Progress: ${solved} of ${total} problems completed (${percentage}%)`}
      >
        <div className="progress-circle-container">
          <svg
            className="progress-circle-svg"
            width="34"
            height="34"
            viewBox="0 0 34 34"
          >
            <circle
              className="progress-circle-bg"
              cx="17"
              cy="17"
              r={circleRadius}
              strokeWidth={strokeWidth}
            />
            <circle
              className="progress-circle-fill"
              cx="17"
              cy="17"
              r={circleRadius}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <span className="progress-circle-text">{percentage}%</span>
        </div>

        <div className="progress-info-text">
          <span className="progress-bold-count">
            {solved}/{total}
          </span>{" "}
          problems done
        </div>
      </div>
    </div>
  );
};

export default RoomTabs;

