import { useState, useRef, useEffect } from "react";
import "./GfgInfoBox.css";

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export default function GfgInfoBox({ compact = false }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className={`gfg-info-container ${compact ? "header-toolbar" : ""} ${open ? "is-open" : ""}`}
    >
      <div className="gfg-header" onClick={() => setOpen(!open)}>
        <span>How Sync Works</span>
        <span className={`gfg-arrow ${open ? "open" : ""}`}>
           <ChevronIcon />
        </span>
      </div>

      {open && (
        <div className="gfg-content">
          <div className="sync-section">
            <div className="sync-platform-title">
              <span className="platform-indicator lc-indicator"></span>
              <strong>LeetCode Sync</strong>
            </div>
            <p>
              After solving on <strong>LeetCode</strong>, click{" "}
              <span className="sync-badge lc-badge">Refresh LC</span> to sync your solved problems.
            </p>
          </div>

          <div className="sync-section">
            <div className="sync-platform-title">
              <span className="platform-indicator gfg-indicator"></span>
              <strong>GeeksforGeeks Sync</strong>
            </div>
            <p>
              After solving on <strong>GFG</strong>, click{" "}
              <span className="sync-badge gfg-badge">Refresh GFG</span>. Solved problems will show{" "}
              <span className="sync-badge gfg-completed-badge">Completed</span> — click it to convert to{" "}
              <strong>Solved</strong>.
            </p>
          </div>

          <div className="gfg-tip-box">
            <strong>💡 Pro Tip:</strong>
            <p>
              You can solve <strong>2–3 problems</strong> at a time, then click <strong>Refresh</strong> once.
            </p>
            <p className="sync-cooldown-note">
              (Refreshes are limited to once every 10 mins to prevent API limits).
            </p>
            <p className="sync-username-note">
              Make sure your <strong>LeetCode</strong> & <strong>GFG</strong> usernames are configured in your Profile.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
