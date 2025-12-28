// ProblemList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../../AuthContext";
import { useParams, Link } from "react-router-dom";
import "./ProblemList.css";
import GfgInfoBox from './components/GfgInfoBox'


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

export default function ProblemList() {
  const { user } = useAuth();
  const { roomId } = useParams();

  const [problems, setProblems] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [solvedSlugs, setSolvedSlugs] = useState([]);
  const [leetcodeUsername, setLeetcodeUsername] = useState(null);

  const [gfgUsername, setGfgUsername] = useState(null);
  const [gfgSolvedSlugs, setGfgSolvedSlugs] = useState([]);
  const [loadingGfg, setLoadingGfg] = useState(false);

  const [canRefreshGfg, setCanRefreshGfg] = useState(false);
  const [nextRefreshIn, setNextRefreshIn] = useState(null);

  const gfgSolvedSet = React.useMemo(
    () => new Set(gfgSolvedSlugs),
    [gfgSolvedSlugs]
  );

  const CACHE_DURATION = 30 * 60 * 1000; // 1 hour 30 minutes
  // checkGfgCacheStatus
  const checkGfgCacheStatus = (cache) => {
    if (!cache?.lastFetchedAt) {
      setCanRefreshGfg(true);
      setNextRefreshIn(null);
      return;
    }

    const lastFetched = cache.lastFetchedAt.toMillis();
    const now = Date.now();
    const diff = now - lastFetched;

    if (diff >= CACHE_DURATION) {
      // Cache expired
      setCanRefreshGfg(true);
      setNextRefreshIn(null);
    } else {
      // Cache still valid
      setCanRefreshGfg(false);
      setNextRefreshIn(CACHE_DURATION - diff);
    }
  };

  // Load room name + problems
  useEffect(() => {
    if (!roomId) return;

    getDoc(doc(db, "rooms", roomId)).then((docSnap) => {
      if (docSnap.exists()) setRoomName(docSnap.data().name || "");
    });

    const qProblems = query(
      collection(db, "rooms", roomId, "problems"),
      orderBy("createdAt", "asc") // Add this orderBy clause
    );

    const unsub = onSnapshot(qProblems, (snapshot) => {
      setProblems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

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

  // Load GFG username once from users/{uid}
  useEffect(() => {
    if (!user?.uid) return;

    const load = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setGfgUsername(snap.data().gfgUsername || null);
      } else {
        setGfgUsername(null);
      }
    };
    load();
  }, [user?.uid]);

  // Fetch solved slugs when username is available (WITH FAILOVER)
  useEffect(() => {
    if (!leetcodeUsername) return;

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

    const fetchSolved = async () => {
      try {
        const endpoints = [
          `https://leetcode-api-xesz.onrender.com/${leetcodeUsername}/acSubmission`,
          `https://leetcode-api-u9ko.onrender.com/${leetcodeUsername}/acSubmission`,
        ];

        const res = await fetchWithFailover(endpoints);

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
        console.error("Error fetching solved problems from all servers:", err);
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
              // [`completedBy.${user.uid}`]: true,
              [`completedBy.${user.uid}`]: serverTimestamp(),
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

  useEffect(() => {
    if (!nextRefreshIn) return;

    const interval = setInterval(() => {
      setNextRefreshIn((prev) => {
        if (prev <= 1000) {
          setCanRefreshGfg(true);
          clearInterval(interval);
          return null;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [nextRefreshIn]);

  // UI status
  const completedCount = problems.filter((p) => {
    const slug = getProblemSlug(p);
    return p?.completedBy?.[user?.uid] || (slug && solvedSlugs.includes(slug));
  }).length;

  const totalCount = problems.length;
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const fetchGfgSolved = async (force = false) => {
    if (!gfgUsername || !user?.uid) return;

    // 🔒 HARD LOCK (MOST IMPORTANT)
    if (loadingGfg) {
      console.log("Blocked duplicate click");
      return;
    }

    try {
      setLoadingGfg(true);

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      const cache = snap.data()?.gfgCache;

      //  Use cache if allowed
      if (!force && cache?.slugs && cache?.lastFetchedAt) {
        const lastFetched = cache.lastFetchedAt.toMillis();
        const now = Date.now();

        if (now - lastFetched < CACHE_DURATION) {
          setGfgSolvedSlugs(cache.slugs);
          return;
        }
      }

      // 🚀 API call
      // console.log("api calling...");
      const res = await axios.post(
        `${import.meta.env.VITE_GFG_API_URL}/api/gfg/solved`,
        {
          handle: gfgUsername,
          year: "",
          month: "",
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data?.success) {
        setGfgSolvedSlugs(res.data.slugs || []);

        // ✅ Save cache
        await updateDoc(userRef, {
          gfgCache: {
            slugs: res.data.slugs || [],
            lastFetchedAt: serverTimestamp(),
          },
        });

        // 🔁 Update UI timer immediately
        checkGfgCacheStatus({
          lastFetchedAt: { toMillis: () => Date.now() },
        });
      }
    } catch (e) {
      if (e.response?.status === 429) {
        const msg =
          e.response.data?.error ||
          "Too many requests. Please try again later.";

        alert(msg);

        // Lock refresh button temporarily
        setCanRefreshGfg(false);
        setNextRefreshIn(CACHE_DURATION); 
      } else {
        console.error("❌ GFG fetch failed", e);
      }
    } finally {
      setLoadingGfg(false);
    }
  };

  useEffect(() => {
    if (!gfgUsername || !user?.uid) return;

    const checkAndFetch = async () => {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      const cache = snap.data()?.gfgCache;

      if (cache?.slugs) {
        // ✅ ONLY USE CACHE
        setGfgSolvedSlugs(cache.slugs || []);
        checkGfgCacheStatus(cache);
        console.log(" Using cached GFG data");
      } else {
        setCanRefreshGfg(true);
      }
    };

    checkAndFetch();
  }, [gfgUsername, user?.uid]);

  const formatTime = (ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="personal-list-container">
      <header className="personal-list-header">
        <Link to={`/dashboard/room/${roomId}`} className="back-to-room-link">
          <BackArrowIcon /> Back to {roomName}
        </Link>
        <GfgInfoBox />
        <div className="gfg">
          <h1>My Personal Problem List</h1>
          <div className="gfg-refresh-bar">
            <button
              className={`refresh-btn ${!canRefreshGfg ? "disabled" : ""}`}
              disabled={!canRefreshGfg || loadingGfg}
              onClick={() => fetchGfgSolved(true)}
            >
              {loadingGfg ? "Refreshing…" : "Refresh GFG Data"}
            </button>

            {!canRefreshGfg && nextRefreshIn && (
              <div className="refresh-timer">
                Available in {formatTime(nextRefreshIn)}
              </div>
            )}
          </div>
        </div>
      </header>

      {!gfgUsername && (
        <div className="notification-message">
          <p>
            Please enter your GeeksforGeeks username to enable GFG
            auto-detection.
          </p>
        </div>
      )}

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

          // 1️⃣ User-confirmed completion (source of truth)
          const isCompleted = !!problem?.completedBy?.[user?.uid];

          // 2️⃣ LeetCode auto-detection (trusted)
          const solvedByLeetCode = slug && solvedSlugs.includes(slug);

          // 3️⃣ GFG detection (NOT trusted, needs confirmation)
          const detectedInGfg = slug && gfgSolvedSet.has(slug);

          return (
            <div
              key={problem.id}
              className={`problem-item-card card ${
                isCompleted || solvedByLeetCode ? "completed" : "todo"
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
                {isCompleted || solvedByLeetCode ? (
                  <span className="completed-label">
                    <CheckIcon /> Completed
                  </span>
                ) : detectedInGfg ? (
                  <div style={{ textAlign: "right" }}>
                    <button
                      className="confirm-btn"
                      onClick={async () => {
                        await updateDoc(
                          doc(db, "rooms", roomId, "problems", problem.id),
                          {
                            [`completedBy.${user.uid}`]: true,
                          }
                        );
                      }}
                    >
                      Confirm Completion
                    </button>
                    <div className="detected-text">Detected from GFG</div>
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
