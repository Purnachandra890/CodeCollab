// Dashboard.jsx
import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase"; // Combined imports
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
  deleteDoc,
  doc,
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
  const [isModalOpen, setIsModalOpen] = useState(false); // State for create room modal
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // NEW state for sidebar

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const defaultPhoto =
    "https://static.vecteezy.com/system/resources/previews/000/550/731/original/user-icon-vector.jpg";

  // Fetch rooms on component mount or when user changes
  useEffect(() => {
    const fetchUserRooms = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "rooms"),
          where("members", "array-contains", user.uid)
          // Optional: You might want to order by creation time
          // orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const rooms = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toLocaleDateString(), // Format timestamp
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

    const inviteCode = uuidv4().slice(0, 8); // unique invite code

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
      setIsModalOpen(false); // Close modal on success
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room.");
    }
  };

  // Gets the first 6 characters of user's UID for display
  const shortUserId = user?.uid.substring(0, 6).toUpperCase();

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <LogoIcon />
          {isSidebarOpen && (
            <h1 onClick={() => navigate("/dashboard/rooms")}>Dashboard</h1>
          )}
          {/* Hamburger inside sidebar header */}
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

      {/* don't change fix create room */}
      {/* Create Room Modal */}
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
