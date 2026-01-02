import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { db, auth } from "../../firebase"; // Make sure auth is exported from your firebase config
import "./JoinRoom.css"; // Import the new CSS file

// --- Icon Components ---
const CheckIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);
const ArrowRightIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

// --- Loading Spinner Component ---
const Spinner = () => (
    <div className="spinner-container">
        <div className="spinner"></div>
        <p className="loading-text">Validating Invite...</p>
    </div>
);

export default function JoinRoomByInvite() {
  const { inviteCode } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth state changes to re-run the fetch logic when user logs in.
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchRoom(user.uid);
      } else {
        setLoading(false);
        setError("Please log in to join a room.");
      }
    });
    return () => unsubscribe();
  }, [inviteCode]);

  const fetchRoom = async (userId) => {
    setLoading(true);
    setError("");
    try {
      const q = query(
        collection(db, "rooms"),
        where("inviteCode", "==", inviteCode)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const roomData = docSnap.data();
        const roomId = docSnap.id;
        setRoom({ ...roomData, id: roomId });

        if (roomData.members && roomData.members.includes(userId)) {
          setAlreadyJoined(true);
        } else {
          setAlreadyJoined(false);
        }
      } else {
        setError("Invite link is invalid. No room found.");
        setRoom(null);
      }
    } catch (err) {
      setError("Failed to fetch room details. Please try again.");
      console.error(err);
    }
    setLoading(false);
  };

  const joinRoom = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || !room) {
      setError("You must be logged in to join.");
      return;
    }

    try {
      const roomRef = doc(db, "rooms", room.id);
      await updateDoc(roomRef, {
        members: arrayUnion(userId),
      });
      // Navigate to the dashboard or room page after joining
      navigate(`/dashboard/room/${room.id}`);
    } catch (err) {
      setError("Could not join the room. Please try again.");
      console.error(err);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }
    if (error) {
      return <p className="error-message">{error}</p>;
    }
    if (!room) {
      return (
        <p className="error-message">Room not found with this invite code.</p>
      );
    }
    // Inside renderContent() in JoinRoomByInvite.js
    return (
      <>
        <div className="room-icon">
          {room.name ? room.name.charAt(0).toUpperCase() : "?"}
        </div>
        <h2>Exclusive Invite</h2>
        <h1>{room.name || "Private Room"}</h1>
        <p className="room-description">
          {room.description ||
            "You've been invited to join this private workspace to start competing and collaborating."}
        </p>

        {alreadyJoined ? (
          <>
            <div className="already-joined-message">
              <CheckIcon /> Member
            </div>
            <button
              className="dashboard-btn"
              onClick={() => navigate(`/dashboard/room/${room.id}`)}
            >
              Enter Room <ArrowRightIcon />
            </button>
          </>
        ) : (
          <button className="join-btn" onClick={joinRoom}>
            Accept Invite & Join
          </button>
        )}
      </>
    );
  };

  return (
    <div className="join-room-container">
      <div className="join-room-card">{renderContent()}</div>
    </div>
  );
}
