const MobileHeader = ({ isMobile, isSidebarOpen, toggleSidebar }) => {
  if (!isMobile) return null;

  return (
    <>
      <button className="mobile-hamburger-btn" onClick={toggleSidebar}>
        ☰
      </button>

      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
    </>
  );
};

export default MobileHeader;
