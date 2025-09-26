// RoomPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { db } from "./firebase";
import {
  collection,
  doc,
  onSnapshot,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import "./RoomPage.css";
import Leaderboard from "./LeaderBoard";
import RequestsTab from "./RequestsTab";
import FriendsTab from "./FriendsTab";
import InviteFriendsModal from "./InviteFriendsModal"; // <-- Import the modal component

// --- Icon Components ---
const EditIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);
const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);
const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"></path>
  </svg>
);
const ChatIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20 2H4C2.9 2 2 2.9 2 4V18L6 14H20C21.1 14 22 13.1 22 12V4C22 2.9 21.1 2 20 2Z" />
  </svg>
);
const InviteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11h-3V8h-2v3H8v2h3v3h2v-3h3v-2zM21 17h-2v2h-2v-2h-2v-2h2v-2h2v2h2v2zM12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
  </svg>
);

// --- Add/Edit Problem Modal ---
const ProblemModal = ({ isOpen, onClose, onSave, problem }) => {
  const [link, setLink] = useState("");

  useEffect(() => {
    if (problem) {
      setLink(problem.link || "");
    } else {
      setLink("");
    }
  }, [problem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ link }); // pass only link; title will be derived
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>
        <h2>{problem ? "Edit Problem" : "Add New Problem"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="link">Problem Link</label>
            <input
              id="link"
              type="url"
              placeholder="https://leetcode.com/problems/palindrome-number/"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="modal-submit-btn">
            {problem ? "Save Changes" : "Add Problem"}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Main RoomPage Component ---
const RoomPage = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [activeTab, setActiveTab] = useState("Problems");
  const [problems, setProblems] = useState([]);
  const [members, setMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [friends, setFriends] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [pendingRequestCount, setPendingRequestCount] = useState(0); 
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false); // <-- Already here
  const navigate = useNavigate();
  const defaultPhoto =
    "https://static.vecteezy.com/system/resources/previews/000/550/731/original/user-icon-vector.jpg";

  useEffect(() => {
    if (!roomId) return;

    // Listener for Room Details and Members
    const unsubRoom = onSnapshot(doc(db, "rooms", roomId), async (roomSnap) => {
      if (!roomSnap.exists()) {
        console.error("Room not found!");
        return;
      }
      const roomData = roomSnap.data();
      setRoom(roomData);

      const memberUIDs = roomData.members || [];
      const memberPromises = memberUIDs.map(async (uid) => {
        const userSnap = await getDoc(doc(db, "users", uid));
        return userSnap.exists()
          ? { id: uid, ...userSnap.data() }
          : { id: uid, name: "Unknown User", photoURL: defaultPhoto };
      });
      setMembers(await Promise.all(memberPromises));
    });

    // Listener for Problems subcollection
    const qProblems = query(
      collection(db, "rooms", roomId, "problems"),
      orderBy("createdAt", "desc")
    );
    const unsubProblems = onSnapshot(qProblems, (snapshot) => {
      setProblems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubRoom();
      unsubProblems();
    };
  }, [roomId, defaultPhoto]);

  useEffect(() => {
    if (!user || !user.uid) return;

    // Listener for Friends
    const unsubFriends = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setFriends(userData.friends || []);
      }
    });

    // Listener for Outgoing Friend Requests
    const qSentRequests = query(
      collection(db, "friend_requests"),
      where("senderId", "==", user.uid),
      where("status", "==", "pending")
    );
    const unsubSentRequests = onSnapshot(qSentRequests, (snapshot) => {
      setSentRequests(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    // Listener for Incoming Friend Requests (for the badge)
    const qIncomingRequests = query(
        collection(db, "friend_requests"),
        where("receiverId", "==", user.uid),
        where("status", "==", "pending")
    );

    const unsubIncomingRequests = onSnapshot(qIncomingRequests, (snapshot) => {
        setPendingRequestCount(snapshot.size);
    });

    return () => {
      unsubFriends();
      unsubSentRequests();
      unsubIncomingRequests();
    };
  }, [user]);

  const handleSaveProblem = async ({ link }) => {
    try {
      const normalized = normalizeLink(link);
      const slug = extractTitleFromLink(normalized); 

      if (!slug) {
        alert("Invalid LeetCode problem link. Please check and try again.");
        return;
      }

      const problemToSave = {
        title: slug, 
        titleSlug: slug, 
        link: normalized,
      };

      if (editingProblem) {
        await updateDoc(
          doc(db, "rooms", roomId, "problems", editingProblem.id),
          problemToSave
        );
      } else {
        await addDoc(collection(db, "rooms", roomId, "problems"), {
          ...problemToSave,
          addedBy: user.displayName,
          addedById: user.uid,
          createdAt: serverTimestamp(),
        });
      }
      closeModal();
    } catch (error) {
      console.error("Error saving problem:", error);
    }
  };

  const handleDeleteProblem = async (problemId) => {
    if (window.confirm("Are you sure you want to delete this problem?")) {
      await deleteDoc(doc(db, "rooms", roomId, "problems", problemId));
    }
  };

  const handleAddFriend = async (receiverId) => {
    try {
      await addDoc(collection(db, "friend_requests"), {
        senderId: user.uid,
        receiverId: receiverId,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      alert("Friend request sent!");
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("Failed to send friend request.");
    }
  };

  const openModal = (problem = null) => {
    setEditingProblem(problem);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setEditingProblem(null);
    setIsModalOpen(false);
  };

  // Renders the content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "Problems":
        return (
          <div className="problems-container card">
            <div className="problems-header">
              <h3>Problems in this Room</h3>
              <button className="primary-btn" onClick={() => openModal()}>
                + Add Problem
              </button>
            </div>
            <div className="table-scroll-container">
              <table className="problems-table">
                <thead>
                  <tr>
                    <th>Problem Title</th>
                    <th>Added By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {p.title}
                        </a>
                      </td>
                      <td>{p.addedBy}</td>
                      <td className="actions-cell">
                        <button
                          className="action-icon-btn"
                          title="Edit"
                          onClick={() => openModal(p)}
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="action-icon-btn"
                          title="Delete"
                          onClick={() => handleDeleteProblem(p.id)}
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "Leaderboard":
        return (
          <div className="card">
            <Leaderboard />
          </div>
        );
      case "Members":
        return (
          <div className="members-container card">
            <div className="member-grid">
              {members.map((m) => {
                const isCurrentUser = m.id === user?.uid;
                const isFriend = friends.includes(m.id);
                const hasSentRequest = sentRequests.some(
                  (req) => req.receiverId === m.id
                );

                return (
                  <div key={m.id} className="member-card">
                    <img
                      src={m.photoURL}
                      alt={m.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultPhoto;
                      }}
                    />
                    <div className="member-info">
                      <span className="member-name">{m.name}</span>
                    </div>
                    {m.id === room?.adminId && (
                      <span className="owner-badge">OWNER</span>
                    )}

                    {!isCurrentUser && !isFriend && !hasSentRequest && (
                      <button
                        className="add-friend-btn"
                        onClick={() => handleAddFriend(m.id)}
                      >
                        +
                      </button>
                    )}
                    {hasSentRequest && (
                      <span className="pending-badge">Pending</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      case "Requests":
        return (
          <div className="card">
            <RequestsTab user={user} />
          </div>
        );
      case "Friends":
        return (
          <div className="card">
            <FriendsTab user={user} />
          </div>
        );
      default:
        return null;
    }
  };

  if (!room)
    return (
      <div className="welcome-placeholder">
        <h3>Loading Room...</h3>
      </div>
    );

  // --- Helpers ---
  const normalizeLink = (link) => {
    if (!link) return "";
    return link.startsWith("http://") || link.startsWith("https://")
      ? link
      : `https://${link}`;
  };

  const extractTitleFromLink = (rawLink) => {
    try {
      const link = normalizeLink(rawLink);
      const url = new URL(link);
      const parts = url.pathname.split("/").filter(Boolean); // e.g. ["problems","palindrome-number","description"]
      const idx = parts.indexOf("problems");
      if (idx !== -1 && parts[idx + 1]) return parts[idx + 1]; // keep hyphens
      // Fallback regex in case of odd paths
      const m = link.match(/problems\/([^/]+)/i);
      return m ? m[1] : "";
    } catch {
      const m = String(rawLink || "").match(/problems\/([^/]+)/i);
      return m ? m[1] : "";
    }
  };

  return (
    <div className="room-detail-view">
      <ProblemModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveProblem}
        problem={editingProblem}
      />
      {/* NEW: Render the InviteFriendsModal */}
      <InviteFriendsModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        user={user}
        roomId={roomId}
      />
      <header className="room-header">
        <h1>{room.name}</h1>
        <p className="room-description">{room.description}</p>
        <div className="room-header-actions">
          <button
            className="secondary-btn"
            onClick={() => navigate(`/room/${roomId}/problems`)}
          >
            <ListIcon /> My Personal List
          </button>
          <button
            className="primary-btn"
            onClick={() => navigate(`/room/${roomId}/chatMessages`)}
          >
            <ChatIcon /> Open Room Chat
          </button>
          <button
            className="secondary-btn"
            onClick={() => setIsInviteModalOpen(true)}
          >
            <InviteIcon /> Invite Friends
          </button>
        </div>
      </header>
      <nav className="room-tabs">
        <button
          onClick={() => setActiveTab("Problems")}
          className={`tab-btn ${activeTab === "Problems" && "active"}`}
        >
          Problems
        </button>
        <button
          onClick={() => setActiveTab("Leaderboard")}
          className={`tab-btn ${activeTab === "Leaderboard" && "active"}`}
        >
          Leaderboard
        </button>
        <button
          onClick={() => setActiveTab("Members")}
          className={`tab-btn ${activeTab === "Members" && "active"}`}
        >
          Members
        </button>
        <button
          onClick={() => setActiveTab("Requests")}
          className={`tab-btn ${activeTab === "Requests" && "active"}`}
        >
          Requests
          {pendingRequestCount > 0 && (
            <span className="notification-badge">{pendingRequestCount}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("Friends")}
          className={`tab-btn ${activeTab === "Friends" && "active"}`}
        >
          Friends
        </button>
      </nav>
      <div className="tab-content">{renderContent()}</div>
    </div>
  );
};

export default RoomPage;