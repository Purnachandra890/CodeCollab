import React, { useEffect, useState } from "react";
import { db } from "./firebase";
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
import { useAuth } from "./AuthContext";
import axios from "axios";
import "./LeaderBoard.css";

// --- Icon Component ---
const LogoIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="currentColor"
    color="#4f46e5"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z"></path>
  </svg>
);

const defaultPhoto =
  "https://static.vecteezy.com/system/resources/previews/000/550/731/original/user-icon-vector.jpg";

// ----- HELPER FUNCTIONS -----
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
  const looksSlugAlready = t.includes("-") || t === t.toLowerCase();
  return looksSlugAlready ? t.toLowerCase() : slugifyTitle(t);
};

export default function LeaderBoard() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [roomName, setRoomName] = useState("");

  // ----- useEffect to sync LeetCode submissions for the current user -----
  useEffect(() => {
    // Helper function to handle API requests with failover
    const fetchWithFailover = async (endpoints) => {
      let lastError = null;
      for (const url of endpoints) {
        try {
          const response = await axios.get(url);
          // console.log(`Successfully fetched from ${url}`);
          return response; // Success
        } catch (error) {
          // console.warn(`Request to ${url} failed. Trying next server...`);
          lastError = error;
        }
      }
      // If loop completes, all have failed
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

        if (updates.length > 0) {
          await Promise.all(updates);
        }
      } catch (err) {
        console.error("Error syncing LeetCode submissions from all servers:", err);
      }
    };

    syncSubmissions();
  }, [roomId, user?.uid]);

  // ----- useEffect to fetch and display leaderboard data (NO CHANGES HERE) -----
  useEffect(() => {
    if (!roomId) return;

    getDoc(doc(db, "rooms", roomId)).then((docSnap) => {
      if (docSnap.exists()) setRoomName(docSnap.data().name);
    });

    const roomRef = doc(db, "rooms", roomId);
    const problemsRef = collection(db, "rooms", roomId, "problems");

    const unsubscribeRoom = onSnapshot(roomRef, (roomSnap) => {
      if (!roomSnap.exists()) return;
      const memberUIDs = roomSnap.data().members || [];

      const unsubscribeProblems = onSnapshot(
        query(problemsRef),
        async (problemsSnap) => {
          const totalProblems = problemsSnap.docs.length;
          const userStats = {};

          memberUIDs.forEach((uid) => {
            userStats[uid] = { completed: 0, lastActivity: null };
          });

          problemsSnap.docs.forEach((problemDoc) => {
            const problem = problemDoc.data();
            if (!problem.completedBy) return;
            Object.entries(problem.completedBy).forEach(
              ([uid, timestamp]) => {
                if (!userStats[uid]) return;
                userStats[uid].completed += 1;
                const activityDate = timestamp?.toDate
                  ? timestamp.toDate()
                  : null;
                if (
                  !userStats[uid].lastActivity ||
                  activityDate > userStats[uid].lastActivity
                ) {
                  userStats[uid].lastActivity = activityDate;
                }
              }
            );
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
                  totalProblems > 0
                    ? (stats.completed / totalProblems) * 100
                    : 0,
              };
            })
          );

          finalData.sort((a, b) => {
            if (b.completed !== a.completed) return b.completed - a.completed;
            return a.lastActivity - b.lastActivity;
          });

          const rankedData = finalData.map((user, index) => ({
            ...user,
            rank: index + 1,
          }));
          setLeaderboard(rankedData);
        }
      );
      return () => unsubscribeProblems();
    });
    return () => unsubscribeRoom();
  }, [roomId]);

  const formatDate = (date) => {
    if (!date) return "No Activity";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    }).format(date);
  };

  const topThree = leaderboard.slice(0, 3);
  const restOfBoard = leaderboard.slice(3);

  const podiumOrder = [
    topThree.find((p) => p.rank === 2),
    topThree.find((p) => p.rank === 1),
    topThree.find((p) => p.rank === 3),
  ].filter(Boolean);

  return (
    <div className="leaderboard-container">
      <section className="podium">
        {podiumOrder.map((player) => (
          <div key={player.uid} className={`podium-card rank-${player.rank}`}>
            <span className="podium-rank">{player.rank}</span>
            <img
              src={player.photoURL}
              alt={player.username}
              className="podium-avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultPhoto;
              }}
            />
            <h3 className="podium-name">{player.username}</h3>
            <p className="podium-problems">{player.completed} Problems</p>
            {/* <p>{formatDate(player.lastActivity)}</p> */}
          </div>
        ))}
      </section>

      <section className="leaderboard-table-card">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Problems Solved</th>
              <th>Completion</th>
              <th>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {restOfBoard.map((player) => (
              <tr key={player.uid}>
                <td>
                  <span className="rank-number">{player.rank}</span>
                </td>
                <td>
                  <div className="user-cell">
                    <img
                      src={player.photoURL}
                      alt={player.username}
                      className="user-avatar-table"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultPhoto;
                      }}
                    />
                    <div>
                      <span className="user-name">{player.username}</span>
                      {/* <span className="user-id">
                        {player.uid.substring(0, 6).toUpperCase()}
                      </span> */}
                    </div>
                  </div>
                </td>
                <td>{player.completed}</td>
                <td>
                  <div className="completion-cell">
                    <div className="completion-bar-container">
                      <div
                        className="completion-bar-fill"
                        style={{ width: `${player.completionPercentage}%` }}
                      ></div>
                    </div>
                    <span>{Math.round(player.completionPercentage)}%</span>
                  </div>
                </td>
                <td>{formatDate(player.lastActivity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}