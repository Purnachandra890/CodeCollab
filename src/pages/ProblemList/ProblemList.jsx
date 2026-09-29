// src/ProblemList.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "../../AuthContext";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./ProblemList.css";
import { getProblemSlug } from "../../utils/problemSlug";
import { usePlatformRefresh } from "../../components/PlatformRefresh/usePlatformRefresh";
import PlatformRefreshActions from "../../components/PlatformRefresh/PlatformRefreshActions";

const BackArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const RightArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export default function ProblemList() {
  const { user } = useAuth();
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [roomName, setRoomName] = useState("");

  const platformRefresh = usePlatformRefresh(user, roomId);
  const { gfgSolvedSlugs } = platformRefresh;
  const gfgSolvedSet = React.useMemo(() => new Set(gfgSolvedSlugs), [gfgSolvedSlugs]);

  useEffect(() => {
    if (!roomId || !user?.uid) return;

    let unsub = () => {};

    const checkAccessAndLoad = async () => {
      try {
        const docSnap = await getDoc(doc(db, "rooms", roomId));
        if (!docSnap.exists()) {
          navigate("/dashboard/rooms", {
            replace: true,
            state: {
              toastMessage: "Room not found.",
              toastType: "error",
              duration: null,
            },
          });
          return;
        }

        const data = docSnap.data();
        if (!data.members?.includes(user.uid)) {
          navigate("/dashboard/rooms", {
            replace: true,
            state: {
              toastMessage: "You are not a member of this room. Please ask the host for an invite link.",
              toastType: "error",
              duration: null,
            },
          });
          return;
        }

        setRoomName(data.name || "");

        const qProblems = query(collection(db, "rooms", roomId, "problems"), orderBy("createdAt", "asc"));
        unsub = onSnapshot(qProblems, (snapshot) => {
          setProblems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoadingProblems(false);
        });
      } catch (err) {
        console.error("Error loading problem list:", err);
        setLoadingProblems(false);
      }
    };

    checkAccessAndLoad();

    return () => unsub();
  }, [roomId, user?.uid, navigate]);

  const completedCount = problems.filter((p) => !!p?.completedBy?.[user?.uid]).length;
  const totalCount = problems.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="personal-list-container">
      <header className="personal-list-header">
        <Link to={`/dashboard/room/${roomId}`} className="back-to-room-link">
          <BackArrowIcon /> Back to {roomName}
        </Link>

        <div className="gfg">
          <h1>My Personal Problem List</h1>
          <PlatformRefreshActions showUsernameHints {...platformRefresh} />
        </div>
      </header>

      {/* PROGRESS CARD */}
      <div className="progress-card">
        <div className="progress-header">
          <span className="progress-title">Your Progress</span>
          <span className="progress-count">
            {completedCount}/{totalCount} Completed
          </span>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* PROBLEM LIST */}
      <div className="problem-list-items">
        {loadingProblems ? (
          [...Array(5)].map((_, i) => (
            <div key={`skeleton-${i}`} className="problem-item-card skeleton-card">
              <div className="problem-item-info">
                <div className="skeleton-title"></div>
                <div className="skeleton-link"></div>
              </div>
              <div className="problem-item-action">
                <div className="skeleton-label"></div>
              </div>
            </div>
          ))
        ) : problems.length === 0 ? (
          <div className="no-problems-message" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
            No problems have been added to this list yet.
          </div>
        ) : problems.map((problem) => {
          const slug = getProblemSlug(problem);
          const isCompleted = !!problem?.completedBy?.[user?.uid];
          const detectedInGfg = slug && gfgSolvedSet.has(slug);

          return (
            <div
              key={problem.id}
              className={`problem-item-card ${isCompleted ? "completed" : "todo"}`}
            >
              <div className="problem-item-info">
                <h3>{problem.title}</h3>
                <a
                  href={problem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-problem-link"
                >
                  View Problem <RightArrowIcon />
                </a>
              </div>

              <div className="problem-item-action">
                {isCompleted ? (
                  <span className="completed-label">
                    <CheckIcon /> Completed
                  </span>
                ) : detectedInGfg ? (
                  <div className="confirm-wrapper">
                    <button
                      className="confirm-btn"
                      onClick={async () => {
                        await updateDoc(doc(db, "rooms", roomId, "problems", problem.id), {
                          [`completedBy.${user.uid}`]: true,
                        });
                      }}
                    >
                      <CheckIcon /> Confirm Completion
                    </button>
                    <div className="detected-text">Detected via GFG</div>
                  </div>
                ) : (
                  <span className="todo-label">To Do</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
