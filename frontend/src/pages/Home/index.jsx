import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useWSClient } from "contexts/WSContext";
import Rooms from "pages/Home/Rooms";

export const Home = () => {
  const { wsclient, isConnected } = useWSClient();

  const nav = useNavigate();

  const [userName, setUserName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [maxSpectators, setMaxSpectators] = useState(4);
  const [privateRoom, setPrivateRoom] = useState(false);

  const createRoom = useCallback(
    (userName, roomName, maxSpectators, privateRoom) => {
      wsclient.send({
        type: "createRoom",
        payload: {
          userName: userName,
          config: {
            name: roomName,
            maxSpectators: maxSpectators,
            private: privateRoom,
            gameTime: 60,
          },
        },
      });
    },
    [wsclient]
  );

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
    <div className="h-[calc(100vh_-_7rem)] grid grid-cols-4 grid-rows-6 gap-x-8">
      <div className="row-start-2 row-span-4 col-start-2 col-span-2">
        <Rooms />
      </div>
      <div className="row-start-2 row-span-2 col-start-4">
        {isConnected && (
          <div className="flex flex-col gap-y-4">
            <label
              htmlFor="create-room-modal"
              className="btn btn-primary modal-button text-center"
            >
              Create New Room
            </label>
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
                minLength={1}
                maxLength={16}
              />
              <input
                className="block input input-bordered"
                type="text"
                name="roomCode"
                placeholder="Room Code"
                minLength={6}
                maxLength={6}
              />
              <button className="block btn btn-primary" type="submit">
                Join Room
              </button>
            </form>
          </div>
        )}
      </div>
      <input type="checkbox" id="create-room-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <label
            htmlFor="create-room-modal"
            className="btn btn-sm btn-circle absolute right-2 top-2"
          >
            ✕
          </label>
          <form>
            <div className="form-control mt-4">
              <label>
                <span className="label-text">User Name</span>
              </label>
              <input
                className="input input-bordered flex-grow"
                type="text"
                name="userName"
                autoComplete="off"
                maxLength={16}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="form-control mt-4">
              <label>
                <span className="label-text">Room Name</span>
              </label>
              <input
                className="input input-bordered flex-grow"
                type="text"
                name="roomName"
                autoComplete="off"
                maxLength={32}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </div>
            <div className="form-control mt-4 w-48">
              <label className="label">
                <span className="label-text">Max Spectators</span>
                <input
                  type="number"
                  className="input input-bordered"
                  min={0}
                  max={10}
                  value={maxSpectators}
                  onChange={(e) => setMaxSpectators(parseInt(e.target.value))}
                />
              </label>
            </div>
            <div className="form-control mt-4 w-32">
              <label className="label cursor-pointer">
                <span className="label-text">Private?</span>
                <input
                  type="checkbox"
                  className="toggle"
                  checked={privateRoom}
                  onChange={() => setPrivateRoom(!privateRoom)}
                />
              </label>
            </div>
            <div className="modal-action">
              <label
                htmlFor="create-room-modal"
                className="btn btn-primary"
                disabled={!userName.length || !roomName.length}
                onClick={() => {
                  createRoom(userName, roomName, maxSpectators, privateRoom);
                }}
              >
                Create
              </label>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
