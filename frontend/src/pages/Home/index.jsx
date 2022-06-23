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
          gameTime: 30,
        },
      },
    });
  }, [wsclient]);

  const handler = useCallback(
    (message) => {
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
    <div className="grid grid-cols-4 grid-rows-4 gap-x-8">
      <div className="row-start-2 row-end-4 col-start-2 col-end-4">
        <Rooms />
      </div>
      <div className="row-start-2 row-end-4 col-start-4">
        {isConnected && (
          <div className="flex flex-col gap-y-4">
            <button className="btn btn-primary block" onClick={createRoom}>
              Create New Room
            </button>
            <form
              className="flex flex-col gap-y-2 mt-16"
              onSubmit={onSubmitJoinRoom}
              autoComplete="off"
            >
              <input
                className="block input input-bordered"
                type="text"
                name="name"
                placeholder="Name"
              />
              <input
                className="block input input-bordered"
                type="text"
                name="roomCode"
                placeholder="Room Code"
              />
              <button className="block btn btn-primary" type="submit">
                Join Room
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
