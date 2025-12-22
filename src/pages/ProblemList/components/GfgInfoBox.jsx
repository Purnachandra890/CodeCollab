import { useState } from "react";
import "./GfgInfoBox.css";

export default function GfgInfoBox() {
  const [open, setOpen] = useState(false);

  return (
    <div className="gfg-fixed-box">
      <div className="gfg-header" onClick={() => setOpen(!open)}>
        <span>GFG Working</span>
        <span className={`gfg-arrow ${open ? "open" : ""}`}>➤</span>
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

          {/* 💡 NEW TIP */}
          <div className="gfg-tip-box">
            <strong>💡 Tip:</strong>
            <p>
              You can solve <strong>2–3 problems (or more)</strong> at a time on
              GFG and then click <strong>Refresh GFG Data</strong> once.
            </p>
            <p>
              This avoids unnecessary waiting, since refresh is limited to
              once every 30 minutes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
