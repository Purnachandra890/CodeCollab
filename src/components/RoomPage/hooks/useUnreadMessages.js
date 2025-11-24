import { useEffect, useState } from "react";
import { db } from "../../../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export const useUnreadMessages = (roomId, userId) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!roomId || !userId) return;

    const roomRef = doc(db, "rooms", roomId);

    const unsub = onSnapshot(roomRef, (snap) => {
      const data = snap.data();
      const unreadCounts = data?.unreadCounts || {};
      setUnreadCount(unreadCounts[userId] || 0);
    });

    return () => unsub();
  }, [roomId, userId]);

  return unreadCount;
};
