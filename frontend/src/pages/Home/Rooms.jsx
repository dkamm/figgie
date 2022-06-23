import React, { useState, useCallback, useEffect } from "react";
import { useWSClient } from "contexts/WSContext";
import { useNavigate } from "react-router-dom";

export const Rooms = () => {
  const { wsclient, isConnected } = useWSClient();

  const [rooms, setRooms] = useState([]);
  const [page] = useState(0);
  const [pageSize] = useState(20);

  const nav = useNavigate();

  const [loading, setLoading] = useState(true);

  const send = useCallback(
    (type, payload) => {
      wsclient.send({
        type,
        payload,
      });
    },
    [wsclient]
  );

  const handler = useCallback(
    (message) => {
      const { type, data } = message;
      if (type === "roomsListed") {
        setRooms(data);
      }
    },
    [wsclient, setRooms]
  );

  const listRooms = useCallback(
    (page, pageSize) => {
      send("listRooms", { page, pageSize });
    },
    [send]
  );

  useEffect(() => {
    if (!isConnected) return;
    wsclient.addMessageHandler(handler);
    listRooms(0, 20);
    setLoading(false);
    return () => wsclient.removeMessageHandler(handler);
  }, [wsclient, handler, listRooms, setLoading, isConnected]);

  useEffect(() => {}, [page, pageSize]);

  const join = useCallback((roomId) => {
    nav(`/rooms/${roomId}`);
  }, []);

  return (
    <table className="w-full text-left">
      <thead>
        <tr>
          <th>Name</th>
          <th>Spectators</th>
          <th>Admin</th>
          <th>Join</th>
        </tr>
      </thead>
      <tbody>
        {loading && <tr>Loading...</tr>}
        {!loading && !rooms.length && <div>No active rooms</div>}
        {!loading &&
          rooms.length > 0 &&
          rooms.map((room) => (
            <tr key={room.roomId}>
              <td>{room.roomName}</td>
              <td>
                {room.numSpectators} / {room.maxSpectators}
              </td>
              <td>{room.adminName}</td>
              <td>
                <button
                  onClick={() => {
                    join(room.roomId);
                  }}
                >
                  Join
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default Rooms;
