import React, { useCallback, useEffect, useReducer, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWSClient } from "contexts/WSContext";
import { roomReducer, initialState } from "reducers/room";
import { ActivityLog } from "pages/Room/ActivityLog";
import { Input } from "pages/Room/Input";
import { Avatar } from "components/Avatar";

export const Room = () => {
  const { roomId } = useParams();

  const { wsclient, isConnected } = useWSClient();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState(null);

  const [{ userId, users, activityEvents }, dispatch] = useReducer(
    roomReducer,
    initialState
  );

  const send = useCallback(
    (type, payload) => {
      wsclient.send(
        JSON.stringify({
          type,
          roomId,
          payload,
        })
      );
    },
    [wsclient, roomId]
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

  //const leaveRoom = useCallback(() => {
  //    send("leaveRoom", null)
  //}, [send])

  useEffect(() => {
    if (!isConnected) return;
    wsclient.addMessageHandler(handler);
    joinRoom("");
    return () => wsclient.removeMessageHandler(handler);
  }, [wsclient, handler, isConnected, joinRoom]);

  const onInputSubmit = useCallback(
    (message) => {
      sendMessage(message);
    },
    [sendMessage]
  );

  const activeUserIds = users.allIds.filter((id) => !users.byId[id].left);

  return (
    <div>
      {loading && <div>Loading...</div>}
      {!loading && failure && <div>{failure}</div>}
      {!loading && !failure && (
        <>
          <div>
            <div>
              <strong>Users</strong>
            </div>
            {activeUserIds.map((id) => (
              <div key={id}>
                <Avatar user={users.byId[id]} />{" "}
                {userId === id && <span>(You)</span>}
              </div>
            ))}
          </div>
          <br />
          <div>Chat</div>
          <ActivityLog users={users} activityEvents={activityEvents} />
          <br />
          <Input onSubmit={onInputSubmit} />
        </>
      )}
    </div>
  );
};
