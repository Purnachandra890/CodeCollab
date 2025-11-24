// src/components/RoomPage/components/ProblemModal.jsx

import React, { useState, useEffect } from "react";

const ProblemModal = ({ isOpen, onClose, onSave, problem, isSaving }) => {
  const [link, setLink] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");

  // When opening the modal, pre-fill fields if editing
  useEffect(() => {
    if (problem) {
      setLink(problem.link || "");
      setYoutubeLink(problem.youtubeLink || "");
    } else {
      setLink("");
      setYoutubeLink("");
    }
  }, [problem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit =async (e) => {
    e.preventDefault();
    await onSave({ link, youtubeLink });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>

        <h2>{problem ? "Edit Problem" : "Add New Problem"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="link">Problem Link</label>
            <input
              id="link"
              type="url"
              placeholder="https://leetcode.com/problems/palindrome-number/"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="youtubeLink">
              YouTube Solution Link (Optional)
            </label>
            <input
              id="youtubeLink"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="modal-submit-btn"
            disabled={isSaving}
          >
            {isSaving ? "Adding..." : problem ? "Save Changes" : "Add Problem"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProblemModal;
