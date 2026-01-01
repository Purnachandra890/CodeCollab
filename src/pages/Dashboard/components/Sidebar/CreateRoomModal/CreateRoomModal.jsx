import React from "react";
import "./CreateRoomModal.css"; // Import the separate CSS

const CreateRoomModal = ({
  isOpen,
  roomName,
  setRoomName,
  isCreatingRoom,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Stop click propagation so clicking inside the modal doesn't close it */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h2 className="modal-title">Create a New Room</h2>
          <button className="modal-close-btn" onClick={onClose}>
            {/* Simple X icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <p className="modal-description">
          Enter a name for your new room to get started.
        </p>

        <form className="modal-form" onSubmit={onSubmit}>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g., Linked List"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
            autoFocus
            disabled={isCreatingRoom}
          />

          <button
            type="submit"
            className="modal-submit-btn"
            disabled={isCreatingRoom}
          >
            {isCreatingRoom ? "Creating..." : "Create Room"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;