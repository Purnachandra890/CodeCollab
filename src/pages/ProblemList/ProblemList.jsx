// src/ProblemList.jsx
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

// Keep your Icons exactly as they are...
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

// ... Keep your helpers (slugFromLink, slugifyTitle, getProblemSlug) exactly as they are ...
const slugFromLink = (link) => {
    if (!link || typeof link !== "string") return "";
    try {
      const m = link.match(/\/problems\/([^\/?#]+)/i);
      if (m && m[1]) return m[1].toLowerCase();
      const parts = link.split("/").filter(Boolean);
      const last = (parts[parts.length - 1] || "").toLowerCase();
      if (["description", "solution", "solutions", "submissions", "discussion"].includes(last)) {
        const prev = (parts[parts.length - 2] || "").toLowerCase();
        return prev;
      }
      return last;
    } catch { return ""; }
  };
  
  const slugifyTitle = (title) => (title || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  
  const getProblemSlug = (problem) => {
    const fromLink = slugFromLink(problem?.link);
    if (fromLink) return fromLink;
    const t = problem?.title || "";
    if (!t) return "";
    return (t.includes("-") || t === t.toLowerCase()) ? t.toLowerCase() : slugifyTitle(t);
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

  const gfgSolvedSet = React.useMemo(() => new Set(gfgSolvedSlugs), [gfgSolvedSlugs]);
  const CACHE_DURATION = 30 * 60 * 1000;

  const checkGfgCacheStatus = (cache) => {
    if (!cache?.lastFetchedAt) {
      setCanRefreshGfg(true);
      setNextRefreshIn(null);
      return;
    }
    const lastFetched = cache.lastFetchedAt.toMillis();
    const diff = Date.now() - lastFetched;

    if (diff >= CACHE_DURATION) {
      setCanRefreshGfg(true);
      setNextRefreshIn(null);
    } else {
      setCanRefreshGfg(false);
      setNextRefreshIn(CACHE_DURATION - diff);
    }
  };

  useEffect(() => {
    if (!roomId) return;
    getDoc(doc(db, "rooms", roomId)).then((docSnap) => {
      if (docSnap.exists()) setRoomName(docSnap.data().name || "");
    });
    const qProblems = query(collection(db, "rooms", roomId, "problems"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(qProblems, (snapshot) => {
      setProblems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [roomId]);

  useEffect(() => {
    if (!user?.uid) return;
    getDoc(doc(db, "users", user.uid)).then(snap => {
       setLeetcodeUsername(snap.exists() ? snap.data().leetcodeUsername || null : null);
       setGfgUsername(snap.exists() ? snap.data().gfgUsername || null : null);
    });
  }, [user?.uid]);

  useEffect(() => {
    if (!leetcodeUsername) return;
    const fetchWithFailover = async (endpoints) => {
      let lastError = null;
      for (const url of endpoints) {
        try {
          return await axios.get(url);
        } catch (error) { lastError = error; }
      }
      throw new Error("All API servers are unavailable.", { cause: lastError });
    };

    const fetchSolved = async () => {
      try {
        const endpoints = [
          `https://leetcode-api-xesz.onrender.com/${leetcodeUsername}/acSubmission`,
          `https://leetcode-api-u9ko.onrender.com/${leetcodeUsername}/acSubmission`,
        ];
        const res = await fetchWithFailover(endpoints);
        const arr = Array.isArray(res.data?.submission) ? res.data.submission : [];
        const slugs = Array.from(new Set(arr.map((s) => (s.titleSlug || "").toLowerCase()).filter(Boolean)));
        setSolvedSlugs(slugs);
      } catch (err) { setSolvedSlugs([]); }
    };
    fetchSolved();
  }, [leetcodeUsername]);

  useEffect(() => {
    const doSync = async () => {
      if (!user || !roomId || !problems.length || !solvedSlugs.length) return;
      const updates = [];
      for (const p of problems) {
        const slug = getProblemSlug(p);
        if (!slug) continue;
        const isSolvedInAPI = solvedSlugs.includes(slug);
        const alreadyMarked = !!p?.completedBy?.[user.uid];
        if (isSolvedInAPI && !alreadyMarked) {
          updates.push(updateDoc(doc(db, "rooms", roomId, "problems", p.id), {
            [`completedBy.${user.uid}`]: serverTimestamp(),
          }));
        }
      }
      if (updates.length) await Promise.all(updates);
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

  const completedCount = problems.filter((p) => {
    const slug = getProblemSlug(p);
    return p?.completedBy?.[user?.uid] || (slug && solvedSlugs.includes(slug));
  }).length;
  const totalCount = problems.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const fetchGfgSolved = async (force = false) => {
    if (!gfgUsername || !user?.uid || loadingGfg) return;
    try {
      setLoadingGfg(true);
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      const cache = snap.data()?.gfgCache;
      if (!force && cache?.slugs && cache?.lastFetchedAt) {
        const lastFetched = cache.lastFetchedAt.toMillis();
        if (Date.now() - lastFetched < CACHE_DURATION) {
            setGfgSolvedSlugs(cache.slugs);
            return;
        }
      }
      const res = await axios.post(`${import.meta.env.VITE_GFG_API_URL}/api/gfg/solved`, {
        handle: gfgUsername, year: "", month: "",
      }, { headers: { "Content-Type": "application/json" } });

      if (res.data?.success) {
        setGfgSolvedSlugs(res.data.slugs || []);
        await updateDoc(userRef, {
          gfgCache: { slugs: res.data.slugs || [], lastFetchedAt: serverTimestamp() },
        });
        checkGfgCacheStatus({ lastFetchedAt: { toMillis: () => Date.now() } });
      }
    } catch (e) {
      if (e.response?.status === 429) {
        alert("Too many requests. Please try again later.");
        setCanRefreshGfg(false);
        setNextRefreshIn(CACHE_DURATION);
      }
    } finally { setLoadingGfg(false); }
  };

  useEffect(() => {
    if (!gfgUsername || !user?.uid) return;
    const checkAndFetch = async () => {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      const cache = snap.data()?.gfgCache;
      if (cache?.slugs) {
        setGfgSolvedSlugs(cache.slugs || []);
        checkGfgCacheStatus(cache);
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
              {loadingGfg ? "Refreshing..." : "Refresh GFG Data"}
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
          <p>Please enter your GeeksforGeeks username in Profile to enable GFG auto-detection.</p>
        </div>
      )}

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
        {problems.map((problem) => {
          const slug = getProblemSlug(problem);
          const isCompleted = !!problem?.completedBy?.[user?.uid];
          const solvedByLeetCode = slug && solvedSlugs.includes(slug);
          const detectedInGfg = slug && gfgSolvedSet.has(slug);

          return (
            <div
              key={problem.id}
              className={`problem-item-card ${isCompleted || solvedByLeetCode ? "completed" : "todo"}`}
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