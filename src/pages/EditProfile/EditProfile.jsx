import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import "./EditProfile.css"; // Import the new CSS file

export default function EditProfile() {
  const [uid, setUid] = useState(null);
  const [username, setUsername] = useState(""); //leetcode username
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(""); // To show feedback to the user
  const [gfgUsername, setGfgUsername] = useState(""); //gfg username

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
      setSaveStatus("Username updated successfully!");
    } catch (error) {
      console.error("Error updating username:", error);
      setSaveStatus("Failed to update username.");
    }

    // Hide the message after a few seconds
    setTimeout(() => setSaveStatus(""), 3000);
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <div className="card-header">
          <h2>Edit Profile</h2>
          <p>Set your usernames to track your progress.</p>
        </div>
        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-group">
            <label htmlFor="leetcode-username">LeetCode Username</label>
            <input
              id="leetcode-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., coding_master"
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
              placeholder="e.g., coding_master"
              disabled={!uid || loading}
            />
          </div>

          <div className="form-footer">
            {saveStatus && <span className="save-status">{saveStatus}</span>}
            <button
              type="submit"
              className="save-btn"
              disabled={loading || saveStatus === "Saving..."}
            >
              {loading ? "Loading..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
      <div className="edit-profile-container">
        {/* NEW: Conditional notification message */}
        {username === "" && !loading && (
          <div className="notification-message">
            <p>
              Please enter your LeetCode username to enable LeetCode-related
              features and leaderboard tracking.
            </p>
          </div>
        )}
        {gfgUsername === "" && !loading && (
          <div className="notification-message">
            <p>
              Please enter your GeeksforGeeks username to enable GFG-related
              features and progress tracking.
            </p>
          </div>
        )}

        <div className="edit-profile-card">
          {/* ... (existing card content) ... */}
        </div>
      </div>
    </div>
  );
}
