import { db } from "../../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const useRoomActions = (user) => {

  const sendFriendRequest = async (receiverId) => {
    try {
      await addDoc(collection(db, "friend_requests"), {
        senderId: user.uid,
        receiverId,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      alert("Friend request sent!");
    } catch {
      alert("Failed to send request");
    }
  };

  return { sendFriendRequest };
};
