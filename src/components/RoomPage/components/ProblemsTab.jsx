// src/components/RoomPage/components/ProblemsTab.jsx
import React, { useState } from "react";
import leetcodeLogo from "../../../assets/leetcode.png";
import youtubeLogo from "../../../assets/youtube.png";
import gfgLogo from "../../../assets/gfg.png";

// Icons used in the Actions column
const EditIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

function getDifficultyColor(difficulty) {
  switch (difficulty) {
    case "Easy":
      return "#22c55e";
    case "Medium":
      return "#eab308";
    case "Hard":
      return "#ef4444";
    default:
      return "#6b7280";
  }
}

function getDifficultyClass(level) {
  if (level === "Easy") return "difficulty-easy";
  if (level === "Medium") return "difficulty-medium";
  if (level === "Hard") return "difficulty-hard";
  return "";
}

const ProblemsTab = ({
  problems,
  onAddProblem,
  onEditProblem,
  onDeleteProblem,
}) => {
  const [hoveredId, setHoveredId] = useState(null);
  const [showPreview, setShowPreview] = useState(() => {
    const saved = localStorage.getItem("showProblemPreview");
    return saved === "true"; // default false
  });

  const handleTogglePreview = () => {
    setShowPreview((prev) => {
      localStorage.setItem("showProblemPreview", !prev);
      return !prev;
    });
  };

  return (
    <div className="problems-container card">
      <div className="problems-header">
        <h3>Problems in this Room</h3>
        <div className="toggle-addprobtm">
          <div className="preview-toggle">
            <span className="toggle-label-text">Show problem preview</span>

            <div
              className={`toggle-switch ${showPreview ? "on" : ""}`}
              onClick={handleTogglePreview}
            >
              <div className="toggle-knob" />
            </div>
          </div>

          <button className="primary-btn" onClick={onAddProblem}>
            + Add Problem
          </button>
        </div>
      </div>

      <div className="table-scroll-container">
        <table className="problems-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Problem Title</th>
              <th>Difficulty</th>
              <th>Platform</th>
              <th>Link</th>
              <th>Added By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((p, index) => (
              <tr key={p.id}>
                <td>{index + 1}</td>
                {/* Title column (click opens problem link) */}
                <td style={{ position: "relative" }}>
                  <div
                    className="problem-hover-wrapper"
                    onMouseEnter={() => setHoveredId(p.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="problem-title"
                    >
                      {p.title}
                    </a>

                    {showPreview &&
                      hoveredId === p.id &&
                      p.problemStatement && (
                        <div
                          className="problem-tooltip-fixed"
                          onMouseEnter={() => setHoveredId(p.id)}
                          onMouseLeave={() => setHoveredId(null)}
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: p.problemStatement,
                            }}
                          />
                        </div>
                      )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`difficulty-badge ${getDifficultyClass(
                      p.difficulty
                    )}`}
                  >
                    {p.difficulty}
                  </span>
                </td>

                {/* LeetCode Logo column */}
                {/* Platform Logo column */}
                <td className="leetcode-cell">
                  <a href={p.link} target="_blank" rel="noopener noreferrer">
                    <img
                      src={p.platform === "gfg" ? gfgLogo : leetcodeLogo}
                      alt={p.platform === "gfg" ? "GeeksforGeeks" : "LeetCode"}
                      className="leetcode-logo"
                      title={
                        p.platform === "gfg"
                          ? "Solve problem on GeeksforGeeks"
                          : "Solve problem on LeetCode"
                      }
                    />
                  </a>
                </td>

                {/* YouTube column */}
                <td className="youtube-cell">
                  {p.youtubeLink ? (
                    <a
                      href={p.youtubeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Watch solution on YouTube"
                    >
                      <img
                        src={youtubeLogo}
                        alt="YouTube"
                        className="youtube-logo"
                      />
                    </a>
                  ) : (
                    <span className="no-video">{"--"}</span>
                  )}
                </td>

                {/* Added By */}
                <td>{p.addedBy}</td>

                {/* Actions */}
                <td className="actions-cell">
                  <button
                    className="action-icon-btn edit"
                    title="Edit"
                    onClick={() => onEditProblem(p)}
                  >
                    <EditIcon />
                  </button>
                  <button
                    className="action-icon-btn delete"
                    title="Delete"
                    onClick={() => onDeleteProblem(p.id)}
                  >
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom helper message */}
      <div className="message">
        <p>
          Help your peers learn! If you find a great YouTube explanation for a
          problem, please use the Edit icon to add the link.
        </p>
      </div>
    </div>
  );
};

export default ProblemsTab;
