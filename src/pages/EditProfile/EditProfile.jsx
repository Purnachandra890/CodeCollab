import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import "./EditProfile.css";

// --- Icons ---
const BackIcon = () => (
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
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const SaveIcon = () => (
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
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

const InfoIcon = () => (
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
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

export default function EditProfile() {
  const navigate = useNavigate();
  const [uid, setUid] = useState(null);
  const [username, setUsername] = useState(""); // LeetCode
  const [gfgUsername, setGfgUsername] = useState(""); // GFG
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u ? u.uid : null));
    return unsub;
  }, []);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    const unsub = onSnapshot(doc(db, "users", uid), (snap) => {
      const data = snap.exists() ? snap.data() : {};
      setGfgUsername(data.gfgUsername || "");
      setUsername(data.leetcodeUsername || "");
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uid) return;

    setSaveStatus("Saving...");
    try {
      await setDoc(
        doc(db, "users", uid),
        {
          leetcodeUsername: username.trim(),
          gfgUsername: gfgUsername.trim(),
        },
        { merge: true }
      );
      setSaveStatus("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveStatus("Failed to update profile.");
    }

    setTimeout(() => setSaveStatus(""), 3000);
  };

  return (
    <div className="edit-profile-container">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        <BackIcon /> Back
      </button>

      {/* 1. Notification Area (Floating above card) */}
      <div className="notification-area">
        {username === "" && !loading && (
          <div className="notification-message">
            <InfoIcon />
            <span>
              Please set your <strong>LeetCode Username</strong> to enable
              leaderboard tracking.
            </span>
          </div>
        )}
        {gfgUsername === "" && !loading && (
          <div className="notification-message">
            <InfoIcon />
            <span>
              Please set your <strong>GeeksforGeeks Username</strong> to enable
              progress syncing.
            </span>
          </div>
        )}
      </div>

      {/* 2. Main Edit Card */}
      <div className="edit-profile-card">
        <div className="card-header">
          <h2>Edit Profile</h2>
          <p>Connect your coding platforms to track progress.</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-group">
            <label htmlFor="leetcode-username">LeetCode Username</label>
            <input
              id="leetcode-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. coding_master"
              disabled={!uid || loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="gfg-username">GeeksforGeeks Username</label>
            <input
              id="gfg-username"
              type="text"
              value={gfgUsername}
              onChange={(e) => setGfgUsername(e.target.value)}
              placeholder="e.g. coding_master"
              disabled={!uid || loading}
            />
            <div className="input-helper">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>
                Visit the <strong>"My Problems"</strong> tab (located next to
                Chat) to understand how GFG tracking works.
              </span>
            </div>
          </div>

          <div className="form-footer">
            <span className="save-status">{saveStatus}</span>
            <button
              type="submit"
              className="save-btn"
              disabled={loading || saveStatus === "Saving..."}
            >
              {loading ? (
                "Loading..."
              ) : (
                <>
                  <SaveIcon /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
