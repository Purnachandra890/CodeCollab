import React from "react";
import RoomInvitesCard from "./RoomInvitesCard";
// Ensure this points to your CSS file, or keep the styles in DashboardRoom.css
import "./DashboardRoomsGrid.css"; 

export default function DashboardRoomsGrid({ 
  user, 
  rooms, 
  leetcodeUsername, 
  onDelete, 
  onCopy 
}) {
  
  // --- Local Icons (Moved here as they belong to the UI) ---
  const DeleteIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );

  const CopyIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );

  return (
    <div className="dashboard-rooms-content">
      {leetcodeUsername === "" && (
        <div className="notification-message">
          Please enter your LeetCode username to enable tracking.
        </div>
      )}    

      <RoomInvitesCard />

      <section className="rooms-grid">
        {rooms.length === 0 ? (
          <p style={{ color: "#aaa", textAlign: "center", width: "100%" }}>
            You haven't joined any rooms yet.
          </p>
        ) : (
          rooms.map((room) => (
            <div className="room-card" key={room.id}>
              <div className="card-header">
                <h3>{room.name}</h3>
                <p>Created: {room.createdAt}</p>
              </div>

              <div className="invite-link-container">
                <CopyIcon />
                <span>{`${window.location.origin.replace(/^https?:\/\//, "")}/join/ir/${room.inviteCode}`}</span>
              </div>

              <div className="card-footer">
                {user?.uid === room.adminId ? (
                  <button className="delete-btn" onClick={() => onDelete(room.id)}>
                    <DeleteIcon /> Delete
                  </button>
                ) : (
                  <div></div> /* Spacer */
                )}
                <button className="copy-link-btn" onClick={() => onCopy(room.inviteCode)}>
                  Copy Link
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}