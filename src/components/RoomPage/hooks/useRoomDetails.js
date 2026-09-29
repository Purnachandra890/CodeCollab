import { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";

export const useRoomDetails = (roomId, defaultPhoto, userId) => {
  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsub = onSnapshot(
      doc(db, "rooms", roomId),
      async (roomSnap) => {
        if (!roomSnap.exists()) {
          setRoom(null);
          setMembers([]);
          setError("Room not found.");
          setLoading(false);
          return;
        }

        const roomData = roomSnap.data();
        const memberUIDs = roomData.members || [];

        // Check if user is a member of this room
        if (userId && !memberUIDs.includes(userId)) {
          setRoom(null);
          setMembers([]);
          setError("You are not a member of this room. Please ask the host for an invite link.");
          setLoading(false);
          return;
        }

        setRoom({ id: roomSnap.id, ...roomData });
        setError(null);

        try {
          const memberPromises = memberUIDs.map(async (uid) => {
            const userSnap = await getDoc(doc(db, "users", uid));
            return userSnap.exists()
              ? { id: uid, ...userSnap.data() }
              : { id: uid, name: "Unknown User", photoURL: defaultPhoto };
          });

          setMembers(await Promise.all(memberPromises));
        } catch (fetchErr) {
          console.error("Error fetching room members:", fetchErr);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error listening to room:", err);
        setError("Failed to load room details.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [roomId, defaultPhoto, userId]);

  return { room, members, loading, error };
};
