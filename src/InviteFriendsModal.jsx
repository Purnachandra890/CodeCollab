import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  doc,
  getDoc,
  arrayUnion,
  onSnapshot,
  updateDoc,
  addDoc,
  serverTimestamp,
  where,
  query,
  collection,
} from "firebase/firestore";
import "./RoomPage.css"; // Reuse existing styles
import "./InviteFriendsModal.css"; // We'll create this next

const InviteFriendsModal = ({ isOpen, onClose, user, roomId }) => {
  const [friendsList, setFriendsList] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const defaultPhoto =
    "https://static.vecteezy.com/system/resources/previews/000/550/731/original/user-icon-vector.jpg";

  useEffect(() => {
    if (!isOpen || !user?.uid) return;

    // Fetch the current user's friends list
    const unsub = onSnapshot(doc(db, "users", user.uid), async (userSnap) => {
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const friendUIDs = userData.friends || [];

        // Fetch details for each friend UID
        const friendsDetails = await Promise.all(
          friendUIDs.map(async (friendId) => {
            const friendDoc = await getDoc(doc(db, "users", friendId));
            return friendDoc.exists()
              ? { id: friendId, ...friendDoc.data() }
              : null;
          })
        );
        setFriendsList(friendsDetails.filter(Boolean));
      }
    });

    return () => unsub();
  }, [isOpen, user]);

  const handleSelectFriend = (friendId) => {
    setSelectedFriends((prevSelected) =>
      prevSelected.includes(friendId)
        ? prevSelected.filter((id) => id !== friendId)
        : [...prevSelected, friendId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFriends.length === friendsList.length) {
      setSelectedFriends([]);
    } else {
      setSelectedFriends(friendsList.map((f) => f.id));
    }
  };

  const handleSendInvites = async () => {
    if (selectedFriends.length === 0) {
      alert("Please select at least one friend to invite.");
      return;
    }

    try {
      // Step 1: Fetch the room document to get the list of current members
      const roomSnap = await getDoc(doc(db, "rooms", roomId));
      if (!roomSnap.exists()) {
        alert("Room not found!");
        return;
      }
      const roomData = roomSnap.data();
      const currentMembers = roomData.members || [];
      const roomName = roomData.name || "the room";

      // Step 2: Filter out friends who are already members of the room
      const friendsToSendInviteTo = selectedFriends.filter(
        (friendId) => !currentMembers.includes(friendId)
      );

      // If all selected friends are already members, alert the user and exit
      if (friendsToSendInviteTo.length === 0) {
        alert("selected friends are already members of this room.");
        onClose();
        return;
      }

      // Step 3: Send invitations only to the filtered list
      const invitePromises = friendsToSendInviteTo.map(async (friendId) => {
        await addDoc(collection(db, "room_invites"), {
          senderId: user.uid,
          receiverId: friendId,
          roomId: roomId,
          roomName: roomName,
          status: "pending",
          createdAt: serverTimestamp(),
        });
      });

      await Promise.all(invitePromises);
      alert(`Invitations sent to ${friendsToSendInviteTo.length} friend(s)!`);
      onClose(); // Close the modal on success
    } catch (error) {
      console.error("Error sending invites:", error);
      alert("Failed to send invitations.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>
        <h2>Invite Friends to Room</h2>
        <div className="invite-list-header">
          <span>Select Friends</span>
          <button onClick={handleSelectAll} className="select-all-btn">
            {selectedFriends.length === friendsList.length
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>
        <ul className="friend-invite-list">
    {friendsList.map((friend) => (
        <li key={friend.id} className="invite-friend-item">
            <div className="invite-friend-info">
                <img
                    src={friend.photoURL || defaultPhoto}
                    alt={friend.name}
                    className="invite-friend-photo"
                />
                <span>{friend.name}</span>
            </div>
            {/* The input element is a direct child of the flex container */}
            <div>
              <input
                type="checkbox"
                checked={selectedFriends.includes(friend.id)}
                onChange={() => handleSelectFriend(friend.id)}
                className="invite-checkbox"
            />
            </div>
        </li>
    ))}
</ul>
        <button
          onClick={handleSendInvites}
          className="invite-send-btn primary-btn"
        >
          Send Invites ({selectedFriends.length})
        </button>
      </div>
    </div>
  );
};

export default InviteFriendsModal;
