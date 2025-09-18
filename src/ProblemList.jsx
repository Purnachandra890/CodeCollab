// ProblemList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { db } from "./firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { useParams, Link } from "react-router-dom";
import "./ProblemList.css";

// ----- Icons -----
const BackArrowIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const RightArrowIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </svg>
);
const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

// ----- Helpers (defined BEFORE use) -----
const slugFromLink = (link) => {
  if (!link || typeof link !== "string") return "";
  try {
    // Works for: https://leetcode.com/problems/{slug}/... (any suffix)
    const m = link.match(/\/problems\/([^\/?#]+)/i);
    if (m && m[1]) return m[1].toLowerCase();
    // Fallback: last non-empty segment (still handle trailing "/")
    const parts = link.split("/").filter(Boolean);
    const last = (parts[parts.length - 1] || "").toLowerCase();
    // If last is a generic page like "description", take the previous one
    if (
      [
        "description",
        "solution",
        "solutions",
        "submissions",
        "discussion",
      ].includes(last)
    ) {
      const prev = (parts[parts.length - 2] || "").toLowerCase();
      return prev;
    }
    return last;
  } catch {
    return "";
  }
};

const slugifyTitle = (title) =>
  (title || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getProblemSlug = (problem) => {
  // Prefer link-derived slug
  const fromLink = slugFromLink(problem?.link);
  if (fromLink) return fromLink;
  // Fallback to slug-looking title or slugify it
  const t = problem?.title || "";
  if (!t) return "";
  const looksSlugAlready = t.includes("-") || t === t.toLowerCase();
  return looksSlugAlready ? t.toLowerCase() : slugifyTitle(t);
};

export default function ProblemList() {
  const { user } = useAuth();
  const { roomId } = useParams();

  const [problems, setProblems] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [solvedSlugs, setSolvedSlugs] = useState([]);
  const [leetcodeUsername, setLeetcodeUsername] = useState(null); // <-- from Firestore


  // Load room name + problems
  useEffect(() => {
    if (!roomId) return;

    getDoc(doc(db, "rooms", roomId)).then((docSnap) => {
      if (docSnap.exists()) setRoomName(docSnap.data().name || "");
    });

    const unsub = onSnapshot(
      collection(db, "rooms", roomId, "problems"),
      (snapshot) => {
        setProblems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    return () => unsub();
  }, [roomId]);

  // Load leetcode username once from users/{uid}
  useEffect(() => {
    if (!user?.uid) return;
    const load = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      setLeetcodeUsername(
        snap.exists() ? snap.data().leetcodeUsername || null : null
      );
    };
    load();
  }, [user?.uid]);

  // Fetch solved slugs when username available
  useEffect(() => {
    if (!leetcodeUsername) return;
    const fetchSolved = async () => {
      try {
        const res = await axios.get(
          `https://leetcode-api-u9ko.onrender.com/${leetcodeUsername}/acSubmission`
        );
        const arr = Array.isArray(res.data?.submission)
          ? res.data.submission
          : [];
        const slugs = Array.from(
          new Set(
            arr.map((s) => (s.titleSlug || "").toLowerCase()).filter(Boolean)
          )
        );
        setSolvedSlugs(slugs);
      } catch (err) {
        console.error("Error fetching solved problems:", err);
        setSolvedSlugs([]);
      }
    };
    fetchSolved();
  }, [leetcodeUsername]);

  // Sync Firestore: mark completedBy.{userId} for problems whose slug is in solvedSlugs
  useEffect(() => {
    const doSync = async () => {
      if (!user || !roomId) return;
      if (!problems.length || !solvedSlugs.length) return;

      const updates = [];
      for (const p of problems) {
        const slug = getProblemSlug(p);
        if (!slug) continue;
        const isSolvedInAPI = solvedSlugs.includes(slug);
        const alreadyMarked = !!p?.completedBy?.[user.uid];

        if (isSolvedInAPI && !alreadyMarked) {
          updates.push(
            updateDoc(doc(db, "rooms", roomId, "problems", p.id), {
              [`completedBy.${user.uid}`]: true,
            })
          );
        }
      }

      if (updates.length) {
        try {
          await Promise.all(updates);
        } catch (e) {
          console.error("Error updating Firestore completedBy:", e);
        }
      }
    };

    doSync();
  }, [problems, solvedSlugs, roomId, user]);

  // UI status
  const completedCount = problems.filter((p) => {
    const slug = getProblemSlug(p);
    return p?.completedBy?.[user?.uid] || (slug && solvedSlugs.includes(slug));
  }).length;

  const totalCount = problems.length;
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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

      <div className="problem-list-items">
        {problems.map((problem) => {
          const slug = getProblemSlug(problem);
          const isCompleted =
            problem?.completedBy?.[user?.uid] ||
            (slug && solvedSlugs.includes(slug));

          return (
            <div
              key={problem.id}
              className={`problem-item-card card ${
                isCompleted ? "completed" : "todo"
              }`}
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
