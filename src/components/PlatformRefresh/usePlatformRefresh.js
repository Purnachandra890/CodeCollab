import { useEffect, useState } from "react";
import axios from "axios";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { getProblemSlug } from "../../utils/problemSlug";

const CACHE_DURATION = 10 * 60 * 1000;

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

const getMillis = (val) => {
  if (!val) return null;
  if (typeof val.toMillis === "function") return val.toMillis();
  if (typeof val.toDate === "function") return val.toDate().getTime();
  if (typeof val === "number") return val;
  if (val.seconds != null) return val.seconds * 1000 + (val.nanoseconds ? val.nanoseconds / 1e6 : 0);
  const parsed = new Date(val).getTime();
  return isNaN(parsed) ? null : parsed;
};

const checkCacheRefreshStatus = (cache, setCanRefresh, setNextRefreshIn) => {
  const lastFetched = getMillis(cache?.lastFetchedAt);
  if (!lastFetched) {
    setCanRefresh(true);
    setNextRefreshIn(null);
    return;
  }
  const diff = Date.now() - lastFetched;

  if (diff >= CACHE_DURATION) {
    setCanRefresh(true);
    setNextRefreshIn(null);
  } else {
    setCanRefresh(false);
    setNextRefreshIn(Math.max(0, CACHE_DURATION - diff));
  }
};

