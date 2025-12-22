import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { signOut } from "firebase/auth";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import "./Dashboard.css";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  doc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { onSnapshot } from "firebase/firestore";
import { useLocation } from "react-router-dom";

import ReportBugButton from "./components/ReportBugButton";
import EditProfileButton from "./components/EditProfileButton";
import LogoutButton from "./components/LogoutButton";

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
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [hasNewInvites, setHasNewInvites] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const isMobile = window.innerWidth <= 768;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const [leetcodeUsername, setLeetcodeUsername] = useState(null); //for storing leetcode username
  const [gfgUsername, setGfgUsername] = useState(""); //for storing gfg username

  const location = useLocation();
  // Extract roomId from URL like: /dashboard/room/abc123
  const currentRoomId = location.pathname.split("/dashboard/room/")[1];

  const isLeetcodeMissing = !leetcodeUsername || leetcodeUsername.trim() === "";
  const isGfgMissing = !gfgUsername || gfgUsername.trim() === "";
  useEffect(() => {
    if (!user?.uid) return;

    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setLeetcodeUsername(data.leetcodeUsername || "");
        setGfgUsername(data.gfgUsername || "");
      } else {
        setLeetcodeUsername("");
        setGfgUsername("");
      }
    });

    return () => unsub();
  }, [user?.uid]);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    const fetchUserRooms = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "rooms"),
          where("members", "array-contains", user.uid),
          orderBy("createdAt", "desc") // Add this line to order by creation date descending
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

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "room_invites"),
      where("receiverId", "==", user.uid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHasNewInvites(snapshot.size > 0);
    });

    return () => unsubscribe();
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

    // Stop if already creating
    if (isCreatingRoom) return;

    try {
      setIsCreatingRoom(true);
      const inviteCode = uuidv4().slice(0, 8);
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
      // setUserRooms((prev) => [...prev, newRoom]);
      setUserRooms((prev) => [newRoom, ...prev]);
      setRoomName("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room.");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleReportBug = () => {
    const recipientEmail = "purnachandra.n17@gmail.com";
    const subject = "Bug Report: Code Collab Application";
    const body = `
Hello Support Team,
I'd like to report a bug.

- **Description of Bug:**
[Please describe the issue here]

- **Steps to Reproduce:**
1.
2.
3.

Thank you.
    `;
    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body.trim())}`;
    window.location.href = mailtoLink;
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div
      className={`dashboard-container ${
        isMobile && isSidebarOpen ? "mobile-sidebar-is-open" : ""
      }`}
    >
      <button className="mobile-hamburger-btn" onClick={toggleSidebar}>
        ☰
      </button>

      {isMobile && isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <LogoIcon />
          {isSidebarOpen && (
            <div className="dashboard-title-container">
              <h1 onClick={() => handleNavigate("/dashboard/rooms")}>
                Dashboard
              </h1>

              {hasNewInvites && (
                <span className="dashboard-invite-badge">Invites</span>
              )}
            </div>
          )}

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
                    onClick={() => handleNavigate(`/dashboard/room/${room.id}`)}
                    className={room.id === currentRoomId ? "active-room" : ""}
                  >
                    {room.name}
                  </li>
                ))}
              </ul>
            </nav>

            <div className="sidebar-footer">
               <EditProfileButton
                isLeetcodeMissing={isLeetcodeMissing}
                isGfgMissing={isGfgMissing}
              />
              <ReportBugButton />
              {/* <LogoutButton onClick={() => setIsLogoutModalOpen(true)} /> */}
            </div>
          </>
        )}
      </aside>

      <Outlet />

      {/* --- MODAL FOR CREATING ROOMS --- */}
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
                placeholder="e.g., Linked List"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
                disabled={isCreatingRoom}
              />
              <button
                type="submit"
                className="modal-submit-btn"
                disabled={isCreatingRoom}
              >
                {isCreatingRoom ? "Creating..." : "Create Room"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- NEW: LOGOUT CONFIRMATION MODAL --- */}
      {isLogoutModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content logout-modal">
            <button
              className="modal-close-btn"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              &times;
            </button>
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to logout</p>
            <div className="modal-actions">
              <button className="primary-btn" onClick={handleLogout}>
                Yes, Log Out
              </button>
              <button
                className="secondary-btn"
                onClick={() => setIsLogoutModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
