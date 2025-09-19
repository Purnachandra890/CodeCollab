// Dashboard.jsx
import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./Dashboard.css";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

// Icon components for better readability
const LogoIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z" />
  </svg>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userRooms, setUserRooms] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- MODIFIED: State is now responsive ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const isMobile = window.innerWidth <= 768;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // --- NEW: Effect to handle initial mobile state ---
  useEffect(() => {
    // On initial load, if it's mobile, ensure the sidebar is closed.
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]); // Re-run only if the mobile state changes (e.g. on resize, though not explicitly handled here for simplicity)

  // Fetch rooms on component mount or when user changes
  useEffect(() => {
    const fetchUserRooms = async () => {
      if (!user) return;
      try {
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
      } catch (error) {
        console.error("Error fetching user rooms:", error);
      }
    };

    fetchUserRooms();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim() || !user) {
      alert("Please enter a room name.");
      return;
    }
    const inviteCode = uuidv4().slice(0, 8);
    try {
      const docRef = await addDoc(collection(db, "rooms"), {
        name: roomName,
        adminId: user.uid,
        inviteCode: inviteCode,
        members: [user.uid],
        createdAt: serverTimestamp(),
      });
      const newRoom = {
        id: docRef.id,
        name: roomName,
        inviteCode,
        adminId: user.uid,
        createdAt: new Date().toLocaleDateString(),
      };
      setUserRooms((prev) => [...prev, newRoom]);
      setRoomName("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room.");
    }
  };

  return (
    <div
      className={`dashboard-container ${
        isMobile && isSidebarOpen ? "mobile-sidebar-is-open" : ""
      }`}
    >
      {/* --- NEW: Separate hamburger button ONLY for mobile view --- */}
      <button className="mobile-hamburger-btn" onClick={toggleSidebar}>
        ☰
      </button>

      {/* --- NEW: Overlay for mobile view when sidebar is open --- */}
      {isMobile && isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar (Original structure) */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <LogoIcon />
          {isSidebarOpen && (
            <h1 onClick={() => navigate("/dashboard/rooms")}>Dashboard</h1>
          )}
          {/* This is the original hamburger for desktop view */}
          <button className="hamburger-btn" onClick={toggleSidebar}>
            ☰
          </button>
        </div>

        {isSidebarOpen && (
          <>
            <button
              className="create-room-btn"
              onClick={() => setIsModalOpen(true)}
            >
              + Create New Room
            </button>
            <nav className="your-rooms-section">
              <h2>YOUR ROOMS</h2>
              <ul className="room-list">
                {userRooms.map((room) => (
                  <li
                    key={room.id}
                    onClick={() => navigate(`/dashboard/room/${room.id}`)}
                  >
                    {room.name}
                  </li>
                ))}
              </ul>
            </nav>
            <div className="sidebar-footer">
              <button
                className="logout-btn"
                onClick={() => navigate("/editProfile")}
              >
                Edit Profile
              </button>
              <br />
              <br />
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        )}
      </aside>

      <Outlet />

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close-btn"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>
            <h2>Create a New Room</h2>
            <form onSubmit={handleCreateRoom}>
              <p>Enter a name for your new room to get started.</p>
              <input
                type="text"
                placeholder="e.g., Q4 Marketing Sync"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
              />
              <button type="submit" className="modal-submit-btn">
                Create Room
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
