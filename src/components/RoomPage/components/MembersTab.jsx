// src/components/RoomPage/components/MembersTab.jsx
import React from "react";

const MembersTab = ({ members, room, user, friends, sentRequests, onAddFriend, defaultPhoto }) => {
  return (
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
                <span className="owner-badge">OWNER</span>
              )}

              {/* Add Friend button */}
              {!isCurrentUser && !isFriend && !hasSentRequest && (
                <button
                  className="add-friend-btn"
                  onClick={() => onAddFriend(m.id)}
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
