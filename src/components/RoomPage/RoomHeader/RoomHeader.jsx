import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../AuthContext";

/* Icons moved here */
const ListIcon = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
    <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5S3.17 13.5 4 13.5 5.5 12.83 5.5 12 4.83 10.5 4 10.5zm0-6C3.17 4.5 2.5 5.17 2.5 6S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.67-1.5 1.5S3.17 19.5 4 19.5 5.5 18.83 5.5 18 4.83 16.5 4 16.5zM8 6h12v2H8V6zm0 6h12v2H8v-2zm0 6h12v2H8v-2z"/>
  </svg>
);


const ChatIcon = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
  </svg>
);

const InviteIcon = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 
             5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 
             2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 
             8s1.34 3 3 3zm8 2c-1.33 0-4 .67-4 
             2v2h8v-2c0-1.33-2.67-2-4-2zm-8 
             0c-1.33 0-4 .67-4 
             2v2h8v-2c0-1.33-2.67-2-4-2z"/>
  </svg>
);



const RoomHeader = ({ room, roomId, unreadCount, setIsInviteModalOpen }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="room-header">
      <div className="name-profile">
        <h1 className="room-title">{room.name}</h1>

        <div className="right-side-group">
          <button
            className="secondary-btn"
            onClick={() => navigate(`/room/${roomId}/problems`)}
          >
            <ListIcon /> My Problems
          </button>

          <button
            className="primary-btn chat-btn-with-badge"
            onClick={() => navigate(`/room/${roomId}/chatMessages`)}
          >
            <ChatIcon />
            Chat
            {unreadCount > 0 && (
              <span className="chat-badge">{unreadCount}</span>
            )}
          </button>

          <button
            className="secondary-btn"
            onClick={() => setIsInviteModalOpen(true)}
          >
            <InviteIcon /> Invite
          </button>

          <img
            src={user?.photoURL || defaultPhoto}
            alt="User"
            className="logo"
            onError={(e) => (e.target.src = defaultPhoto)}
          />
        </div>
      </div>
    </header>
  );
};

export default RoomHeader;
