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

  const saveProblem = async (problem, editingProblem) => {
    try {
      setIsSaving(true);

      const normalized = normalizeLink(problem.link);
      const slug = extractTitleFromLink(normalized);

      if (!slug) {
        alert("Invalid LeetCode link");
        return;
      }

      const problemToSave = {
        title: slug,
        titleSlug: slug,
        link: normalized,
        youtubeLink: problem.youtubeLink || null,
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
