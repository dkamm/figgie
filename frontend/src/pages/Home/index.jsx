import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useWSClient } from "contexts/WSContext";
import Rooms from "pages/Home/Rooms";

export const Home = () => {
  const { wsclient, isConnected } = useWSClient();

  const nav = useNavigate();

  const createRoom = useCallback(() => {
    const num = Math.floor(Math.random() * 1000);
    wsclient.send({
      type: "createRoom",
      payload: {
        userName: "user-" + num,
        config: {
          name: "room-" + num,
          maxSpectators: 10,
          public: true,
        },
      },
    });
  }, [wsclient]);

  const handler = useCallback(
    (event) => {
      const message = JSON.parse(event.data);
      const { type, roomId } = message;
      if (type === "roomCreated") {
        nav(`/rooms/${roomId}`);
      }
    },
    [wsclient]
  );

  const onSubmitJoinRoom = useCallback((e) => {
    e.preventDefault();
    const roomCode = e.currentTarget.roomCode.value;
    const name = e.currentTarget.name.value;
    nav(`/rooms/${roomCode}?name=${name}`);
  }, []);

  useEffect(() => {
    if (!isConnected) return;
    wsclient.addMessageHandler(handler);
    return () => wsclient.removeMessageHandler(handler);
  }, [wsclient, isConnected, handler]);

  return (
    <div className="grid grid-cols-4 grid-rows-4 h-screen">
      <div className="row-start-2 row-end-4 col-start-2 col-end-4">
        <Rooms />
      </div>
      <div className="row-start-2 row-end-4 col-start-4">
        {isConnected && (
          <div className="flex flex-col gap-y-4">
            <button className="block" onClick={createRoom}>
              Create
            </button>
            <form className="flex flex-col" onSubmit={onSubmitJoinRoom}>
              <div>
                <input type="text" name="name" placeholder="Name" />
              </div>
              <div>
                <input type="text" name="roomCode" placeholder="Room Code" />
              </div>
              <button className="block" type="submit">
                Join
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
