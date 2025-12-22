// components/ReportBugButton.jsx
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
      Report Bug
    </button>
  );
};

export default ReportBugButton;
