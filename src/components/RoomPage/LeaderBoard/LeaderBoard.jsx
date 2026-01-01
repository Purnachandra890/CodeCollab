import React, { useEffect, useState } from "react";
import { db } from "../../../firebase";
import {
  collection,
  doc,
  onSnapshot,
  getDoc,
  getDocs,
  query,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../AuthContext";
import axios from "axios";
import "./LeaderBoard.css";

const defaultPhoto =
  "https://static.vecteezy.com/system/resources/previews/000/550/731/original/user-icon-vector.jpg";

const CrownIcon = ({ color }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="none">
    <path
      d="M2 20H22V22H2V20ZM12 4L15 11H21L17 14L19 21L12 17L5 21L7 14L3 11H9L12 4Z"
      fill={color}
    />
  </svg>
);
const Spinner = () => (
  <svg className="spinner" viewBox="0 0 50 50">
    <circle
      className="path"
      cx="25"
      cy="25"
      r="20"
      fill="none"
      strokeWidth="5"
    ></circle>
  </svg>
);

// ... (Keep helper functions: slugFromLink, slugifyTitle, getProblemSlug) ...
const slugFromLink = (link) => {
  if (!link || typeof link !== "string") return "";
  try {
    const m = link.match(/\/problems\/([^\/?#]+)/i);
    if (m && m[1]) return m[1].toLowerCase();
    const parts = link.split("/").filter(Boolean);
    const last = (parts[parts.length - 1] || "").toLowerCase();
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
  const fromLink = slugFromLink(problem?.link);
  if (fromLink) return fromLink;
  const t = problem?.title || "";
  if (!t) return "";
  return t.includes("-") || t === t.toLowerCase()
    ? t.toLowerCase()
    : slugifyTitle(t);
};

export default function LeaderBoard() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // ✅ 1. Add Loading State

  // ----- useEffect 1: Sync (Unchanged) -----
  useEffect(() => {
    const fetchWithFailover = async (endpoints) => {
      let lastError = null;
      for (const url of endpoints) {
        try {
          return await axios.get(url);
        } catch (error) {
          lastError = error;
        }
      }
      throw new Error("All API servers are unavailable.", { cause: lastError });
    };

    const syncSubmissions = async () => {
      if (!user?.uid || !roomId) return;
      const userDocSnap = await getDoc(doc(db, "users", user.uid));
      if (!userDocSnap.exists()) return;
      const leetcodeUsername = userDocSnap.data().leetcodeUsername;
      if (!leetcodeUsername) return;

      try {
        const endpoints = [
          `https://leetcode-api-u9ko.onrender.com/${leetcodeUsername}/acSubmission`,
          `https://leetcode-api-xesz.onrender.com/${leetcodeUsername}/acSubmission`,
        ];
        const res = await fetchWithFailover(endpoints);
        const submissions = Array.isArray(res.data?.submission)
          ? res.data.submission
          : [];
        const solvedSlugs = new Set(
          submissions
            .map((s) => (s.titleSlug || "").toLowerCase())
            .filter(Boolean)
        );

        if (solvedSlugs.size === 0) return;

        const problemsSnapshot = await getDocs(
          collection(db, "rooms", roomId, "problems")
        );
        const problems = problemsSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        const updates = [];
        for (const p of problems) {
          const slug = getProblemSlug(p);
          if (!slug) continue;
          const isSolvedInAPI = solvedSlugs.has(slug);
          const alreadyMarked = !!p?.completedBy?.[user.uid];

          if (isSolvedInAPI && !alreadyMarked) {
            updates.push(
              updateDoc(doc(db, "rooms", roomId, "problems", p.id), {
                [`completedBy.${user.uid}`]: serverTimestamp(),
              })
            );
          }
        }
        if (updates.length > 0) await Promise.all(updates);
      } catch (err) {
        console.error("Error syncing LeetCode submissions:", err);
      }
    };
    syncSubmissions();
  }, [roomId, user?.uid]);

  // ----- useEffect 2: Fetch Data (Updated) -----
  useEffect(() => {
    if (!roomId) return;
    setIsLoading(true);

    const roomRef = doc(db, "rooms", roomId);
    const problemsRef = collection(db, "rooms", roomId, "problems");

    let memberUIDs = [];

    // 1️⃣ Listen to room members
    const unsubscribeRoom = onSnapshot(roomRef, (roomSnap) => {
      if (!roomSnap.exists()) {
        setLeaderboard([]);
        setIsLoading(false);
        return;
      }
      memberUIDs = roomSnap.data().members || [];
    });

    // 2️⃣ Listen to problems independently
    const unsubscribeProblems = onSnapshot(
      problemsRef,
      async (problemsSnap) => {
        if (memberUIDs.length === 0) {
          setLeaderboard([]);
          setIsLoading(false);
          return;
        }

        const totalProblems = problemsSnap.docs.length;
        const userStats = {};

        memberUIDs.forEach((uid) => {
          userStats[uid] = { completed: 0, lastActivity: null };
        });

        problemsSnap.docs.forEach((docSnap) => {
          const problem = docSnap.data();
          if (!problem.completedBy) return;

          Object.entries(problem.completedBy).forEach(([uid, timestamp]) => {
            if (!userStats[uid]) return;

            userStats[uid].completed += 1;
            const date = timestamp?.toDate?.();
            if (
              !userStats[uid].lastActivity ||
              date > userStats[uid].lastActivity
            ) {
              userStats[uid].lastActivity = date;
            }
          });
        });

        const finalData = await Promise.all(
          Object.entries(userStats).map(async ([uid, stats]) => {
            const userSnap = await getDoc(doc(db, "users", uid));
            const userData = userSnap.exists() ? userSnap.data() : {};

            return {
              uid,
              username: userData.name || "Unknown",
              photoURL: userData.photoURL || defaultPhoto,
              completed: stats.completed,
              lastActivity: stats.lastActivity,
              completionPercentage:
                totalProblems > 0 ? (stats.completed / totalProblems) * 100 : 0,
            };
          })
        );

        finalData.sort((a, b) => {
          if (b.completed !== a.completed) return b.completed - a.completed;
          return a.lastActivity - b.lastActivity;
        });

        setLeaderboard(finalData.map((u, i) => ({ ...u, rank: i + 1 })));
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribeRoom();
      unsubscribeProblems();
    };
  }, [roomId]);

  const formatDate = (date) => {
    if (!date) return "-";
    const options = {
      day: "2-digit",
      month: "short",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-GB", options)
      .format(date)
      .replace(",", " •");
  };

  const topThree = leaderboard.slice(0, 3);
  const restOfBoard = leaderboard.slice(3);

  const podiumOrder = [
    topThree.find((p) => p.rank === 2),
    topThree.find((p) => p.rank === 1),
    topThree.find((p) => p.rank === 3),
  ].filter(Boolean);

  // ✅ 3. Render Loading State
  if (isLoading) {
    return (
      <div className="leaderboard-wrapper">
        <div className="loading-container">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-wrapper">
      <div className="leaderboard-content">
        {/* --- HERO PODIUM STAGE --- */}
        {podiumOrder.length > 0 && (
          <div className="podium-stage">
            {podiumOrder.map((player) => (
              <div
                key={player.uid}
                className={`podium-column rank-${player.rank}`}
              >
                {/* Glowing Avatar */}
                <div className="podium-avatar-container">
                  {player.rank === 1 && (
                    <div className="crown-floating">
                      <CrownIcon color="#facc15" />
                    </div>
                  )}
                  <img
                    src={player.photoURL}
                    alt={player.username}
                    className="podium-avatar"
                  />
                  <div className="rank-pill">{player.rank}</div>
                </div>

                {/* Glass Info Card */}
                <div className="podium-info">
                  <h3 className="podium-name">{player.username}</h3>
                  <div className="podium-score">
                    <span className="score-num">{player.completed}</span>
                    <span className="score-label">Problems Solved</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- LIST SECTION --- */}
        <div className="leaderboard-list-card">
          <div className="list-header">
            <span className="col-rank">Rank</span>
            <span className="col-user">User</span>
            <span className="col-solved">Solved</span>
            <span className="col-progress">Progress</span>
            <span className="col-time">Last Active</span>
          </div>

          <div className="list-body">
            {restOfBoard.map((player) => (
              <div key={player.uid} className="list-row">
                <div className="col-rank">
                  <span className="rank-text">#{player.rank}</span>
                </div>

                <div className="col-user">
                  <img
                    src={player.photoURL}
                    alt=""
                    className="list-avatar"
                    onError={(e) => (e.target.src = defaultPhoto)}
                  />
                  <span className="list-name">{player.username}</span>
                </div>

                <div className="col-solved">
                  <span className="solved-badge">{player.completed}</span>
                </div>

                <div className="col-progress">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${player.completionPercentage}%` }}
                    />
                  </div>
                  <span className="progress-text">
                    {Math.round(player.completionPercentage)}%
                  </span>
                </div>

                <div className="col-time">
                  {formatDate(player.lastActivity)}
                </div>
              </div>
            ))}

            {/* Only show this if NOT loading and leaderboard is actually empty */}
            {leaderboard.length === 0 && !isLoading && (
              <div className="empty-message">No members in this room yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
