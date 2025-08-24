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
} from "firebase/firestore";
import "./RoomPage.css";
import Leaderboard from "./LeaderBoard";

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
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2z"></path>
  </svg>
);

// --- Add/Edit Problem Modal ---
const ProblemModal = ({ isOpen, onClose, onSave, problem }) => {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");

  useEffect(() => {
    if (problem) {
      setTitle(problem.title);
      setLink(problem.link);
    } else {
      setTitle("");
      setLink("");
    }
  }, [problem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, link });
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
            <label htmlFor="title">Problem Title</label>
            <input
              id="title"
              type="text"
              placeholder="e.g., Reverse Integer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="link">Problem Link</label>
            <input
              id="link"
              type="url"
              placeholder="https://leetcode.com/problems/..."
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
          : { id: uid, name: "Unknown User", photoURL: "" };
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
  }, [roomId]);

  const handleSaveProblem = async (problemData) => {
    try {
      if (editingProblem) {
        await updateDoc(
          doc(db, "rooms", roomId, "problems", editingProblem.id),
          problemData
        );
      } else {
        await addDoc(collection(db, "rooms", roomId, "problems"), {
          ...problemData,
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
        );
      case "Leaderboard":
        // --- FIX ---
        // The Leaderboard component is now wrapped in a generic 'card' div.
        // This ensures it has the same border and background as the other tabs.
        return (
          <div className="card">
            <Leaderboard />
          </div>
        );
      case "Members":
        return (
          <div className="members-container card">
            <div className="member-grid">
              {members.map((m) => (
                <div key={m.id} className="member-card">
                  <img src={m.photoURL} 
                  alt={m.name} 
                  onError={(e) => { e.target.onerror = null; e.target.src = defaultPhoto; }}
                  />
                  <div className="member-info">
                    <span className="member-name">{m.name}</span>
                    <span className="member-id">
                      {m.id.substring(0, 6).toUpperCase()}
                    </span>
                  </div>
                  {m.id === room?.adminId && (
                    <span className="owner-badge">OWNER</span>
                  )}
                </div>
              ))}
            </div>
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

  return (
    <div className="room-detail-view">
      <ProblemModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveProblem}
        problem={editingProblem}
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
      </nav>
      <div className="tab-content">{renderContent()}</div>
    </div>
  );
};

export default RoomPage;
