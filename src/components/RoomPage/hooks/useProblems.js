import { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export const useProblems = (roomId) => {
  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(true);

  useEffect(() => {
    if (!roomId) {
      setLoadingProblems(false);
      return;
    }

    setLoadingProblems(true);
    const q = query(
      collection(db, "rooms", roomId, "problems"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setProblems(snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })));
      setLoadingProblems(false);
    }, (error) => {
      console.error("Error fetching problems:", error);
      setLoadingProblems(false);
    });

    return () => unsub();
  }, [roomId]);

  return { problems, loadingProblems };
};
