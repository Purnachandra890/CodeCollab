import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useAuth } from "../../../AuthContext";
import "./RoomInvitesCard.css";

const RoomInvitesCard = () => {
  const { user } = useAuth();
  const [invites, setInvites] = useState([]);
  const navigate = useNavigate();

  // --- Icons ---
  const InviteIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  );

  const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  const XIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "room_invites"),
      where("receiverId", "==", user.uid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInvites(
        snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
      );
    });

    return () => unsubscribe();
  }, [user]);

  const handleAccept = async (inviteId, roomId) => {
    try {
      await updateDoc(doc(db, "room_invites", inviteId), { status: "accepted" });
      const roomRef = doc(db, "rooms", roomId);
      await updateDoc(roomRef, { members: arrayUnion(user.uid) });
      alert("You have joined the room!");
      navigate(`/dashboard/room/${roomId}`);
    } catch (error) {
      console.error("Error accepting room invite:", error);
      alert("Failed to accept invite.");
    }
  };

  const handleDecline = async (inviteId) => {
    try {
      await updateDoc(doc(db, "room_invites", inviteId), { status: "rejected" });
    } catch (error) {
      console.error("Error declining room invite:", error);
    }
  };

  if (invites.length === 0) return null;

  return (
    <div className="room-invites-container">
      <div className="invites-header">
        <h3>Pending Invitations</h3>
        <span className="invite-count">{invites.length}</span>
      </div>
      
      <div className="invites-grid">
        {invites.map((invite) => (
          <div key={invite.id} className="invite-card">
            <div className="invite-icon-wrapper">
              <InviteIcon />
            </div>
            
            <div className="invite-content">
              <span className="invite-title">
                Invited to <strong>{invite.roomName}</strong>
              </span>
              <span className="invite-meta">
                From: {invite.senderId ? `${invite.senderId.substring(0, 8)}...` : "Unknown"}
              </span>
            </div>

            <div className="invite-actions">
              <button
                onClick={() => handleAccept(invite.id, invite.roomId)}
                className="action-btn accept-btn"
                title="Accept"
              >
                <CheckIcon /> Accept
              </button>
              <button
                onClick={() => handleDecline(invite.id)}
                className="action-btn decline-btn"
                title="Decline"
              >
                <XIcon /> Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomInvitesCard;