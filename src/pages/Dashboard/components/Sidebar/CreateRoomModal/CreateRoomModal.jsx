// CreateRoomModal.jsx
import React from "react";

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
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>

        <h2>Create a New Room</h2>

        <form onSubmit={onSubmit}>
          <p>Enter a name for your new room to get started.</p>

          <input
            type="text"
            placeholder="e.g., Linked List"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
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
