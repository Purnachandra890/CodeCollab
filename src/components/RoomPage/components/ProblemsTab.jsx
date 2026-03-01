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

const ChevronIcon = ({ expanded }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
      transition: "transform 0.2s ease",
    }}
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const getDifficultyClass = (level) => {
  if (level === "Easy") return "difficulty-easy";
  if (level === "Medium") return "difficulty-medium";
  if (level === "Hard") return "difficulty-hard";
  return "";
};

// Group problems by their subtopic string.
// Problems without a subtopic stay ungrouped (no "General" label).
const organizeBySubtopic = (problems) => {
  const groupsMap = new Map();
  const noSubtopic = [];

  problems.forEach((p) => {
    const name = (p.subtopic || "").trim();
    if (!name) {
      noSubtopic.push(p);
      return;
    }
    if (!groupsMap.has(name)) groupsMap.set(name, []);
    groupsMap.get(name).push(p);
  });

  const groups = Array.from(groupsMap.entries()).map(([title, items]) => ({
    title,
    problems: items,
  }));

  return { groups, noSubtopic };
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
  const [expandedSections, setExpandedSections] = useState(new Set());

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

  const { groups, noSubtopic } = organizeBySubtopic(problems);
  const hasProblems = problems.length > 0;

  // Build sections: [{ title, problems }] — "Other" for ungrouped, then subtopic groups
  const sections = React.useMemo(() => {
    const list = [];
    if (noSubtopic.length > 0) {
      list.push({ title: "Other", problems: noSubtopic });
    }
    groups.forEach((g) => list.push({ title: g.title, problems: g.problems }));
    return list;
  }, [groups, noSubtopic]);

  // Initialize expanded state when sections change (first section open by default)
  const sectionKeys = sections.map((s) => s.title).join(",");
  React.useEffect(() => {
    if (sections.length === 0) {
      setExpandedSections(new Set());
      return;
    }
    const firstTitle = sections[0].title;
    setExpandedSections(new Set([firstTitle]));
  }, [sectionKeys, sections.length]);

  const toggleSection = (title) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const expandAll = () => setExpandedSections(new Set(sections.map((s) => s.title)));
  const collapseAll = () => setExpandedSections(new Set());

  let serial = 1;

  const renderProblemRow = (p) => (
    <tr key={p.id}>
      <td>{serial++}</td>

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
          {showPreview && hoveredId === p.id && p.problemStatement && (
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
          <span className="difficulty-badge difficulty-easy">✓ Solved</span>
        ) : (
          <span className="difficulty-badge difficulty-hard">✖ To-Do</span>
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
            title={p.platform === "gfg" ? "GeeksforGeeks" : "LeetCode"}
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
            <img src={youtubeLogo} alt="YouTube" className="platform-logo" />
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

      {/* Actions */}
      <td className="actions-cell">
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
  );

  return (
    <div className="problems-container">
      {/* Header */}
      <div className="problems-header">
        <h3>Problems in this Room</h3>

        <div className="toggle-addprobtm">
          {hasProblems && sections.length > 0 && (
            <div className="expand-collapse-btns">
              <button
                type="button"
                className="expand-collapse-btn"
                onClick={expandAll}
              >
                Expand all
              </button>
              <button
                type="button"
                className="expand-collapse-btn"
                onClick={collapseAll}
              >
                Collapse all
              </button>
            </div>
          )}
          <div className="preview-toggle" title="Show problem preview on hover">
            <span>Preview on Hover</span>
            <div
              className={`toggle-switch ${showPreview ? "on" : ""}`}
              onClick={handleTogglePreview}
            >
              <div className="toggle-knob" />
            </div>
          </div>

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
                <th style={{ textAlign: "right", width: "100px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!hasProblems ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    <p>No problems added yet</p>
                    <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                      Click “+ Add Problem” to start this room
                    </span>
                  </td>
                </tr>
              ) : (
                <>
                  {sections.map((section) => {
                    const isExpanded = expandedSections.has(section.title);
                    return (
                      <React.Fragment key={section.title}>
                        <tr
                          className="subtopic-header-row subtopic-header-clickable"
                          onClick={() => toggleSection(section.title)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleSection(section.title);
                            }
                          }}
                        >
                          <td colSpan="7" className="subtopic-header">
                            <div className="subtopic-header-content">
                              <span className="subtopic-chevron">
                                <ChevronIcon expanded={isExpanded} />
                              </span>
                              <span className="subtopic-title">
                                {section.title}
                              </span>
                              <span className="subtopic-count">
                                ({section.problems.length})
                              </span>
                            </div>
                          </td>
                        </tr>
                        {isExpanded &&
                          section.problems.map((p) => renderProblemRow(p))}
                      </React.Fragment>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProblemsTab;

