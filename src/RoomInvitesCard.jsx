// RoomInvitesCard.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";
import "./RoomInvitesCard.css";

const RoomInvitesCard = () => {
  const { user } = useAuth();
  const [invites, setInvites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.uid) return;

    // Listen for incoming invites where the status is 'pending'
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
      // 1. Update the invite status to 'accepted'
      await updateDoc(doc(db, "room_invites", inviteId), {
        status: "accepted",
      });

      // 2. Add the user to the room's members list
      const roomRef = doc(db, "rooms", roomId);
      await updateDoc(roomRef, {
        members: arrayUnion(user.uid),
      });

      alert("You have joined the room!");
      navigate(`/dashboard/room/${roomId}`);
    } catch (error) {
      console.error("Error accepting room invite:", error);
      alert("Failed to accept invite.");
    }
  };

  const handleDecline = async (inviteId) => {
    try {
      // Just update the invite status to 'rejected'
      await updateDoc(doc(db, "room_invites", inviteId), {
        status: "rejected",
      });
      alert("Invite declined.");
    } catch (error) {
      console.error("Error declining room invite:", error);
    }
  };

  if (invites.length === 0) {
    return null; // Don't render if there are no invites
  }

  return (
    <div className="room-invites-card card">
      <h3>Room Invites</h3>
      <ul className="invites-list">
        {invites.map((invite) => (
          <li key={invite.id} className="invite-item">
            <div className="invite-info">
              <span className="invite-from">
                From: {invite.senderId.substring(0, 6)}...
              </span>
              <span className="invite-room-name">
                Room: **{invite.roomName}**
              </span>
            </div>
            <div className="invite-actions">
              <button
                onClick={() => handleAccept(invite.id, invite.roomId)}
                className="accept-invite-btn"
              >
                Accept
              </button>
              <button
                onClick={() => handleDecline(invite.id)}
                className="decline-invite-btn"
              >
                Decline
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomInvitesCard;