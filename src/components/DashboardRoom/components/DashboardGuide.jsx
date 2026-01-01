import React, { useState } from "react";
import { 
  PlusCircle, Code2, UserCircle, Share2, Users, FilePlus, ChevronDown, Sparkles 
} from "lucide-react";
import "./DashboardGuide.css";

// Guide Data (Kept separate for cleanliness)
const guideData = [
  {
    id: 1,
    title: "How to create a room",
    icon: <PlusCircle size={18} />,
    content: [
      "Click 'Create New Room' in the sidebar.",
      "Enter a room name (e.g., 'Arrays 101').",
      "You automatically become the Admin.",
    ]
  },
  {
    id: 2,
    title: "How automation works",
    icon: <Code2 size={18} />,
    content: [
      "We track LeetCode & GFG progress.",
      "Solve on their site -> We fetch it here.",
      "Leaderboards update automatically.",
    ]
  },
  {
    id: 3,
    title: "Why usernames are required",
    icon: <UserCircle size={18} />,
    content: [
      "Needed to fetch public solved stats.",
      "No passwords required. 100% Secure.",
      "Used strictly for leaderboard data.",
    ]
  },
  {
    id: 4,
    title: "Inviting friends",
    icon: <Share2 size={18} />,
    content: [
      "Click 'Invite' inside any room.",
      "Send requests to your friends",
      "They will receive invites on their dashboard.",
    ]
  },
  {
    id: 5,
    title: "Building friend list",
    icon: <Users size={18} />,
    content: [
      "Go to 'Members' tab in a room.",
      "Send requests to active coders.",
      "Invite friends easily to future rooms.",
    ]
  },
  {
    id: 6,
    title: "Adding problems",
    icon: <FilePlus size={18} />,
    content: [
      "Go to 'Problems' tab in your room.",
      "Click 'Add Problem' & paste URL.",
      "Supports LeetCode & GeeksForGeeks.",
    ]
  },
];

const GuideItem = ({ item, isOpen, onClick }) => {
  return (
    <div className={`guide-card ${isOpen ? "active" : ""}`}>
      <div className="guide-header" onClick={onClick}>
        <div className="guide-title-group">
          <span className="icon-wrapper">{item.icon}</span>
          <h4>{item.title}</h4>
        </div>
        <span className={`guide-arrow ${isOpen ? "open" : ""}`}>
          <ChevronDown size={16} />
        </span>
      </div>
      
      <div className={`guide-content-wrapper ${isOpen ? "expanded" : ""}`}>
        <div className="guide-content">
          <ul>
            {item.content.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Accept 'user' as a prop here
const DashboardGuide = ({ user }) => {
  const [openId, setOpenId] = useState(null);

  const toggleItem = (id) => {
    setOpenId(openId === id ? null : id);
  };

  const defaultPhoto = "https://static.vecteezy.com/system/resources/previews/000/550/731/original/user-icon-vector.jpg";
  const userName = user?.name || user?.displayName || "User";

  return (
    <div className="dashboard-guide-wrapper">
      
      {/* Updated Welcome Banner with Profile */}
      <div className="welcome-banner">
        
        {/* Left Side: Text */}
        <div className="banner-content">
          <h2><Sparkles className="sparkle-icon" size={20} /> Welcome to CodeCollab</h2>
          <p>Follow this quick guide to start competing and collaborating.</p>
        </div>

        {/* Right Side: User Profile */}
        <div className="banner-profile">
          <img
            src={user?.photoURL || defaultPhoto}
            alt="User"
            onError={(e) => (e.target.src = defaultPhoto)}
          />
          <div className="banner-user-info">
            <strong>{userName}</strong>
            <span>{user?.email}</span>
          </div>
        </div>

      </div>

      <div className="guide-grid">
        {guideData.map((item) => (
          <GuideItem 
            key={item.id} 
            item={item} 
            isOpen={openId === item.id} 
            onClick={() => toggleItem(item.id)} 
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardGuide;