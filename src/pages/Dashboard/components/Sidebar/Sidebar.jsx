// Sidebar.jsx
import RoomList from "./RoomList/RoomList";
import SidebarFooter from "./SidebarFooter/SidebarFooter";
const Sidebar = ({
  isSidebarOpen,
  toggleSidebar,
  userRooms,
  currentRoomId,
  handleNavigate,
  hasNewInvites,
  isLeetcodeMissing,
  isGfgMissing,
  onCreateRoom,
}) => {
  const LogoIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z" />
    </svg>
  );
  return (
    <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <span className="logo">
          <LogoIcon />
        </span>

        {isSidebarOpen && (
          <div className="dashboard-title-container">
            <h1 onClick={() => handleNavigate("/dashboard/rooms")}>
              Dashboard
            </h1>

            {hasNewInvites && (
              <span className="dashboard-invite-badge">Invites</span>
            )}
          </div>
        )}

        <button className="hamburger-btn" onClick={toggleSidebar}>
          ☰
        </button>
      </div>

      {isSidebarOpen && (
        <>
          <button className="create-room-btn" onClick={onCreateRoom}>
            + Create New Room
          </button>

          <RoomList
            userRooms={userRooms}
            currentRoomId={currentRoomId}
            handleNavigate={handleNavigate}
          />

          <SidebarFooter
            isLeetcodeMissing={isLeetcodeMissing}
            isGfgMissing={isGfgMissing}
          />
        </>
      )}
    </aside>
  );
};

export default Sidebar;
