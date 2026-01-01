import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; // Removed 'auth' if not directly used here
import { useAuth } from "../../AuthContext";
import "./DashboardRoom.css";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  orderBy,
} from "firebase/firestore";

// Components
import DashboardGuide from "./components/DashboardGuide";
import DashboardRoomsGrid from "./components/DashboardRoomsGrid";

export default function DashboardRoom() {
  const { user } = useAuth();
  const [userRooms, setUserRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leetcodeUsername, setLeetcodeUsername] = useState("");

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

  // --- Fetch Data ---
  useEffect(() => {
    const fetchUserRooms = async () => {
      if (!user) return;
      try {
        // 1. Get User Data for LeetCode Username
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setLeetcodeUsername(userDocSnap.data().leetcodeUsername || "");
        }

        // 2. Get Rooms
        const q = query(
          collection(db, "rooms"),
          where("members", "array-contains", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const rooms = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toLocaleDateString("en-GB"),
        }));
        setUserRooms(rooms);
        setTimeout(() => setLoading(false), 50);
      } catch (error) {
        console.error("Error fetching user rooms:", error);
        setLoading(false);
      }
    };
    fetchUserRooms();
  }, [user]);

  // --- Actions ---
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "rooms", roomId));
      setUserRooms((prev) => prev.filter((room) => room.id !== roomId));
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("Failed to delete room.");
    }
  };

  const handleCopyLink = (inviteCode) => {
    const link = `${window.location.origin}/join/ir/${inviteCode}`;
    navigator.clipboard
      .writeText(link)
      .then(() => alert("Copied to clipboard!"))
      .catch((err) => console.error("Failed to copy:", err));
  };

  return (
    <div className="dashboard-scroll-container">
      {loading ? (
        <div className="loading-container">
          {/* 2️⃣ USE THE SPINNER COMPONENT HERE */}
          <Spinner />
        </div>
      ) : (
        <>
          {/* 1. Guide Component */}
          <DashboardGuide user={user} />

          {/* 2. Rooms Grid Component */}
          <DashboardRoomsGrid
            user={user}
            rooms={userRooms}
            leetcodeUsername={leetcodeUsername}
            onDelete={handleDeleteRoom}
            onCopy={handleCopyLink}
          />
        </>
      )}
    </div>
  );
}
