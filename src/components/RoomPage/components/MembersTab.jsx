// src/components/RoomPage/components/MembersTab.jsx
import React from "react";
import "./MembersTab.css"; // <--- Add this import

const MembersTab = ({ members, room, user, friends, sentRequests, onAddFriend, defaultPhoto }) => {
  return (
    // Note: 'card' class comes from global/RoomPage css, 'members-container' from local css
    <div className="members-container card">
      <div className="member-grid">
        {members.map((m) => {
          const isCurrentUser = m.id === user?.uid;
          const isFriend = friends.includes(m.id);
          const hasSentRequest = sentRequests.some(
            (req) => req.receiverId === m.id
          );

          return (
            <div key={m.id} className="member-card">
              <img
                src={m.photoURL}
                alt={m.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultPhoto;
                }}
              />

              <div className="member-info">
                <span className="member-name">{m.name}</span>
              </div>

              {/* Owner badge */}
              {m.id === room?.adminId && (
                <span className="owner-badge">ADMIN</span>
              )}

              {/* Add Friend button */}
              {!isCurrentUser && !isFriend && !hasSentRequest && (
                <button
                  className="add-friend-btn"
                  onClick={() => onAddFriend(m.id)}
                  title="Add Friend"
                >
                  +
                </button>
              )}

              {/* Pending badge */}
              {hasSentRequest && (
                <span className="pending-badge">Pending</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MembersTab;