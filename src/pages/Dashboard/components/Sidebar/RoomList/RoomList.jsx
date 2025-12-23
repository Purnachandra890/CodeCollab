const RoomList = ({ userRooms, currentRoomId, handleNavigate }) => {
  return (
    <nav className="your-rooms-section">
      <h2>YOUR ROOMS</h2>

      <ul className="room-list">
        {userRooms.map((room) => (
          <li
            key={room.id}
            onClick={() =>
              handleNavigate(`/dashboard/room/${room.id}`)
            }
            className={room.id === currentRoomId ? "active-room" : ""}
          >
            {room.name}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default RoomList;
