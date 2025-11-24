import { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export const useProblems = (roomId) => {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, "rooms", roomId, "problems"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setProblems(snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })));
    });

    return () => unsub();
  }, [roomId]);

  return problems;
};
