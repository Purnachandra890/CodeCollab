// src/components/RoomPage/components/ProblemModal.jsx

import React, { useState, useEffect } from "react";
import "./ProblemModal.css"; // Import the separate CSS

// Icons
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const ProblemModal = ({ isOpen, onClose, onSave, problem, isSaving }) => {
  const [link, setLink] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");

  useEffect(() => {
    if (problem) {
      setLink(problem.link || "");
      setYoutubeLink(problem.youtubeLink || "");
      setDifficulty(problem.difficulty || "Easy");
    } else {
      setLink("");
      setYoutubeLink("");
      setDifficulty("Easy");
    }
  }, [problem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({ link, youtubeLink, difficulty });
    onClose();
  };

  return (
    <div className="pm-overlay">
      <div className="pm-content">
        <button className="pm-close-btn" onClick={onClose}>
          <CloseIcon />
        </button>

        <div className="pm-header">
          <h2>{problem ? "Edit Problem" : "Add Problem"}</h2>
          <p>Paste the link to a LeetCode or GFG problem.</p>
        </div>

        <form onSubmit={handleSubmit} className="pm-form">
          <div className="pm-group">
            <label htmlFor="link">Problem URL</label>
            <input
              id="link"
              className="pm-input"
              type="url"
              placeholder="https://leetcode.com/problems/..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="pm-group">
            <label htmlFor="difficulty">Difficulty</label>
            <select
              id="difficulty"
              className="pm-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="pm-group">
            <label htmlFor="youtubeLink">YouTube Solution (Optional)</label>
            <input
              id="youtubeLink"
              className="pm-input"
              type="url"
              placeholder="https://youtu.be/..."
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="pm-submit-btn"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : problem ? "Save Changes" : "Add Problem"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProblemModal;