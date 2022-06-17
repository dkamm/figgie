import React, { useCallback, useEffect, useReducer, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useWSClient } from "contexts/WSContext";
import { roomReducer, initialState } from "reducers/room";
import { ActivityLog } from "pages/Room/ActivityLog";
import { Input } from "pages/Room/Input";
import { Seats } from "pages/Room/Seats";

export const Room = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name") || "";

  const { wsclient, isConnected } = useWSClient();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState(null);

  const [{ userId, users, activityEvents, seats, spectators }, dispatch] =
    useReducer(roomReducer, initialState);

  const send = useCallback(
    (type, payload) => {
      wsclient.send({
        type,
        roomId,
        payload,
      });
    },
    [roomId]
  );

  const handler = useCallback(
    (event) => {
      const message = JSON.parse(event.data);

      const { type, payload } = message;

      switch (type) {
        case "joinFailed":
          setLoading(false);
          setFailure(payload.reason);
          break;
        case "joinedRoom":
          setLoading(false);
          dispatch({ type, payload });
          break;
        case "leftRoom":
          dispatch({ type, payload });
          navigate("/");
          break;
        case "userJoined":
        case "userLeft":
        case "userMessaged":
        case "userChangedName":
        case "userTookSeat":
        case "userStartedSpectating":
          dispatch({ type, payload });
          break;
        default:
          console.error("invalid message type", type);
      }
    },
    [setFailure, setLoading]
  );

  const joinRoom = useCallback(
    (name) => {
      send("joinRoom", { name });
    },
    [send]
  );

  const sendMessage = useCallback(
    (message) => {
      send("sendMessage", { message });
    },
    [send]
  );

  const changeName = useCallback(
    (name) => {
      send("changeName", { name });
    },
    [send]
  );

  const takeSeat = useCallback(
    (seat) => {
      send("takeSeat", { seat });
    },
    [send]
  );

  const startSpectating = useCallback(() => {
    send("startSpectating", {});
  }, [send]);

  //const leaveRoom = useCallback(() => {
  //    send("leaveRoom", null)
  //}, [send])

  useEffect(() => {
    if (!isConnected) return;
    wsclient.addMessageHandler(handler);
    joinRoom(name);
    return () => wsclient.removeMessageHandler(handler);
  }, [wsclient, handler, isConnected, joinRoom, name]);

  const onInputSubmit = useCallback(
    (message) => {
      sendMessage(message);
    },
    [sendMessage]
  );

  const isAdmin = userId && users.byId[userId].admin;
  const isSpectating = userId && spectators.find((s) => s === userId);

  return (
    <div className="grid grid-cols-4 grid-rows-4 h-screen">
      {loading && (
        <div className="row-start-2 row-end-4 col-start-2 col-end-4">
          Loading...
        </div>
      )}
      {!loading && failure && (
        <div className="row-start-2 row-end-4 col-start-2 col-end-4">
          {failure}
        </div>
      )}
      {!loading && !failure && (
        <div className="row-span-full col-start-2 col-end-4">
          <div>
            <div>
              <strong>Seats</strong>
            </div>
            <Seats
              userId={userId}
              seats={seats}
              spectators={spectators}
              users={users}
              takeSeat={takeSeat}
              changeName={changeName}
              isAdmin={isAdmin}
            />
            {!isSpectating && (
              <button onClick={startSpectating}>Spectate</button>
            )}
          </div>
          <div>
            <div className="flex-grow overflow-scroll">
              <ActivityLog users={users} activityEvents={activityEvents} />
            </div>
            <Input onSubmit={onInputSubmit} />
          </div>
        </div>
      )}
    </div>
  );
};
