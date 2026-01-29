import React, { useState } from "react";
import leetcodeLogo from "../../../assets/leetcode.png";
import youtubeLogo from "../../../assets/youtube.png";
import gfgLogo from "../../../assets/gfg.png";
import "./ProblemsTab.css";

// --- Icons ---
const EditIcon = () => (
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
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const TrashIcon = () => (
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
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const getDifficultyClass = (level) => {
  if (level === "Easy") return "difficulty-easy";
  if (level === "Medium") return "difficulty-medium";
  if (level === "Hard") return "difficulty-hard";
  return "";
};

const ProblemsTab = ({
  problems,
  onAddProblem,
  onEditProblem,
  onDeleteProblem,
  currentUserId,
  roomAdminId,
}) => {
  const [hoveredId, setHoveredId] = useState(null);
  const [showPreview, setShowPreview] = useState(
    localStorage.getItem("showProblemPreview") === "true",
  );
  const isSolvedByUser = (problem, userId) => {
    return !!problem.completedBy?.[userId];
  };

  const isAdmin = currentUserId === roomAdminId;

  const handleTogglePreview = () => {
    setShowPreview((prev) => {
      localStorage.setItem("showProblemPreview", !prev);
      return !prev;
    });
  };

  return (
    <div className="problems-container">
      {/* Header */}
      <div className="problems-header">
        <h3>Problems in this Room</h3>

        <div className="toggle-addprobtm">
          <div className="preview-toggle" title="Show problem preview on hover">
            <span>Preview on Hover</span>
            <div
              className={`toggle-switch ${showPreview ? "on" : ""}`}
              onClick={handleTogglePreview}
            >
              <div className="toggle-knob" />
            </div>
          </div>

          {/* Always show Add button, or condition it on isAdmin if preferred */}
          <button className="add-prob-btn" onClick={onAddProblem}>
            + Add Problem
          </button>
        </div>
      </div>

      {/* Table Scroll Area */}
      <div className="table-scroll-container">
        <div className="table-inner">
          <table className="problems-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>S.No</th>
                <th style={{ width: "35%" }}>Problem Title</th>
                <th style={{ width: "100px", textAlign: "center" }}>Solved</th>
                <th style={{ width: "100px" }}>Difficulty</th>
                <th style={{ textAlign: "center", width: "80px" }}>Platform</th>
                <th style={{ textAlign: "center", width: "80px" }}>Link</th>
                {/* <th style={{ width: "15%" }}>Added By</th> */}
                <th style={{ textAlign: "right", width: "100px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((p, index) => (
                <tr key={p.id}>
                  <td>{index + 1}</td>

                  {/* Title & Tooltip */}
                  <td style={{ position: "relative" }}>
                    <div
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

                      {/* Tooltip Popup */}
                      {showPreview &&
                        hoveredId === p.id &&
                        p.problemStatement && (
                          <div className="problem-tooltip-fixed">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: p.problemStatement,
                              }}
                            />
                          </div>
                        )}
                    </div>
                  </td>

                  <td style={{ textAlign: "center" }}>
                    {isSolvedByUser(p, currentUserId) ? (
                      <span className="difficulty-badge difficulty-easy">
                        ✓ Solved
                      </span>
                    ) : (
                      <span className="difficulty-badge difficulty-hard">
                        ✖ To-Do
                      </span>
                    )}
                  </td>

                  {/* Difficulty */}
                  <td>
                    <span
                      className={`difficulty-badge ${getDifficultyClass(p.difficulty)}`}
                    >
                      {p.difficulty}
                    </span>
                  </td>

                  {/* Platform */}
                  <td style={{ textAlign: "center" }}>
                    <a href={p.link} target="_blank" rel="noopener noreferrer">
                      <img
                        src={p.platform === "gfg" ? gfgLogo : leetcodeLogo}
                        alt={p.platform}
                        className="platform-logo"
                        title={
                          p.platform === "gfg" ? "GeeksforGeeks" : "LeetCode"
                        }
                      />
                    </a>
                  </td>

                  {/* YouTube */}
                  <td className="youtube-cell" style={{ textAlign: "center" }}>
                    {p.youtubeLink ? (
                      <a
                        href={p.youtubeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Watch Solution"
                      >
                        <img
                          src={youtubeLogo}
                          alt="YouTube"
                          className="platform-logo"
                        />
                      </a>
                    ) : (
                      <span
                        style={{
                          color: "#cbd5e1",
                          fontWeight: "bold",
                          fontSize: "1.2rem",
                        }}
                      >
                        --
                      </span>
                    )}
                  </td>

                  {/* Added By */}
                  {/* <td
                    style={{
                      color: "#64748b",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                    }}
                  >
                    {p.addedBy}
                  </td> */}

                  {/* Actions */}
                  <td
                    className="actions-cell"
                  >
                    <button
                      className="action-btn edit"
                      onClick={() => onEditProblem(p)}
                      title="Edit Problem"
                    >
                      <EditIcon />
                    </button>
                    {isAdmin && (
                      <button
                        className="action-btn delete"
                        onClick={() => onDeleteProblem(p.id)}
                        title="Delete Problem"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {/* Empty State */}
              {problems.length === 0 && (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <p>No problems added yet</p>
                    <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                      Click “+ Add Problem” to start this room
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Helper */}
      {/* {problems.length > 0 && (
        <div className="helper-message">
          Help your peers learn! Use the Edit icon to add YouTube solution links.
        </div>
      )} */}
    </div>
  );
};

export default ProblemsTab;