export function usePlatformRefresh(user, roomId) {
  const userId = user?.uid;

  const [leetcodeUsername, setLeetcodeUsername] = useState(null);
  const [gfgUsername, setGfgUsername] = useState(null);
  const [gfgSolvedSlugs, setGfgSolvedSlugs] = useState([]);

  const [loadingLeetcode, setLoadingLeetcode] = useState(false);
  const [canRefreshLeetcode, setCanRefreshLeetcode] = useState(false);
  const [nextLeetcodeRefreshIn, setNextLeetcodeRefreshIn] = useState(null);

  const [loadingGfg, setLoadingGfg] = useState(false);
  const [canRefreshGfg, setCanRefreshGfg] = useState(false);
  const [nextGfgRefreshIn, setNextGfgRefreshIn] = useState(null);

  const checkGfgCacheStatus = (cache) =>
    checkCacheRefreshStatus(cache, setCanRefreshGfg, setNextGfgRefreshIn);

  const checkLeetcodeCacheStatus = (cache) =>
    checkCacheRefreshStatus(cache, setCanRefreshLeetcode, setNextLeetcodeRefreshIn);

  useEffect(() => {
    if (!userId) return;
    getDoc(doc(db, "users", userId)).then((snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setLeetcodeUsername(data.leetcodeUsername || null);
      setGfgUsername(data.gfgUsername || null);
    });
  }, [userId]);

  useEffect(() => {
    if (!nextLeetcodeRefreshIn) return;
    const interval = setInterval(() => {
      setNextLeetcodeRefreshIn((prev) => {
        if (prev <= 1000) {
          setCanRefreshLeetcode(true);
          clearInterval(interval);
          return null;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [nextLeetcodeRefreshIn]);

  useEffect(() => {
    if (!nextGfgRefreshIn) return;
    const interval = setInterval(() => {
      setNextGfgRefreshIn((prev) => {
        if (prev <= 1000) {
          setCanRefreshGfg(true);
          clearInterval(interval);
          return null;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [nextGfgRefreshIn]);

  useEffect(() => {
    if (!gfgUsername || !userId) return;
    const loadGfgCache = async () => {
      const snap = await getDoc(doc(db, "users", userId));
      const cache = snap.data()?.gfgCache;
      if (cache?.slugs) {
        setGfgSolvedSlugs(cache.slugs || []);
        checkGfgCacheStatus(cache);
      } else {
        setCanRefreshGfg(true);
      }
    };
    loadGfgCache();
  }, [gfgUsername, userId]);

  useEffect(() => {
    if (!leetcodeUsername || !userId) return;
    const loadLeetcodeCache = async () => {
      const snap = await getDoc(doc(db, "users", userId));
      const cache = snap.data()?.leetcodeCache;
      if (cache?.lastFetchedAt) {
        checkLeetcodeCacheStatus(cache);
      } else {
        setCanRefreshLeetcode(true);
      }
    };
    loadLeetcodeCache();
  }, [leetcodeUsername, userId]);

  const syncLeetcodeCompletions = async (slugs) => {
    if (!userId || !roomId || !slugs?.length) return;
    const slugSet = new Set(slugs);
    const problemsSnapshot = await getDocs(
      collection(db, "rooms", roomId, "problems")
    );
    const updates = [];
    for (const docSnap of problemsSnapshot.docs) {
      const p = { id: docSnap.id, ...docSnap.data() };
      const slug = getProblemSlug(p);
      if (!slug) continue;
      if (slugSet.has(slug) && !p?.completedBy?.[userId]) {
        updates.push(
          updateDoc(doc(db, "rooms", roomId, "problems", p.id), {
            [`completedBy.${userId}`]: serverTimestamp(),
          })
        );
      }
    }
    if (updates.length) await Promise.all(updates);
  };

  const refreshLeetcode = async (force = false) => {
    if (!leetcodeUsername || !userId || loadingLeetcode) return;
    try {
      setLoadingLeetcode(true);
      const userRef = doc(db, "users", userId);
      const snap = await getDoc(userRef);
      const cache = snap.data()?.leetcodeCache;

      if (!force && cache?.slugs && cache?.lastFetchedAt) {
        const lastFetched = getMillis(cache.lastFetchedAt);
        if (lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
          await syncLeetcodeCompletions(cache.slugs);
          return;
        }
      }

      const endpoints = [
        `https://leetcode-api-xesz.onrender.com/${leetcodeUsername}/acSubmission`,
        `https://leetcode-api-u9ko.onrender.com/${leetcodeUsername}/acSubmission`,
      ];
      const res = await fetchWithFailover(endpoints);
      const arr = Array.isArray(res.data?.submission) ? res.data.submission : [];
      const slugs = Array.from(
        new Set(arr.map((s) => (s.titleSlug || "").toLowerCase()).filter(Boolean))
      );

      await updateDoc(userRef, {
        leetcodeCache: { slugs, lastFetchedAt: serverTimestamp() },
      });
      checkLeetcodeCacheStatus({ lastFetchedAt: { toMillis: () => Date.now() } });
      await syncLeetcodeCompletions(slugs);
    } catch (e) {
      console.error("LeetCode refresh failed:", e);
      alert("Could not refresh LeetCode data. Please try again later.");
      setCanRefreshLeetcode(false);
      setNextLeetcodeRefreshIn(CACHE_DURATION);
    } finally {
      setLoadingLeetcode(false);
    }
  };

  const refreshGfg = async (force = false) => {
    if (!gfgUsername || !userId || loadingGfg) return;
    try {
      setLoadingGfg(true);
      const userRef = doc(db, "users", userId);
      const snap = await getDoc(userRef);
      const cache = snap.data()?.gfgCache;
      if (!force && cache?.slugs && cache?.lastFetchedAt) {
        const lastFetched = getMillis(cache.lastFetchedAt);
        if (lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
          setGfgSolvedSlugs(cache.slugs);
          return;
        }
      }
      const res = await axios.post(
        `${import.meta.env.VITE_GFG_API_URL}/api/gfg/solved`,
        { handle: gfgUsername, year: "", month: "" },
        { headers: { "Content-Type": "application/json" } }
      );

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
        setNextGfgRefreshIn(CACHE_DURATION);
      }
    } finally {
      setLoadingGfg(false);
    }
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return {
    gfgSolvedSlugs,
    leetcodeUsername,
    gfgUsername,
    loadingLeetcode,
    canRefreshLeetcode,
    nextLeetcodeRefreshIn,
    refreshLeetcode: () => refreshLeetcode(true),
    loadingGfg,
    canRefreshGfg,
    nextGfgRefreshIn,
    refreshGfg: () => refreshGfg(true),
    formatTime,
  };
}
