import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import "./RoomPage.css";
import "./FriendsTab.css";

const FriendsTab = ({ user }) => {
  const [friendsList, setFriendsList] = useState([]);
  
  // Define the default photo URL here
   const defaultPhoto =
    "https://static.vecteezy.com/system/resources/previews/000/550/731/original/user-icon-vector.jpg";

  useEffect(() => {
    if (!user?.uid) return;

    // Listen to the user's document to get real-time updates to their friends list
    const unsub = onSnapshot(doc(db, "users", user.uid), async (userSnap) => {
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const friendUIDs = userData.friends || [];

        // Fetch details for each friend UID
        const friendsDetails = await Promise.all(
          friendUIDs.map(async (friendId) => {
            const friendDoc = await getDoc(doc(db, "users", friendId));
            return friendDoc.exists()
              ? { id: friendId, ...friendDoc.data() }
              : null; // Handle case where friend document might not exist
          })
        );
        // Filter out any null values and update state
        setFriendsList(friendsDetails.filter(Boolean));
      }
    });

    return () => unsub();
  }, [user]);

  return (
    <div className="friends-container card">
      <h3>Your Friends</h3>
      {friendsList.length > 0 ? (
        <div className="friend-grid">
          {friendsList.map((friend) => (
            <div key={friend.id} className="friend-card">
              <img
                src={friend.photoURL || defaultPhoto} // Use the default photo if photoURL is not available
                alt={friend.name}
                className="friend-photo"
              />
              <div className="friend-info">
                <span className="friend-name">{friend.name}</span>
                {/* <span className="friend-id">
                  {friend.id.substring(0, 6).toUpperCase()}
                </span> */}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>You don't have any friends yet. Add some from the Members tab!</p>
      )}
    </div>
  );
};

export default FriendsTab;