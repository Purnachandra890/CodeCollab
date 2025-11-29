import { useState } from "react";
import { db } from "../../../firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

export const useRoomProblems = (roomId, user) => {
  const [isSaving, setIsSaving] = useState(false);

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
      const parts = url.pathname.split("/").filter(Boolean);
      const idx = parts.indexOf("problems");
      if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
      const m = link.match(/problems\/([^/]+)/i);
      return m ? m[1] : "";
    } catch {
      const m = String(rawLink || "").match(/problems\/([^/]+)/i);
      return m ? m[1] : "";
    }
  };

  // ✅ YouTube validation (optional field)
  const isValidYoutubeLink = (url) => {
    if (!url || url.trim() === "") return true; // ✅ allow empty

    try {
      const parsed = new URL(url);

      const validDomains = ["youtube.com", "www.youtube.com", "youtu.be"];

      if (!validDomains.includes(parsed.hostname)) {
        return false;
      }

      if (parsed.hostname.includes("youtube.com")) {
        return parsed.searchParams.has("v");
      }

      if (parsed.hostname === "youtu.be") {
        return parsed.pathname.length > 1;
      }

      return false;
    } catch (err) {
      return false;
    }
  };

  async function fetchDifficultyFromAPI(slug) {
    try {
      const url = `https://leetcode-api-xesz.onrender.com/select?titleSlug=${slug}`;
      const res = await fetch(url);
      const data = await res.json();
      return data?.difficulty || "Unknown";
    } catch (error) {
      console.log("Fetch failed:", error);
      return "Unknown";
    }
  }

  const saveProblem = async (problem, editingProblem) => {
    try {
      setIsSaving(true);

      const normalized = normalizeLink(problem.link);
      const slug = extractTitleFromLink(normalized);

      const difficulty = await fetchDifficultyFromAPI(slug);

      if (!slug) {
        alert("Invalid LeetCode link");
        return;
      }

      // ✅ Correct validation usage
      if (!isValidYoutubeLink(problem.youtubeLink)) {
        alert("Please enter a valid YouTube video link.");
        return;
      }

      const problemToSave = {
        title: slug,
        titleSlug: slug,
        link: normalized,
        youtubeLink: problem.youtubeLink?.trim() || null,
        difficulty: difficulty,
      };

      if (editingProblem) {
        await updateDoc(
          doc(db, "rooms", roomId, "problems", editingProblem.id),
          problemToSave
        );
      } else {
        await addDoc(collection(db, "rooms", roomId, "problems"), {
          ...problemToSave,
          addedBy: user.name,
          addedById: user.uid,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProblem = async (problemId) => {
    if (!window.confirm("Are you sure?")) return;
    await deleteDoc(doc(db, "rooms", roomId, "problems", problemId));
  };

  return { saveProblem, deleteProblem, isSaving };
};
