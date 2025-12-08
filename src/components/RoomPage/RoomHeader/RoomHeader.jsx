import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../AuthContext";

/* Icons moved here */
const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"></path>
  </svg>
);

const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4C2.9 2 2 2.9 2 4V18L6 14H20C21.1 14 22 13.1 22 12V4C22 2.9 21.1 2 20 2Z" />
  </svg>
);

const InviteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11h-3V8h-2v3H8v2h3v3h2v-3h3v-2zM21 17h-2v2h-2v-2h-2v-2h2v-2h2v2h2v2zM12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
  </svg>
);

const RoomHeader = ({ room, roomId, unreadCount, setIsInviteModalOpen }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="room-header">
      <div className="name-profile">
        <h1>{room.name}</h1>
        <img
          src={user?.photoURL || defaultPhoto}
          alt="User"
          onError={(e) => (e.target.src = defaultPhoto)}
          className="logo"
        />
      </div>

      <div className="room-header-actions">
        <button
          className="secondary-btn"
          onClick={() => navigate(`/room/${roomId}/problems`)}
        >
          <ListIcon /> My Personal List
        </button>

        <button
          className="primary-btn chat-btn-with-badge"
          onClick={() => navigate(`/room/${roomId}/chatMessages`)}
        >
          <ChatIcon />Room Chat
          {unreadCount > 0 && <span className="chat-badge">{unreadCount}</span>}
        </button>

        <button
          className="secondary-btn"
          onClick={() => setIsInviteModalOpen(true)}
        >
          <InviteIcon /> Invite Friends
        </button>
      </div>
    </header>
  );
};

export default RoomHeader;
