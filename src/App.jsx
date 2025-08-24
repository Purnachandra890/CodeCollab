import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./Login";
import Dashboard from "./Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import JoinRoomByInvite from "./JoinRoomByInvite";
import RoomPage from "./RoomPage";
import ProblemList from "./ProblemList";
import LeaderBoard from "./LeaderBoard";
import ChatMessage from "./ChatMessage";
import DashboardRoom from "./DashboardRoom";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
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
      </Routes>
    </BrowserRouter>
  );
}
export default App;
