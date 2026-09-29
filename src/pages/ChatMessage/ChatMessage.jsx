// src/ChatMessage.jsx

import React, { useEffect, useState, useRef } from "react";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "../../AuthContext";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./ChatMessage.css";

// ---- Icons ----
const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
  </svg>
);

const BackArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChatMessage = () => {
  const { user } = useAuth();
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomName, setRoomName] = useState("");

  const messagesEndRef = useRef(null);
  const defaultPhoto = "https://static.vecteezy.com/system/resources/previews/000/550/731/original/user-icon-vector.jpg";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Load Room & Messages with Access Control
  useEffect(() => {
    if (!roomId || !user?.uid) return;

    let unsubMessages = () => {};

    const checkAccessAndLoad = async () => {
      try {
        const snap = await getDoc(doc(db, "rooms", roomId));
        if (!snap.exists()) {
          navigate("/dashboard/rooms", {
            replace: true,
            state: {
              toastMessage: "Room not found.",
              toastType: "error",
              duration: null,
            },
          });
          return;
        }

        const data = snap.data();
        if (!data.members?.includes(user.uid)) {
          navigate("/dashboard/rooms", {
            replace: true,
            state: {
              toastMessage: "You are not a member of this room. Please ask the host for an invite link.",
              toastType: "error",
              duration: null,
            },
          });
          return;
        }

        setRoomName(data.name || "");

        // Reset unread count for current user
        const unreadCounts = data.unreadCounts || {};
        if (unreadCounts[user.uid]) {
          unreadCounts[user.uid] = 0;
          await updateDoc(doc(db, "rooms", roomId), { unreadCounts });
        }

        // Listen for messages only once membership is confirmed
        const q = query(collection(db, "rooms", roomId, "messages"), orderBy("timestamp"));
        unsubMessages = onSnapshot(q, (snapshot) => {
          const msgs = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            timestamp: d.data().timestamp?.toDate(),
          }));
          setMessages(msgs);
        });
      } catch (err) {
        console.error("Error loading chat:", err);
      }
    };

    checkAccessAndLoad();

    return () => unsubMessages();
  }, [roomId, user?.uid, navigate]);

  // Send Message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const roomRef = doc(db, "rooms", roomId);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const members = data.members || [];
    const unreadCounts = data.unreadCounts || {};
    const updatedUnread = { ...unreadCounts };

    members.forEach(uid => {
      if (uid !== user.uid) {
        updatedUnread[uid] = (updatedUnread[uid] || 0) + 1;
      }
    });

    await addDoc(collection(db, "rooms", roomId, "messages"), {
      text: newMessage,
      senderId: user.uid,
      senderName: user.displayName || "Anonymous",
      senderPhotoURL: user.photoURL || "",
      timestamp: serverTimestamp(),
    });

    await updateDoc(roomRef, { unreadCounts: updatedUnread });
    setNewMessage("");
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <Link to={`/dashboard/room/${roomId}`} className="back-to-room-link-chat">
          <BackArrowIcon />
        </Link>
        <div className="chat-header-info">
          <h1>{roomName} Chat</h1>
          <p>Discuss problems and collaborate with your team.</p>
        </div>
      </header>

      <div className="messages-list">
        {messages.map((msg) => {
          const isMine = msg.senderId === user?.uid;

          // ✅ UPDATED: Added Date and Month logic
          const time = msg.timestamp
            ? new Intl.DateTimeFormat("en-US", {
                month: "short", // e.g., "Jan"
                day: "numeric", // e.g., "1"
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              }).format(msg.timestamp)
            : "";

          return (
            <div key={msg.id} className={`message-wrapper ${isMine ? "sent" : "received"}`}>
              {/* Show avatar for received messages */}
              <img
                src={msg.senderPhotoURL || defaultPhoto}
                alt="user"
                className="message-avatar"
                onError={(e) => e.target.src = defaultPhoto}
              />

              <div className="message-content">
                {!isMine && <span className="message-sender-name">{msg.senderName}</span>}
                <div className="message-bubble">{msg.text}</div>
                <span className="message-timestamp">{time}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-form" onSubmit={handleSend}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" className="send-btn">
          <SendIcon />
        </button>
      </form>
    </div>
  );
};

export default ChatMessage;