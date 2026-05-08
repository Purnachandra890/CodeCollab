import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; // Removed 'auth' if not directly used here
import { useAuth } from "../../AuthContext";
import { useRooms } from "../../RoomsContext";
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
import ConfirmModal from "../ui/ConfirmModal";
import ToastNotification from "../ui/ToastNotification";

export default function DashboardRoom() {
  const { user } = useAuth();
  const { userRooms, loadingRooms } = useRooms();
  const [loadingLeetcode, setLoadingLeetcode] = useState(true);
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  
  // UI States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const loading = loadingRooms || loadingLeetcode;

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
    const fetchUserData = async () => {
      if (!user) return;
      try {
        // 1. Get User Data for LeetCode Username
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setLeetcodeUsername(userDocSnap.data().leetcodeUsername || "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoadingLeetcode(false);
      }
    };
    fetchUserData();
  }, [user]);

  // --- Actions ---
  const handleDeleteClick = (roomId) => {
    setRoomToDelete(roomId);
    setDeleteModalOpen(true);
  };

  const confirmDeleteRoom = async () => {
    if (!roomToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "rooms", roomToDelete));
      setDeleteModalOpen(false);
      setRoomToDelete(null);
    } catch (error) {
      console.error("Error deleting room:", error);
      setToastMessage("Failed to delete room.");
      setToastVisible(true);
      setDeleteModalOpen(false);
      setRoomToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyLink = (inviteCode) => {
    const link = `${window.location.origin}/join/ir/${inviteCode}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setToastMessage("Link copied!");
        setToastVisible(true);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        setToastMessage("Failed to copy link.");
        setToastVisible(true);
      });
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
            onDelete={handleDeleteClick}
            onCopy={handleCopyLink}
          />

          {/* 3. Modals and Toasts */}
          <ConfirmModal 
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setRoomToDelete(null);
            }}
            onConfirm={confirmDeleteRoom}
            title="Delete Room"
            message="Are you sure you want to delete this room? This action cannot be undone."
            isLoading={isDeleting}
          />
          
          <ToastNotification 
            message={toastMessage}
            isVisible={toastVisible}
            onClose={() => setToastVisible(false)}
          />
        </>
      )}
    </div>
  );
}
