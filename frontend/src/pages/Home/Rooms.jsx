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
    <table className="table-fixed w-full border border-gray-400 border-collapse rounded">
      <thead className="border-b border-gray-400">
        <tr className="h-8 p-2">
          <th className="pl-2 text-left">Room</th>
          <th className="pl-2 text-left">Players</th>
          <th className="pl-2 text-left">Spectators</th>
          <th className="pl-2 text-left">Admin</th>
          <th></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-600">
        {loading && (
          <tr>
            <td colSpan={5} className="w-full text-center p-4 h-16">
              No one is spectating right now
            </td>
          </tr>
        )}
        {!loading && !rooms.length && (
          <tr>
            <td colSpan={5} className="w-full text-center p-4 h-16">
              No active rooms
            </td>
          </tr>
        )}
        {!loading &&
          rooms.length > 0 &&
          rooms.map((room) => (
            <tr key={room.roomId}>
              <td className="p-2 text-left">{room.roomName}</td>
              <td className="p-2 text-left">{room.numPlayers} / 4</td>
              <td className="p-2 text-left">
                {room.numSpectators} / {room.maxSpectators}
              </td>
              <td className="p-2 text-left">{room.adminName}</td>
              <td className="p-2 text-left">
                <button
                  className="btn btn-secondary btn-outline btn-sm mx-auto"
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
