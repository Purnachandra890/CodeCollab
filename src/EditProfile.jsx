import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import "./EditProfile.css"; // Import the new CSS file

export default function EditProfile() {
  const [uid, setUid] = useState(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(""); // To show feedback to the user

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u ? u.uid : null));
    return unsub;
  }, []);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    const unsub = onSnapshot(doc(db, "users", uid), (snap) => {
      const current = snap.exists() ? snap.data().leetcodeUsername || "" : "";
      setUsername(current); // Always set to the latest from DB
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
            { leetcodeUsername: username.trim() },
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
                <p>Set your LeetCode username to track your progress.</p>
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
                <div className="form-footer">
                    {saveStatus && <span className="save-status">{saveStatus}</span>}
                    <button type="submit" className="save-btn" disabled={!uid || !username.trim() || loading || saveStatus === "Saving..."}>
                        {loading ? "Loading..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}
