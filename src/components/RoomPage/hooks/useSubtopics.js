import { useState, useEffect } from "react";
import { db } from "../../../firebase";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export const useSubtopics = (roomId) => {
  const [subtopics, setSubtopics] = useState([]);

  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, "rooms", roomId, "subtopics"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setSubtopics(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsub();
  }, [roomId]);

  const addSubtopic = async (title) => {
    if (!roomId || !title?.trim()) return null;
    try {
      const docRef = await addDoc(
        collection(db, "rooms", roomId, "subtopics"),
        {
          title: title.trim(),
          createdAt: serverTimestamp(),
        }
      );
      return docRef.id;
    } catch (err) {
      console.error("Failed to add subtopic:", err);
      return null;
    }
  };

  const deleteSubtopic = async (subtopicId) => {
    if (!roomId || !subtopicId) return;
    if (!window.confirm("Delete this subtopic? Problems under it will become ungrouped."))
      return;
    try {
      await deleteDoc(doc(db, "rooms", roomId, "subtopics", subtopicId));
    } catch (err) {
      console.error("Failed to delete subtopic:", err);
    }
  };

  return { subtopics, addSubtopic, deleteSubtopic };
};
