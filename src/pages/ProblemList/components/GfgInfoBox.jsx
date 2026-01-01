import { useState } from "react";
import "./GfgInfoBox.css";

// Optional: Chevron Icon for a cleaner look than "➤"
const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export default function GfgInfoBox() {
  const [open, setOpen] = useState(false);

  return (
    // Added conditional class 'is-open' for styling hooks
    <div className={`gfg-fixed-box ${open ? "is-open" : ""}`}>
      <div className="gfg-header" onClick={() => setOpen(!open)}>
        <span>GFG Working</span>
        <span className={`gfg-arrow ${open ? "open" : ""}`}>
           <ChevronIcon />
        </span>
      </div>

      {open && (
        <div className="gfg-content">
          <p>
            After solving a problem on <strong>GeeksforGeeks</strong>, your
            progress may not update immediately.
          </p>

          <p>
            Please click the <strong>“Refresh GFG Data”</strong> button to sync
            your solved problems.
          </p>

          {/* 💡 TIP BOX */}
          <div className="gfg-tip-box">
            <strong>💡 Pro Tip:</strong>
            <p>
              You can solve <strong>2–3 problems</strong> at a time on
              GFG, then click <strong>Refresh</strong> once.
            </p>
            <p style={{ marginTop: '8px', fontSize: '0.75rem', opacity: 0.7 }}>
              (Refresh is limited to once every 30 mins to prevent API limits).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}