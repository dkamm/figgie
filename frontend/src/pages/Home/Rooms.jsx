import React, { useState, useCallback, useEffect } from "react";
import { useWSClient } from "contexts/WSContext";
import { useNavigate } from "react-router-dom";

export const Rooms = () => {
  const { wsclient, isConnected } = useWSClient();

  const [rooms, setRooms] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const atLastPage = page >= Math.floor(total / pageSize);

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
      const { type, data, total } = message;
      if (type === "roomsListed") {
        setRooms(data);
        setTotal(total);
        setLoading(false);
      }
    },
    [wsclient, setRooms, setTotal, setLoading]
  );

  const listRooms = useCallback(
    (page, pageSize) => {
      setLoading(true);
      setPage(page);
      send("listRooms", { page, pageSize });
    },
    [send, setLoading, setPage]
  );

  useEffect(() => {
    if (!isConnected) return;
    wsclient.addMessageHandler(handler);
    listRooms(0, 10);
    setLoading(false);
    return () => wsclient.removeMessageHandler(handler);
  }, [wsclient, handler, listRooms, setLoading, isConnected]);

  const join = useCallback((roomId) => {
    nav(`/rooms/${roomId}`);
  }, []);

  return (
    <>
      <table className="table-fixed h-full w-full border border-gray-400 border-collapse rounded">
        <thead className="border-b border-gray-400">
          <tr className="h-8 p-2">
            <th className="pl-2 text-left">Room</th>
            <th className="pl-2 text-left">Players</th>
            <th className="pl-2 text-left">Spectators</th>
            <th className="pl-2 text-left">Admin</th>
            <th className="w-20"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-600">
          {loading && (
            <tr>
              <td colSpan={5} className="text-center p-4">
                <button className="btn btn-square loading w-16 h-16" />
              </td>
            </tr>
          )}
          {!loading && !rooms.length && page === 0 && (
            <tr>
              <td colSpan={5} className="text-center p-4">
                There are no active rooms right now.
              </td>
            </tr>
          )}
          {!loading && !rooms.length && page > 0 && (
            <tr>
              <td colSpan={5} className="text-center p-4">
                There are no longer rooms on this page. Go back.
              </td>
            </tr>
          )}
          {!loading &&
            rooms.length > 0 &&
            rooms.map((room) => (
              <tr key={room.roomId}>
                <td className="pl-2 text-left">{room.roomName}</td>
                <td className="pl-2 text-left">{room.numPlayers} / 4</td>
                <td className="pl-2 text-left">
                  {room.numSpectators} / {room.maxSpectators}
                </td>
                <td className="pl-2 text-left">{room.adminName}</td>
                <td className="text-center">
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
          {!loading &&
            rooms.length > 0 &&
            rooms.length < pageSize &&
            new Array(pageSize - rooms.length).fill(0).map((_, i) => (
              <tr key={i}>
                <td colSpan={5} className="text-center">
                  <button
                    className="btn btn-secondary btn-outline btn-sm mx-auto"
                    disabled={true}
                  >
                    Empty
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="w-full flex justify-end mt-4">
        <div className="btn-group">
          <button
            className="btn"
            disabled={page === 0}
            onClick={() => {
              listRooms(page - 1, pageSize);
            }}
          >
            «
          </button>
          <button className="btn">{page + 1}</button>
          <button
            className="btn"
            disabled={atLastPage}
            onClick={() => {
              listRooms(page + 1, pageSize);
            }}
          >
            »
          </button>
        </div>
      </div>
    </>
  );
};

export default Rooms;
