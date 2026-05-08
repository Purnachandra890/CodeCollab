// src/components/RoomPage/components/ProblemModal.jsx

import React, { useState, useEffect } from "react";
import "./ProblemModal.css";

const CREATE_NEW = "__create_new__";

// Icons
const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const ProblemModal = ({
  isOpen,
  onClose,
  onSave,
  problem,
  isSaving,
  availableSubtopics = [],
  defaultSubtopic = "",
}) => {
  const [link, setLink] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [selectedSubtopic, setSelectedSubtopic] = useState("");
  const [newSubtopicName, setNewSubtopicName] = useState("");

  useEffect(() => {
    if (problem) {
      setLink(problem.link || "");
      setYoutubeLink(problem.youtubeLink || "");
      setDifficulty(problem.difficulty || "Easy");
      setSelectedSubtopic(problem.subtopic || "");
      setNewSubtopicName("");
    } else {
      setLink("");
      setYoutubeLink("");
      setDifficulty("Easy");
      setSelectedSubtopic(defaultSubtopic || (availableSubtopics[0] ?? ""));
      setNewSubtopicName("");
    }
  }, [problem, isOpen, defaultSubtopic, availableSubtopics]);

  if (!isOpen) return null;

  const getFinalSubtopic = () => {
    if (selectedSubtopic === CREATE_NEW) {
      return newSubtopicName.trim();
    }
    return (selectedSubtopic || "").trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await onSave({
      link,
      youtubeLink,
      difficulty,
      subtopic: getFinalSubtopic(),
    });

    if (result && result.success === false) {
      return; // Do not close modal if there's an error
    }

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
            <label htmlFor="subtopic">Subtopic (Optional)</label>
            <select
              id="subtopic"
              className="pm-select"
              value={selectedSubtopic}
              onChange={(e) => setSelectedSubtopic(e.target.value)}
            >
              <option value="">— No subtopic —</option>
              {availableSubtopics.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
              <option value={CREATE_NEW}>+ Create new subtopic</option>
            </select>
            {selectedSubtopic === CREATE_NEW && (
              <input
                className="pm-input pm-input-inline"
                type="text"
                placeholder="Enter new subtopic name"
                value={newSubtopicName}
                onChange={(e) => setNewSubtopicName(e.target.value)}
                autoFocus
              />
            )}
          </div>

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

