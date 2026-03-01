import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../AuthContext";

import "./RoomPage.css";

import Leaderboard from "./LeaderBoard/LeaderBoard";
import RequestsTab from "./RequestsTab/RequestsTab";
import FriendsTab from "./FriendsTab/FriendsTab";
import InviteFriendsModal from "./InviteFriendsModal/InviteFriendsModal";

import ProblemModal from "./components/ProblemModal";
import ProblemsTab from "./components/ProblemsTab";
import MembersTab from "./components/MembersTab";
import RoomHeader from "./RoomHeader/RoomHeader";
import RoomTabs from "./RoomTabs/RoomTabs";

/* 🔹 Custom Hooks */
import { useRoomDetails } from "./hooks/useRoomDetails";
import { useProblems } from "./hooks/useProblems";
import { useFriends } from "./hooks/useFriends";
import { useUnreadMessages } from "./hooks/useUnreadMessages";
import { useRoomProblems } from "./hooks/useRoomProblems";
import { useRoomActions } from "./hooks/useRoomActions";
import { useRoomModals } from "./hooks/useRoomModals";

const RoomPage = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const defaultPhoto =
    "https://static.vecteezy.com/system/resources/previews/000/550/731/original/user-icon-vector.jpg";

  const [activeTab, setActiveTab] = useState("Problems");

  /* 🔹 Data Hooks */
  const { room, members } = useRoomDetails(roomId, defaultPhoto);
  const problems = useProblems(roomId);
  const { friends, sentRequests, pendingRequestCount } = useFriends(user);
  const unreadCount = useUnreadMessages(roomId, user?.uid);

  /* 🔹 Logic Hooks */
  const { saveProblem, deleteProblem, isSaving } = useRoomProblems(
    roomId,
    user
  );

  const { sendFriendRequest } = useRoomActions(user);

  const {
    problemModalOpen,
    editingProblem,
    inviteModalOpen,
    openProblemModal,
    closeProblemModal,
    setInviteModalOpen,
  } = useRoomModals();

  /* --- Subtopics from problems (most recent first) --- */
  const { availableSubtopics, defaultSubtopic } = (() => {
    const seen = new Set();
    const ordered = [];
    for (let i = problems.length - 1; i >= 0; i--) {
      const s = (problems[i].subtopic || "").trim();
      if (s && !seen.has(s)) {
        seen.add(s);
        ordered.push(s);
      }
    }
    if (editingProblem?.subtopic) {
      const s = (editingProblem.subtopic || "").trim();
      if (s && !seen.has(s)) ordered.push(s);
    }
    const mostRecent =
      problems.length > 0
        ? (problems[problems.length - 1].subtopic || "").trim()
        : "";
    return {
      availableSubtopics: ordered,
      defaultSubtopic: mostRecent || ordered[0] || "",
    };
  })();

  /* --- Tab Content Renderer --- */
  const renderContent = () => {
    switch (activeTab) {
      case "Problems":
        return (
          <ProblemsTab
            problems={problems}
            onAddProblem={() => openProblemModal()}
            onEditProblem={(problem) => openProblemModal(problem)}
            onDeleteProblem={deleteProblem}
            currentUserId={user?.uid}
            roomAdminId={room.adminId}
          />
        );

      case "Leaderboard":
        return (
          <div className="card">
            <Leaderboard />
          </div>
        );

      case "Members":
        return (
          <MembersTab
            members={members}
            room={room}
            user={user}
            friends={friends}
            sentRequests={sentRequests}
            onAddFriend={sendFriendRequest}
            defaultPhoto={defaultPhoto}
          />
        );

      case "Requests":
        return <RequestsTab user={user} />;

      case "Friends":
        return <FriendsTab user={user} />;

      default:
        return null;
    }
  };

  if (!room) {
    return (
      <div className="welcome-placeholder">
        <h3>Loading Room...</h3>
      </div>
    );
  }

  return (
    <div className="room-detail-view">
      {/* ✅ Problem Modal */}
      <ProblemModal
        isOpen={problemModalOpen}
        onClose={closeProblemModal}
        onSave={(data) => saveProblem(data, editingProblem)}
        problem={editingProblem}
        isSaving={isSaving}
        availableSubtopics={availableSubtopics}
        defaultSubtopic={defaultSubtopic}
      />

      {/* ✅ Invite Friends Modal */}
      <InviteFriendsModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        user={user}
        roomId={roomId}
      />

      {/* ✅ Room Header */}
      <RoomHeader
        room={room}
        roomId={roomId}
        unreadCount={unreadCount}
        setIsInviteModalOpen={setInviteModalOpen}
      />

      {/* ✅ Tabs */}
      <RoomTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        problemsCount={problems.length}
        membersCount={members.length}
        pendingRequestCount={pendingRequestCount}
      />

      {/* ✅ Tab Content */}
      <div className="tab-content">{renderContent()}</div>
    </div>
  );
};

export default RoomPage;
