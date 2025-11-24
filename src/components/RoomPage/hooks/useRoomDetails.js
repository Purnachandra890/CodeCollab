import { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";

export const useRoomDetails = (roomId, defaultPhoto) => {
  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!roomId) return;

    const unsub = onSnapshot(doc(db, "rooms", roomId), async (roomSnap) => {
      if (!roomSnap.exists()) return;

      const roomData = roomSnap.data();
      setRoom(roomData);

      const memberUIDs = roomData.members || [];
      const memberPromises = memberUIDs.map(async (uid) => {
        const userSnap = await getDoc(doc(db, "users", uid));
        return userSnap.exists()
          ? { id: uid, ...userSnap.data() }
          : { id: uid, name: "Unknown User", photoURL: defaultPhoto };
      });

      setMembers(await Promise.all(memberPromises));
    });

    return () => unsub();
  }, [roomId, defaultPhoto]);

  return { room, members };
};
