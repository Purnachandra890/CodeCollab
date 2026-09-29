import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import { usePlatformRefresh } from "../PlatformRefresh/usePlatformRefresh";

const RoomPage = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const defaultPhoto =
    "https://static.vecteezy.com/system/resources/previews/000/550/731/original/user-icon-vector.jpg";

  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "Problems"
  );
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [highlightedProblemIds, setHighlightedProblemIds] = useState(new Set());

  const handleSyncResult = React.useCallback(
    ({ platform, newlySolved = [], newlyDetected = [], totalChecked = 0 }) => {
      const platformName = platform === "leetcode" ? "LeetCode" : "GeeksforGeeks";

      if (newlySolved.length > 0) {
        const ids = new Set(newlySolved.map((p) => p.id));
        setHighlightedProblemIds(ids);

        // Auto-expand sections containing the updated problems
        const subtopicsToExpand = newlySolved.map(
          (p) => (p.subtopic || "").trim() || "Other"
        );
        setExpandedSections((prev) => new Set([...prev, ...subtopicsToExpand]));

        const problemTitles = newlySolved
          .map((p) => `"${p.title}"`)
          .slice(0, 3)
          .join(", ") + (newlySolved.length > 3 ? ` and ${newlySolved.length - 3} more` : "");

        setToastType("success");
        setToastMessage(
          `🎉 ${newlySolved.length} problem${newlySolved.length > 1 ? "s" : ""} updated to Solved: ${problemTitles}`
        );
        setToastVisible(true);

        // Smoothly scroll to the first newly solved problem
        setTimeout(() => {
          const firstId = newlySolved[0]?.id;
          if (firstId) {
            document
              .getElementById(`problem-row-${firstId}`)
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 200);

        // Fade out highlight after 5 seconds
        setTimeout(() => {
          setHighlightedProblemIds(new Set());
        }, 5000);
      } else if (newlyDetected.length > 0) {
        const ids = new Set(newlyDetected.map((p) => p.id));
        setHighlightedProblemIds(ids);

        const subtopicsToExpand = newlyDetected.map(
          (p) => (p.subtopic || "").trim() || "Other"
        );
        setExpandedSections((prev) => new Set([...prev, ...subtopicsToExpand]));

        const problemTitles = newlyDetected
          .map((p) => `"${p.title}"`)
          .slice(0, 3)
          .join(", ") + (newlyDetected.length > 3 ? ` and ${newlyDetected.length - 3} more` : "");

        setToastType("warning");
        setToastMessage(
          `💡 Found ${newlyDetected.length} completed on GFG: ${problemTitles}. Click "Completed" in table to mark as Solved.`
        );
        setToastVisible(true);

        setTimeout(() => {
          const firstId = newlyDetected[0]?.id;
          if (firstId) {
            document
              .getElementById(`problem-row-${firstId}`)
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 200);

        setTimeout(() => {
          setHighlightedProblemIds(new Set());
        }, 6000);
      } else {
        setToastType("success");
        setToastMessage(
          `Synced with ${platformName}. No new completed problems found in this room.`
        );
        setToastVisible(true);
      }
    },
    []
  );

  const platformRefresh = usePlatformRefresh(user, roomId, handleSyncResult);
  const { gfgSolvedSlugs } = platformRefresh;

  const handleProblemSolved = React.useCallback((problem) => {
    if (problem?.id) {
      setHighlightedProblemIds(new Set([problem.id]));
      setToastType("success");
      setToastMessage(`✓ Marked "${problem.title}" as Solved!`);
      setToastVisible(true);
      setTimeout(() => {
        setHighlightedProblemIds(new Set());
      }, 4000);
    }
  }, []);

  /* 🔹 Data Hooks */
  const {
    room,
    members,
    loading: loadingRoom,
    error: roomError,
  } = useRoomDetails(roomId, defaultPhoto, user?.uid);

  useEffect(() => {
    if (roomError) {
      navigate("/dashboard/rooms", {
        replace: true,
        state: {
          toastMessage: roomError,
          toastType: "error",
          duration: null,
        },
      });
    }
  }, [roomError, navigate]);

  const { problems, loadingProblems } = useProblems(room ? roomId : null);
  const { friends, sentRequests, pendingRequestCount } = useFriends(user);
  const unreadCount = useUnreadMessages(room ? roomId : null, user?.uid);

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
  const { availableSubtopics, defaultSubtopic } = React.useMemo(() => {
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
  }, [problems, editingProblem]);

  /* --- User Solved Count --- */
  const userSolvedCount = React.useMemo(() => {
    if (!user?.uid || !problems || problems.length === 0) return 0;
    return problems.filter((p) => !!p.completedBy?.[user.uid]).length;
  }, [problems, user?.uid]);

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
            roomAdminId={room?.adminId}
            roomId={roomId}
            gfgSolvedSlugs={gfgSolvedSlugs}
            highlightedProblemIds={highlightedProblemIds}
            onProblemSolved={handleProblemSolved}
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

  if (loadingRoom || (!room && !roomError)) {
    return (
      <div className="modern-loading-container">
        <div className="modern-spinner"></div>
        <h3>Loading Workspace...</h3>
        <p>Fetching room details</p>
      </div>
    );
  }

  if (roomError || !room) {
    return null;
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
        onOpenLeaderboard={() => setActiveTab("Leaderboard")}
        platformRefresh={platformRefresh}
      />

      {/* ✅ Tabs */}
      <RoomTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        problemsCount={loadingProblems ? "..." : problems.length}
        membersCount={room?.members?.length || 0}
        pendingRequestCount={pendingRequestCount}
        solvedCount={userSolvedCount}
        totalProblems={problems.length}
      />

      {/* ✅ Tab Content */}
      <div className="tab-content">{renderContent()}</div>

      {/* ✅ Toast Notification */}
      <ToastNotification 
        message={toastMessage}
        isVisible={toastVisible}
        type={toastType}
        duration={4500}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
};

export default RoomPage;
