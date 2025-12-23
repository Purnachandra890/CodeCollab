// SidebarFooter.jsx
import EditProfileButton from "./EditProfileButton";
import ReportBugButton from "./ReportBugButton";

const SidebarFooter = ({ isLeetcodeMissing, isGfgMissing }) => {
  return (
    <div className="sidebar-footer">
      <EditProfileButton
        isLeetcodeMissing={isLeetcodeMissing}
        isGfgMissing={isGfgMissing}
      />

      <ReportBugButton />
    </div>
  );
};

export default SidebarFooter;
