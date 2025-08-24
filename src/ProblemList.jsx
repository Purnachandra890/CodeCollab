// ProblemList.jsx

import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, updateDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { useParams, Link } from "react-router-dom";
import "./ProblemList.css";

// --- Icon Components ---
const BackArrowIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
const RightArrowIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>;
const CheckIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>;


export default function ProblemList() {
  const { user } = useAuth();
  const { roomId } = useParams();
  const [problems, setProblems] = useState([]);
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    if (!roomId) return;

    // Get the room name for the "Back" link
    getDoc(doc(db, "rooms", roomId)).then((docSnap) => {
      if (docSnap.exists()) {
        setRoomName(docSnap.data().name);
      }
    });

    // Listen for real-time updates on problems
    const unsub = onSnapshot(collection(db, "rooms", roomId, "problems"), (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProblems(fetched);
    });

    return () => unsub(); // Cleanup listener
  }, [roomId]);

  const markAsCompleted = async (problemId) => {
    if (!user) return;
    const problemRef = doc(db, "rooms", roomId, "problems", problemId);
    await updateDoc(problemRef, {
      [`completedBy.${user.uid}`]: true, // Store as a boolean for simplicity
    });
  };

  // --- Calculate Progress ---
  const completedCount = problems.filter(p => p.completedBy && p.completedBy[user.uid]).length;
  const totalCount = problems.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="personal-list-container">
      <header className="personal-list-header">
        <Link to={`/dashboard/room/${roomId}`} className="back-to-room-link">
          <BackArrowIcon /> Back to {roomName}
        </Link>
        <h1>My Personal Problem List</h1>
      </header>

      <div className="progress-card card">
        <div className="progress-header">
          <span className="progress-title">Your Progress</span>
          <span className="progress-count">{completedCount}/{totalCount} Completed</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="problem-list-items">
        {problems.map((problem) => {
          const isCompleted = problem.completedBy && problem.completedBy[user.uid];
          return (
            <div key={problem.id} className={`problem-item-card card ${isCompleted ? 'completed' : 'todo'}`}>
              <div className="problem-item-info">
                <h3>{problem.title}</h3>
                <a href={problem.link} target="_blank" rel="noopener noreferrer" className="view-problem-link">
                  View Problem <RightArrowIcon />
                </a>
              </div>
              <div className="problem-item-action">
                {isCompleted ? (
                  <button className="completed-btn" disabled>
                    <CheckIcon /> Completed
                  </button>
                ) : (
                  <button className="mark-completed-btn" onClick={() => markAsCompleted(problem.id)}>
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}