import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import "./InviteFriendsModal.css"; // Ensure this matches file path
import emailjs from "emailjs-com";

// Simple SVG Spinner Component
const Spinner = () => (
  <svg className="spinner" viewBox="0 0 50 50">
    <circle
      className="path"
      cx="25"
      cy="25"
      r="20"
      fill="none"
      strokeWidth="5"
    ></circle>
  </svg>
);

const InviteFriendsModal = ({ isOpen, onClose, user, roomId }) => {
  const [friendsList, setFriendsList] = useState([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [newInviteRecipient, setNewInviteRecipient] = useState("");
  const [emailCheckStatus, setEmailCheckStatus] = useState("idle");
  const defaultPhoto = "https://static.vecteezy.com/system/resources/previews/000/550/731/original/user-icon-vector.jpg";

  // --- Logic Hooks (Same as before) ---
  useEffect(() => {
    if (!newInviteRecipient || newInviteRecipient.length < 3) {
      setEmailCheckStatus("idle");
      return;
    }
    setEmailCheckStatus("checking");
    const timer = setTimeout(async () => {
      try {
        let userExists = false;
        if (newInviteRecipient.includes("@")) {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", newInviteRecipient));
          const snap = await getDocs(q);
          if (!snap.empty) userExists = true;
        } else {
          const userDoc = await getDoc(doc(db, "users", newInviteRecipient));
          if (userDoc.exists()) userExists = true;
        }
        setEmailCheckStatus(userExists ? "found" : "not-found");
      } catch (error) {
        console.error("Error checking user:", error);
        setEmailCheckStatus("error");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [newInviteRecipient]);

  useEffect(() => {
    if (!isOpen || !user?.uid) return;
    setIsLoadingFriends(true);
    const unsub = onSnapshot(doc(db, "users", user.uid), async (userSnap) => {
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const friendUIDs = userData.friends || [];
        const friendsDetails = await Promise.all(
          friendUIDs.map(async (friendId) => {
            const friendDoc = await getDoc(doc(db, "users", friendId));
            return friendDoc.exists() ? { id: friendId, ...friendDoc.data() } : null;
          })
        );
        setFriendsList(friendsDetails.filter(Boolean));
      } else {
        setFriendsList([]);
      }
      setIsLoadingFriends(false);
    });
    return () => unsub();
  }, [isOpen, user]);

  // --- Handlers ---
  const handleSelectFriend = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    );
  };

  const handleSelectAll = () => {
    setSelectedFriends(
      selectedFriends.length === friendsList.length ? [] : friendsList.map((f) => f.id)
    );
  };

  const handleSendInvites = async () => {
    if (selectedFriends.length === 0) return alert("Select at least one friend.");
    try {
      const roomSnap = await getDoc(doc(db, "rooms", roomId));
      if (!roomSnap.exists()) return alert("Room not found!");
      
      const roomData = roomSnap.data();
      const currentMembers = roomData.members || [];
      const roomName = roomData.name || "the room";
      
      const toInvite = selectedFriends.filter(id => !currentMembers.includes(id));
      if (toInvite.length === 0) return alert("Selected friends are already members.");

      await Promise.all(toInvite.map(friendId => 
        addDoc(collection(db, "room_invites"), {
          senderId: user.uid, receiverId: friendId, roomId, roomName,
          status: "pending", createdAt: serverTimestamp()
        })
      ));
      
      alert(`Sent ${toInvite.length} invites!`);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to send invites.");
    }
  };

  const handleSendDirectInvite = async (e) => {
    e.preventDefault();
    if (emailCheckStatus !== "found") return alert("Enter a valid user email/ID.");
    
    // ... (Keep existing direct invite logic logic here - truncated for brevity as it was fine) ...
    // Just ensure you call onClose() on success
  };

  const handleSendInvitesEmail = (e) => {
    e.preventDefault();
    const emails = selectedFriends
      .map(id => friendsList.find(f => f.id === id)?.email)
      .filter(Boolean);

    if (emails.length === 0) return alert("Select friends with valid emails.");

    emailjs.send(
      "service_ng8k2bc", "template_bowryek",
      { to_name: "Group", from_name: "CodeCollab", message: "Join CodeCollab Room!", to_email: emails.join(", ") },
      "W66kHP4-mU-MLTK7X"
    ).then(() => {
       alert("Email invites sent!");
    }).catch(err => console.error(err));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2>Invite Friends</h2>

        {/* Direct Invite Form */}
        <form onSubmit={handleSendDirectInvite} className="direct-invite-form">
          <label htmlFor="direct-invite-input">Invite by Email or User ID</label>
          <div className="direct-invite-input-group">
            <input
              id="direct-invite-input"
              type="text"
              value={newInviteRecipient}
              onChange={(e) => setNewInviteRecipient(e.target.value)}
              placeholder="user@example.com"
            />
            <button type="submit" className="send-btn">Send</button>
          </div>
          
          <div className="email-check-status">
            {emailCheckStatus === "checking" && <span className="email-status-checking"><Spinner /> Checking...</span>}
            {emailCheckStatus === "found" && <span className="email-status-found">User Found!</span>}
            {emailCheckStatus === "not-found" && <span className="email-status-not-found">User Not Found</span>}
          </div>
        </form>

        {/* Friend Selection List */}
        <div className="invite-list-header">
          <span>Select from Friends</span>
          <button onClick={handleSelectAll} className="select-all-btn">
            {selectedFriends.length === friendsList.length ? "Deselect All" : "Select All"}
          </button>
        </div>

        <ul className="friend-invite-list">
          {isLoadingFriends ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <li key={idx} className="skeleton-loader">
                <div className="skeleton-info">
                  <div className="skeleton-avatar"></div>
                  <div className="skeleton-text"></div>
                </div>
                <div className="skeleton-checkbox"></div>
              </li>
            ))
          ) : friendsList.length > 0 ? (
            friendsList.map((friend) => (
              <li key={friend.id} className="invite-friend-item">
                <div className="invite-friend-info">
                  <img
                    src={friend.photoURL || defaultPhoto}
                    alt={friend.name}
                    className="invite-friend-photo"
                    onError={(e) => e.target.src = defaultPhoto}
                  />
                  <span>{friend.name}</span>
                </div>
                <input
                  type="checkbox"
                  checked={selectedFriends.includes(friend.id)}
                  onChange={() => handleSelectFriend(friend.id)}
                  className="invite-checkbox"
                />
              </li>
            ))
          ) : (
             <li style={{padding:'20px', textAlign:'center', color:'#94a3b8'}}>No friends found.</li>
          )}
        </ul>

        {/* Main Action Button */}
        <button onClick={handleSendInvites} className="invite-send-btn">
          Send Invites ({selectedFriends.length})
        </button>

       
      </div>
    </div>
  );
};

export default InviteFriendsModal;