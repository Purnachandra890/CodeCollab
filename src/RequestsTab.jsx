// RequestsTab.jsx
import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import "./RequestsTab.css";

const RequestsTab = ({ user }) => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const defaultPhoto =
    "https://static.vecteezy.com/system/resources/previews/000/550/731/original/user-icon-vector.jpg";

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "friend_requests"),
      where("receiverId", "==", user.uid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const requests = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const senderDoc = await getDoc(doc(db, "users", data.senderId));
          const senderData = senderDoc.exists()
            ? senderDoc.data()
            : { name: "Unknown User", photoURL: defaultPhoto };
          return {
            id: docSnap.id,
            ...data,
            senderName: senderData.name,
            senderPhoto: senderData.photoURL || defaultPhoto,
          };
        })
      );
      setIncomingRequests(requests);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAcceptRequest = async (requestId, senderId) => {
    try {
      await updateDoc(doc(db, "friend_requests", requestId), {
        status: "accepted",
      });

      const currentUserRef = doc(db, "users", user.uid);
      const senderUserRef = doc(db, "users", senderId);

      await updateDoc(currentUserRef, { friends: arrayUnion(senderId) });
      await updateDoc(senderUserRef, { friends: arrayUnion(user.uid) });
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await updateDoc(doc(db, "friend_requests", requestId), {
        status: "rejected",
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  return (
    <div className="requests-container">
      <h3>Incoming Friend Requests</h3>
      {incomingRequests.length > 0 ? (
        <ul className="requests-list">
          {incomingRequests.map((req) => (
            <li key={req.id} className="request-item">
              <div className="request-info">
                <img
                  src={req.senderPhoto}
                  alt={req.senderName}
                  className="request-photo"
                />
                <span className="request-name">{req.senderName}</span>
              </div>
              <div className="request-actions">
                {/* Ensure both buttons are here */}
                <button
                  className="accept-btn"
                  onClick={() => handleAcceptRequest(req.id, req.senderId)}
                >
                  Accept
                </button>
                <button
                  className="reject-btn"
                  onClick={() => handleRejectRequest(req.id)}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No new friend requests.</p>
      )}
    </div>
  );
};

export default RequestsTab;