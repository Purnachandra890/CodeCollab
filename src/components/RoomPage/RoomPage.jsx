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
import ToastNotification from "../ui/ToastNotification";
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
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  /* 🔹 Data Hooks */
  const { room, members } = useRoomDetails(roomId, defaultPhoto);
  const { problems, loadingProblems } = useProblems(roomId);
  const { friends, sentRequests, pendingRequestCount } = useFriends(user);
  const unreadCount = useUnreadMessages(roomId, user?.uid);

  /* 🔹 Logic Hooks */
  const { saveProblem, deleteProblem, renameSubtopic, isSaving } =
    useRoomProblems(roomId, user);

  const { sendFriendRequest } = useRoomActions(user);

  const {
    problemModalOpen,
    editingProblem,
    inviteModalOpen,
    openProblemModal,
    closeProblemModal,
    setInviteModalOpen,
  } = useRoomModals();

  const handleSaveProblem = async (data, editing) => {
    const result = await saveProblem(data, editing);
    if (result && result.success === false) {
      setToastMessage(result.error || "Failed to save problem.");
      setToastVisible(true);
    } else {
      setToastMessage(editing ? "Problem updated!" : "Problem added successfully!");
      setToastVisible(true);
    }
    return result;
  };

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
            loadingProblems={loadingProblems}
            expandedSections={expandedSections}
            setExpandedSections={setExpandedSections}
            onAddProblem={() => openProblemModal()}
            onEditProblem={(problem) => openProblemModal(problem)}
            onDeleteProblem={deleteProblem}
            onRenameSubtopic={renameSubtopic}
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
      <div className="modern-loading-container">
        <div className="modern-spinner"></div>
        <h3>Loading Workspace...</h3>
        <p>Fetching room details</p>
      </div>
    );
  }

  return (
    <div className="room-detail-view">
      {/* ✅ Problem Modal */}
      <ProblemModal
        isOpen={problemModalOpen}
        onClose={closeProblemModal}
        onSave={(data) => handleSaveProblem(data, editingProblem)}
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
        problemsCount={loadingProblems ? "..." : problems.length}
        membersCount={room?.members?.length || 0}
        pendingRequestCount={pendingRequestCount}
      />

      {/* ✅ Tab Content */}
      <div className="tab-content">{renderContent()}</div>

      {/* ✅ Toast Notification */}
      <ToastNotification 
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
};

export default RoomPage;
