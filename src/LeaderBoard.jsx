// LeaderBoard.jsx

import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, doc, onSnapshot, getDoc, query } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";
import "./LeaderBoard.css"; // Import the CSS file

// --- Icon Component ---
const LogoIcon = () => (<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" color="#4f46e5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z"></path></svg>);

//  ADDED THE DEFAULT PHOTO CONSTANT HERE 
const defaultPhoto = "https://static.vecteezy.com/system/resources/previews/000/550/731/original/user-icon-vector.jpg";

export default function LeaderBoard() {
  const { roomId } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    if (!roomId) return;

    getDoc(doc(db, "rooms", roomId)).then(docSnap => {
        if(docSnap.exists()) setRoomName(docSnap.data().name);
    });

    const roomRef = doc(db, "rooms", roomId);
    const problemsRef = collection(db, "rooms", roomId, "problems");

    const unsubscribeRoom = onSnapshot(roomRef, (roomSnap) => {
      if (!roomSnap.exists()) return;
      const memberUIDs = roomSnap.data().members || [];

      const unsubscribeProblems = onSnapshot(query(problemsRef), async (problemsSnap) => {
        const totalProblems = problemsSnap.docs.length;
        const userStats = {};

        memberUIDs.forEach((uid) => {
          userStats[uid] = { completed: 0, lastActivity: null };
        });

        problemsSnap.docs.forEach((problemDoc) => {
          const problem = problemDoc.data();
          if (!problem.completedBy) return;
          Object.entries(problem.completedBy).forEach(([uid, timestamp]) => {
            if (!userStats[uid]) return;
            userStats[uid].completed += 1;
            const activityDate = timestamp?.toDate ? timestamp.toDate() : null;
            if (!userStats[uid].lastActivity || activityDate > userStats[uid].lastActivity) {
              userStats[uid].lastActivity = activityDate;
            }
          });
        });

        const finalData = await Promise.all(
          Object.entries(userStats).map(async ([uid, stats]) => {
            const userSnap = await getDoc(doc(db, "users", uid));
            const userData = userSnap.exists() ? userSnap.data() : {};
            return {
              uid,
              username: userData.name || "Unknown",
              // 👇 UPDATED THIS LINE TO USE YOUR DEFAULT PHOTO 👇
              photoURL: userData.photoURL || defaultPhoto,
              completed: stats.completed,
              lastActivity: stats.lastActivity,
              completionPercentage: totalProblems > 0 ? (stats.completed / totalProblems) * 100 : 0,
            };
          })
        );

        finalData.sort((a, b) => {
            if (b.completed !== a.completed) return b.completed - a.completed;
            return a.lastActivity - b.lastActivity;
        });
        
        const rankedData = finalData.map((user, index) => ({ ...user, rank: index + 1, }));
        setLeaderboard(rankedData);
      });
      return () => unsubscribeProblems();
    });
    return () => unsubscribeRoom();
  }, [roomId]);
  
  const formatDate = (date) => {
      if (!date) return "No Activity";
      return new Intl.DateTimeFormat('en-US', {
          year: 'numeric', month: 'numeric', day: 'numeric',
          hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true
      }).format(date);
  }

  const topThree = leaderboard.slice(0, 3);
  const restOfBoard = leaderboard.slice(3);
  
  const podiumOrder = [topThree.find(p => p.rank === 2), topThree.find(p => p.rank === 1), topThree.find(p => p.rank === 3)].filter(Boolean);

  return (
    <div className="leaderboard-container">
      <section className="podium">
        {podiumOrder.map(player => (
            <div key={player.uid} className={`podium-card rank-${player.rank}`}>
                <span className="podium-rank">{player.rank}</span>
                <img 
                  src={player.photoURL} 
                  alt={player.username} 
                  className="podium-avatar"
                  // 👇 ADDED ONERROR HANDLER FOR ROBUSTNESS 👇
                  onError={(e) => { e.target.onerror = null; e.target.src = defaultPhoto; }}
                />
                <h3 className="podium-name">{player.username}</h3>
                <p className="podium-problems">{player.completed} Problems</p>
            </div>
        ))}
      </section>

      <section className="leaderboard-table-card">
        <table className="leaderboard-table">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>User</th>
                    <th>Problems Solved</th>
                    <th>Completion</th>
                    <th>Last Activity</th>
                </tr>
            </thead>
            <tbody>
                {restOfBoard.map(player => (
                    <tr key={player.uid}>
                        <td><span className="rank-number">{player.rank}</span></td>
                        <td>
                            <div className="user-cell">
                                <img 
                                  src={player.photoURL} 
                                  alt={player.username} 
                                  className="user-avatar-table"
                                  // 👇 ADDED ONERROR HANDLER FOR ROBUSTNESS 👇
                                  onError={(e) => { e.target.onerror = null; e.target.src = defaultPhoto; }}
                                />
                                <div>
                                    <span className="user-name">{player.username}</span>
                                    <span className="user-id">{player.uid.substring(0, 6).toUpperCase()}</span>
                                </div>
                            </div>
                        </td>
                        <td>{player.completed}</td>
                        <td>
                            <div className="completion-cell">
                                <div className="completion-bar-container">
                                    <div className="completion-bar-fill" style={{width: `${player.completionPercentage}%`}}></div>
                                </div>
                                <span>{Math.round(player.completionPercentage)}%</span>
                            </div>
                        </td>
                        <td>{formatDate(player.lastActivity)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </section>
    </div>
  );
}