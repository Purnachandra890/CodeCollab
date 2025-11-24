import { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";

export const useFriends = (user) => {
  const [friends, setFriends] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubUser = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setFriends(docSnap.data().friends || []);
      }
    });

    const qSent = query(
      collection(db, "friend_requests"),
      where("senderId", "==", user.uid),
      where("status", "==", "pending")
    );

    const unsubSent = onSnapshot(qSent, (snapshot) => {
      setSentRequests(snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })));
    });

    const qIncoming = query(
      collection(db, "friend_requests"),
      where("receiverId", "==", user.uid),
      where("status", "==", "pending")
    );

    const unsubIncoming = onSnapshot(qIncoming, (snapshot) => {
      setPendingRequestCount(snapshot.size);
    });

    return () => {
      unsubUser();
      unsubSent();
      unsubIncoming();
    };
  }, [user]);

  return { friends, sentRequests, pendingRequestCount };
};
