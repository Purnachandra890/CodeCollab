import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./DashboardRoom.css";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getDoc, 
} from "firebase/firestore";
import RoomInvitesCard from "./RoomInvitesCard"; 

export default function DashboardRoom() {
  const { user } = useAuth(); //  Get current user
  const [userRooms, setUserRooms] = useState([]); //  Store rooms
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); //  loading state
  const [leetcodeUsername, setLeetcodeUsername] = useState("");

  const shortUserId = user?.uid?.slice(0, 6); //  Shortened ID
  const defaultPhoto =
    "https://static.vecteezy.com/system/resources/previews/000/550/731/original/user-icon-vector.jpg"; //  Path to placeholder image

  const DeleteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path
        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
        transform="scale(0.66) translate(-4, -4)"
      />
    </svg>
  );

  const CopyIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );

  // ✅ Fetch rooms when component mounts or when user changes
  useEffect(() => {
    const fetchUserRooms = async () => {
      if (!user) return;
      try {
        // Fetch user's LeetCode username
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setLeetcodeUsername(userData.leetcodeUsername || "");
        }
        const q = query(
          collection(db, "rooms"),
          where("members", "array-contains", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const rooms = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toLocaleDateString(),
        }));
        setUserRooms(rooms);
        //  Delay hiding the loading message for 0.5s
        setTimeout(() => {
          setLoading(false);
        }, 50);
      } catch (error) {
        console.error("Error fetching user rooms:", error);
      }
    };

    fetchUserRooms();
  }, [user]);

  const handleDeleteRoom = async (roomId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this room? This action cannot be undone."
      )
    )
      return;

    try {
      await deleteDoc(doc(db, "rooms", roomId));
      setUserRooms((prev) => prev.filter((room) => room.id !== roomId));
      alert("Room deleted successfully.");
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("Failed to delete room.");
    }
  };

  const handleCopyLink = (inviteCode) => {
    const link = `${window.location.origin}/join/ir/${inviteCode}`; // Adjusted to match the displayed link format
    navigator.clipboard
      .writeText(link)
      .then(() => alert("Invite link copied to clipboard!"))
      .catch((err) => console.error("Failed to copy text: ", err));
  };

  return (
    <div>
      {loading ? (
        <div className="loading-container">
          <h2 className="loading">Loading Your Rooms...</h2>
        </div>
      ) : (
        <>
          <div className="dashboard">
            <header className="main-header">
              <div className="welcome-message">
                <h2>Welcome Back!</h2>
                <p>Here's a look at your active rooms.</p>
              </div>
              <div className="user-profile">
                <img
                  src={user?.photoURL || defaultPhoto}
                  alt="User"
                  onError={(e) => (e.target.src = defaultPhoto)}
                />
                <div className="user-info">
                  <span>User ID</span>
                  <strong>{shortUserId || "N/A"}</strong>
                </div>
              </div>
            </header>
            <main className="main-content">
              {/* Conditional rendering for the notification */}
              {leetcodeUsername === "" && (
                <div className="notification-message">
                  <p>
                    Please enter your LeetCode username to enable LeetCode-related features and leaderboard tracking.
                  </p>
                </div>
              )}
              <RoomInvitesCard />
              <section className="rooms-grid">
                {userRooms.map((room) => (
                  <div className="room-card" key={room.id}>
                    <div className="card-header">
                      <h3>{room.name}</h3>
                      <p>Created: {room.createdAt}</p>
                    </div>
                    <div className="invite-link-container">
                      <CopyIcon />
                      <span>{`${window.location.origin.replace(
                        /^https?:\/\//,
                        ""
                      )}/join/ir/${room.inviteCode}`}</span>
                    </div>
                    <div className="card-footer">
                      {user?.uid === room.adminId ? (
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteRoom(room.id)}
                        >
                          <DeleteIcon /> Delete
                        </button>
                      ) : (
                        <div></div>
                      )}
                      <button
                        className="copy-link-btn"
                        onClick={() => handleCopyLink(room.inviteCode)}
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                ))}
              </section>
            </main>
          </div>
        </>
      )}
    </div>
  );
}
