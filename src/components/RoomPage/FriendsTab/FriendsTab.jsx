import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import "./FriendsTab.css";

const FriendsTab = ({ user }) => {
  const [friendsList, setFriendsList] = useState([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);

  const defaultPhoto =
    "https://static.vecteezy.com/system/resources/previews/000/550/731/original/user-icon-vector.jpg";

  useEffect(() => {
    if (!user?.uid) return;
    setIsLoadingFriends(true);

    const unsub = onSnapshot(doc(db, "users", user.uid), async (userSnap) => {
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const friendUIDs = userData.friends || [];

        const friendsDetails = await Promise.all(
          friendUIDs.map(async (friendId) => {
            const friendDoc = await getDoc(doc(db, "users", friendId));
            return friendDoc.exists()
              ? { id: friendId, ...friendDoc.data() }
              : null;
          })
        );
        setFriendsList(friendsDetails.filter(Boolean));
      } else {
        setFriendsList([]);
      }
      setIsLoadingFriends(false);
    });

    return () => unsub();
  }, [user]);

  return (
    // ✅ FIX: Added "card" class here to fix the layout/width issue
    <div className="friends-container card">
      
      <h3>Your Friends <span style={{ opacity: 0.5, fontSize: '0.8em' }}>({friendsList.length})</span></h3>

      <div className="friend-grid-scroll-container">
        {isLoadingFriends ? (
          <div className="friend-grid">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="friend-card skeleton-card">
                <div className="skeleton-avatar-large"></div>
                <div className="skeleton-text-short"></div>
              </div>
            ))}
          </div>
        ) : friendsList.length > 0 ? (
          <div className="friend-grid">
            {friendsList.map((friend) => (
              <div key={friend.id} className="friend-card">
                <img
                  src={friend.photoURL || defaultPhoto}
                  alt={friend.name}
                  className="friend-photo"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultPhoto;
                  }}
                />
                <div className="friend-info">
                  <span className="friend-name">{friend.name}</span>
                  {/* Optional status text to balance the card */}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-friends-message">
            <p>No friends found.</p>
            <small>Add people from the Members tab to see them here.</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsTab;