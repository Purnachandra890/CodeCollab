import React from "react";
import GfgInfoBox from "./GfgInfoBox";
import "./PlatformRefreshActions.css";

export default function PlatformRefreshActions({
  variant = "default",
  showGfgInfo = true,
  showUsernameHints = false,
  leetcodeUsername,
  gfgUsername,
  loadingLeetcode,
  canRefreshLeetcode,
  nextLeetcodeRefreshIn,
  refreshLeetcode,
  loadingGfg,
  canRefreshGfg,
  nextGfgRefreshIn,
  refreshGfg,
  formatTime,
  className = "",
}) {
  const isHeader = variant === "header";
  const leetcodeLabel = isHeader ? "Refresh LC" : "Refresh LeetCode Data";
  const gfgLabel = isHeader ? "Refresh GFG" : "Refresh GFG Data";

  return (
    <>
      <div
        className={`platform-refresh-actions ${isHeader ? "header-toolbar" : ""} ${className}`.trim()}
      >
        {showGfgInfo && <GfgInfoBox compact={isHeader} />}
        <div className="refresh-buttons-row">
          <div className="gfg-refresh-bar">
            <button
              type="button"
              className={`refresh-btn refresh-btn-leetcode ${!canRefreshLeetcode ? "disabled" : ""}`}
              disabled={!canRefreshLeetcode || loadingLeetcode || !leetcodeUsername}
              onClick={refreshLeetcode}
              title={
                !leetcodeUsername
                  ? "Please set your LeetCode username in Profile"
                  : !canRefreshLeetcode && nextLeetcodeRefreshIn != null
                  ? `Available in ${formatTime(nextLeetcodeRefreshIn)}`
                  : "Refresh LeetCode Data"
              }
            >
              {loadingLeetcode
                ? (isHeader ? "Refreshing..." : "Refreshing LeetCode...")
                : !canRefreshLeetcode && nextLeetcodeRefreshIn != null
                ? `${leetcodeLabel} (${formatTime(nextLeetcodeRefreshIn)})`
                : leetcodeLabel}
            </button>
          </div>
          <div className="gfg-refresh-bar">
            <button
              type="button"
              className={`refresh-btn refresh-btn-gfg ${!canRefreshGfg ? "disabled" : ""}`}
              disabled={!canRefreshGfg || loadingGfg || !gfgUsername}
              onClick={refreshGfg}
              title={
                !gfgUsername
                  ? "Please set your GeeksforGeeks username in Profile"
                  : !canRefreshGfg && nextGfgRefreshIn != null
                  ? `Available in ${formatTime(nextGfgRefreshIn)}`
                  : "Refresh GFG Data"
              }
            >
              {loadingGfg
                ? (isHeader ? "Refreshing..." : "Refreshing GFG...")
                : !canRefreshGfg && nextGfgRefreshIn != null
                ? `${gfgLabel} (${formatTime(nextGfgRefreshIn)})`
                : gfgLabel}
            </button>
          </div>
        </div>
      </div>

      {showUsernameHints && !leetcodeUsername && (
        <div className="platform-refresh-hint">
          <p>
            Please enter your LeetCode username in Profile to enable LeetCode sync on
            refresh.
          </p>
        </div>
      )}
      {showUsernameHints && !gfgUsername && (
        <div className="platform-refresh-hint">
          <p>
            Please enter your GeeksforGeeks username in Profile to enable GFG detection
            on refresh.
          </p>
        </div>
      )}
    </>
  );
}
