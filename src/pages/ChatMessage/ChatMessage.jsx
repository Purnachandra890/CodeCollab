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
import { useParams, Link } from "react-router-dom";
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

  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomName, setRoomName] = useState("");

  const messagesEndRef = useRef(null);
  const defaultPhoto = "https://static.vecteezy.com/system/resources/previews/000/550/731/original/user-icon-vector.jpg";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Reset unread counts
  useEffect(() => {
    if (!roomId || !user) return;
    const resetUnread = async () => {
      const roomRef = doc(db, "rooms", roomId);
      const snap = await getDoc(roomRef);
      if (snap.exists()) {
        const data = snap.data();
        const unreadCounts = data.unreadCounts || {};
        unreadCounts[user.uid] = 0;
        await updateDoc(roomRef, { unreadCounts });
      }
    };
    resetUnread();
  }, [roomId, user]);

  // Load Messages
  useEffect(() => {
    if (!roomId) return;
    getDoc(doc(db, "rooms", roomId)).then((snap) => {
      if (snap.exists()) setRoomName(snap.data().name);
    });
    const q = query(collection(db, "rooms", roomId, "messages"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [roomId]);

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