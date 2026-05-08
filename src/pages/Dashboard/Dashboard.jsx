import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { signOut } from "firebase/auth";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { useRooms } from "../../RoomsContext";
import "./Dashboard.css";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { onSnapshot } from "firebase/firestore";
import { useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar/Sidebar";
import MobileHeader from "./components/Sidebar/SidebarHeaders/MobileHeader";
import CreateRoomModal from "./components/Sidebar/CreateRoomModal/CreateRoomModal";

// Icon components for better readability

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userRooms, setUserRooms } = useRooms();
  const [roomName, setRoomName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [hasNewInvites, setHasNewInvites] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const [leetcodeUsername, setLeetcodeUsername] = useState(null); //for storing leetcode username
  const [gfgUsername, setGfgUsername] = useState(""); //for storing gfg username

  const location = useLocation();
  // Extract roomId from URL like: /dashboard/room/abc123
  const currentRoomId = location.pathname.split("/dashboard/room/")[1];

  const isLeetcodeMissing = !leetcodeUsername || leetcodeUsername.trim() === "";
  const isGfgMissing = !gfgUsername || gfgUsername.trim() === "";

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const openCreateRoomModal = () => {
    setIsModalOpen(true);

    // Optional UX improvement
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div
      className={`dashboard-container ${
        isMobile
          ? isSidebarOpen
            ? "mobile-sidebar-is-open"
            : ""
          : isSidebarOpen
          ? ""
          : "sidebar-closed"
      }`}
    >
      <MobileHeader
        isMobile={isMobile}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        userRooms={userRooms}
        currentRoomId={currentRoomId}
        handleNavigate={handleNavigate}
        hasNewInvites={hasNewInvites}
        isLeetcodeMissing={isLeetcodeMissing}
        isGfgMissing={isGfgMissing}
        onCreateRoom={openCreateRoomModal}
      />

      <div className="main-content">
        <Outlet />
      </div>

      <CreateRoomModal
        isOpen={isModalOpen}
        roomName={roomName}
        setRoomName={setRoomName}
        isCreatingRoom={isCreatingRoom}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateRoom}
      />
    </div>
  );
};

export default Dashboard;
