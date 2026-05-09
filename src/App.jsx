import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// login page
import LoginPage from "./pages/Login/Login";
// Dadshboard
import Dashboard from "./pages/Dashboard/Dashboard";
// ProtectedRoute
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
// JoinRoomByInvite
import JoinRoomByInvite from "./pages/JoinRoomByInvite/JoinRoomByInvite";
// RoomPage
import RoomPage from "./components/RoomPage/RoomPage";
// ProblemList
import ProblemList from "./pages/ProblemList/ProblemList";
// LeaderBoard
import LeaderBoard from "./components/RoomPage/LeaderBoard/LeaderBoard";
// ChatMessage
import ChatMessage from "./pages/ChatMessage/ChatMessage";
import DashboardRoom from "./components/DashboardRoom/DashboardRoom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";
// EditProfile
import EditProfile from "./pages/EditProfile/EditProfile";
// dsa deck
import DSADeck from "./components/RoomPage/components/DSADeck";
import ToastNotification from "./components/ui/ToastNotification";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showProfileWarning, setShowProfileWarning] = useState(false);
  const [isWarningDismissed, setIsWarningDismissed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const leetcodeMissing = !data.leetcodeUsername || data.leetcodeUsername.trim() === "";
        const gfgMissing = !data.gfgUsername || data.gfgUsername.trim() === "";
        
        if ((leetcodeMissing || gfgMissing) && !isWarningDismissed) {
          setShowProfileWarning(true);
        } else {
          setShowProfileWarning(false);
        }
      }
    });

    return () => unsub();
  }, [user?.uid, isWarningDismissed]);

  if (loading) return null; // or loading spinner
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<LoginPage />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="rooms" replace />} />
          <Route path="rooms" element={<DashboardRoom />} />
          <Route path="room/:roomId" element={<RoomPage />} />
        </Route>

        <Route
          path="/join/ir/:inviteCode"
          element={
            <ProtectedRoute>
              <JoinRoomByInvite />
            </ProtectedRoute>
          }
        />
        <Route
          path="/room/:roomId/dsa-deck"
          element={
            <ProtectedRoute>
              <DSADeck />
            </ProtectedRoute>
          }
        />

        <Route
          path="/room/:roomId/problems"
          element={
            <ProtectedRoute>
              <ProblemList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/room/:roomId/leaderboard"
          element={
            <ProtectedRoute>
              <LeaderBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/room/:roomId/chatMessages"
          element={
            <ProtectedRoute>
              <ChatMessage />
            </ProtectedRoute>
          }
        />
        <Route path="/editProfile" element={<EditProfile />} />
      </Routes>
      <ToastNotification
        message="Please add your LeetCode or GeeksforGeeks username in Edit Profile."
        isVisible={showProfileWarning}
        onClose={() => setIsWarningDismissed(true)}
        duration={null}
        type="warning"
      />
    </BrowserRouter>
  );
}
export default App;
