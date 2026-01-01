import React from "react";

const ReportBugButton = () => {
  const handleReportBug = () => {
    const recipientEmail = "purnachandra.n17@gmail.com";
    const subject = "Bug Report: Code Collab Application";
    const body = `
Hello Support Team,
I'd like to report a bug.

- Description of Bug:
[Please describe the issue here]

- Steps to Reproduce:
1.
2.
3.

Thank you.
    `;

    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body.trim())}`;

    window.location.href = mailtoLink;
  };

  return (
    <button className="sidebar-btn" onClick={handleReportBug}>
      {/* Bug Icon */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
        <path d="M12 8v-2"></path>
        <path d="M12 16v2"></path>
        <path d="M8.5 10L6.5 8.5"></path>
        <path d="M15.5 10l2-1.5"></path>
        <path d="M8.5 14L6.5 15.5"></path>
        <path d="M15.5 14l2 1.5"></path>
      </svg>
      <span>Report Bug</span>
    </button>
  );
};

export default ReportBugButton;