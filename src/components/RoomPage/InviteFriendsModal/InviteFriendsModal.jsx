import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import {
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  addDoc,
  serverTimestamp,
  where,
  query,
  collection,
  getDocs,
} from "firebase/firestore";
import "../RoomPage.css";
import "./InviteFriendsModal.css";
import emailjs from "emailjs-com";
import { useAuth } from "../../../AuthContext";

// A simple loading spinner component
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
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [newInviteRecipient, setNewInviteRecipient] = useState("");
  const [emailCheckStatus, setEmailCheckStatus] = useState("idle");
  const defaultPhoto =
    "https://static.vecteezy.com/system/resources/previews/000/550/731/original/user-icon-vector.jpg";

  // Debounce logic to check email/UID in real-time
  useEffect(() => {
    if (!newInviteRecipient || newInviteRecipient.length < 3) {
      setEmailCheckStatus("idle");
      return;
    }

    setEmailCheckStatus("checking");
    const timer = setTimeout(async () => {
      try {
        let userExists = false;
        // Check if the recipient is an email
        if (newInviteRecipient.includes("@")) {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", newInviteRecipient));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            userExists = true;
          }
        } else {
          // Assume recipient is a UID and check the document directly
          const userDoc = await getDoc(doc(db, "users", newInviteRecipient));
          if (userDoc.exists()) {
            userExists = true;
          }
        }

        if (userExists) {
          setEmailCheckStatus("found");
        } else {
          setEmailCheckStatus("not-found");
        }
      } catch (error) {
        console.error("Error checking user:", error);
        setEmailCheckStatus("error");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [newInviteRecipient]);

  useEffect(() => {
    if (!isOpen || !user?.uid) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), async (userSnap) => {
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const friendUIDs = userData.friends || [];
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
      const roomSnap = await getDoc(doc(db, "rooms", roomId));
      if (!roomSnap.exists()) {
        alert("Room not found!");
        return;
      }
      const roomData = roomSnap.data();
      const currentMembers = roomData.members || [];
      const roomName = roomData.name || "the room";
      const friendsToSendInviteTo = selectedFriends.filter(
        (friendId) => !currentMembers.includes(friendId)
      );
      if (friendsToSendInviteTo.length === 0) {
        alert("Selected friends are already members of this room.");
        onClose();
        return;
      }
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
      onClose();
    } catch (error) {
      console.error("Error sending invites:", error);
      alert("Failed to send invitations.");
    }
  };

  const handleSendDirectInvite = async (e) => {
    e.preventDefault();
    const recipient = newInviteRecipient.trim();
    if (emailCheckStatus !== "found") {
      alert("Please enter a valid user email or ID.");
      return;
    }

    let recipientDoc;
    let recipientId;
    try {
      // Find the recipient, checking for email first, then UID
      if (recipient.includes("@")) {
        const q = query(
          collection(db, "users"),
          where("email", "==", recipient)
        );
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          alert("No user found with that email address.");
          return;
        }
        recipientDoc = querySnapshot.docs[0];
        recipientId = recipientDoc.id;
      } else {
        const userDoc = await getDoc(doc(db, "users", recipient));
        if (!userDoc.exists()) {
          alert("No user found with that ID.");
          return;
        }
        recipientDoc = userDoc;
        recipientId = userDoc.id;
      }

      const roomSnap = await getDoc(doc(db, "rooms", roomId));
      const roomData = roomSnap.data();
      const currentMembers = roomData.members || [];
      const roomName = roomData.name || "the room";

      if (currentMembers.includes(recipientId)) {
        alert("This user is already a member of the room.");
        setNewInviteRecipient("");
        return;
      }

      await addDoc(collection(db, "room_invites"), {
        senderId: user.uid,
        receiverId: recipientId,
        roomId: roomId,
        roomName: roomName,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      alert(
        `Invitation sent to ${
          recipientDoc.data().displayName || recipientDoc.data().email
        }!`
      );
      setNewInviteRecipient("");
      onClose();
    } catch (error) {
      console.error("Error sending direct invite:", error);
      alert("Failed to send direct invitation.");
    }
  };

  if (!isOpen) return null;

  const getStatusMessage = () => {
    switch (emailCheckStatus) {
      case "checking":
        return (
          <span className="email-status-checking">
            <Spinner /> Checking...
          </span>
        );
      case "found":
        return <span className="email-status-found">User Found! ✅</span>;
      case "not-found":
        return (
          <span className="email-status-not-found">User Not Found ❌</span>
        );
      default:
        return null;
    }
  };

  const handleSendInvitesEmail = (e) => {
    e.preventDefault();

    // const recipientEmails = [
    //   "purnachandra.n17@gmail.com",
    //   "npurnachandra9948265246@gmail.com",
    // ];

    const recipientEmails = selectedFriends
      .map((friendId) => {
        // Find the friend object in friendsList using the ID
        const friend = friendsList.find((f) => f.id === friendId);
        // Return the email if the friend is found, otherwise return null
        return friend ? friend.email : null;
      })
      .filter((email) => email !== null);

    if (recipientEmails.length === 0) {
      alert("Please select friends with valid emails to send invites.");
      return;
    }

    // console.log(recipientEmails);
    emailjs
      .send(
        "service_ng8k2bc", // Your service ID
        "template_bowryek", // Your template ID
        {
          to_name: "Group",
          from_name: "CodeCollab Team",
          message: "You’ve been invited to join the room CodeCollab123!",
          to_email: recipientEmails.join(", "), // Join the array into a comma-separated string
        },
        "W66kHP4-mU-MLTK7X" // Your public key
      )
      .then((response) => {
        console.log("✅ Email sent!", response.status, response.text);
        alert("Invites sent successfully!");
      })
      .catch((err) => {
        console.error("❌ Failed to send email:", err);
      });
  };
  // console.log(user.uid);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>
        <h2>Invite Friends to Room</h2>
        <form onSubmit={handleSendDirectInvite} className="direct-invite-form">
          <label htmlFor="direct-invite-input">Invite by Email</label>
          <div className="direct-invite-input-group">
            <input
              id="direct-invite-input"
              type="text"
              value={newInviteRecipient}
              onChange={(e) => setNewInviteRecipient(e.target.value)}
              placeholder="Enter email or user ID"
            />
            <button type="submit" className="send-btn primary-btn">
              Send
            </button>
          </div>
          <div className="email-check-status">{getStatusMessage()}</div>
        </form>
        {/* <hr className="invite-separator" /> */}
        <div className="invite-list-header">
          <span>Select from Friends</span>
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
        {/* Conditional rendering for the email invite button */}
        {user?.uid === "8ZD0wcOL4FWXimv4LvMOMaqSXVA3" && (
          <button
            onClick={handleSendInvitesEmail}
            className="invite-send-btn primary-btn"
          >
            Send Invites through Email({selectedFriends.length})
          </button>
        )}
      </div>
    </div>
  );
};

export default InviteFriendsModal;
