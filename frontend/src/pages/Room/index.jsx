import React, { useCallback, useEffect, useReducer, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useWSClient } from "contexts/WSContext";
import { roomReducer, initialState } from "reducers/room";
import Users from "pages/Room/Users";
import Game from "pages/Room/Game";
import GameSummary from "pages/Room/GameSummary";
import GameEvents from "pages/Room/GameEvents";
import Chat from "pages/Room/Chat";

import ClickSound from "assets/click.wav";
import CashRegisterSound from "assets/cashregister.wav";

const clickSound = new Audio(ClickSound);
const cashRegisterSound = new Audio(CashRegisterSound);

export const Room = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name") || "";

  const { wsclient, isConnected } = useWSClient();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState(null);

  const [
    { userId, users, activityEvents, seats, spectators, game, config },
    dispatch,
  ] = useReducer(roomReducer, initialState);

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
    (message) => {
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
        case "orderAdded":
          clickSound.play();
          dispatch({ type, payload });
          break;
        case "orderTraded":
          cashRegisterSound.play();
          dispatch({ type, payload });
          break;
        case "userJoined":
        case "userLeft":
        case "userMessaged":
        case "userChangedName":
        case "userTookSeat":
        case "userStartedSpectating":
        case "userPromoted":
        case "userKicked":
        case "gameStarted":
        case "gameEnded":
        case "botAdded":
        case "botRemoved":
          dispatch({ type, payload });
          break;
        case "orderRejected":
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

  const startSpectating = useCallback(
    (seat) => {
      send("startSpectating", { seat });
    },
    [send]
  );

  const startGame = useCallback(() => {
    send("startGame", {});
  }, [send]);

  const promoteUser = useCallback(
    (userId) => {
      send("promoteUser", { userId });
    },
    [send]
  );

  const kickUser = useCallback(
    (userId) => {
      send("kickUser", { userId });
    },
    [send]
  );

  const leaveRoom = useCallback(
    (disconnectAllClients) => {
      send("leaveRoom", { disconnectAllClients });
    },
    [send]
  );

  const addBot = useCallback(
    (seat) => {
      send("addBot", { seat });
    },
    [send]
  );

  const removeBot = useCallback(
    (userId) => {
      send("removeBot", { userId });
    },
    [send]
  );

  useEffect(() => {
    if (!isConnected) return;
    wsclient.addMessageHandler(handler);
    joinRoom(name);
    return () => {
      wsclient.removeMessageHandler(handler);
      // We send an extra message here if user leaves room and disconnects all clients, but I'm not going to worry about it right now
      leaveRoom(false);
    };
  }, [wsclient, handler, isConnected, joinRoom, leaveRoom, name]);

  const isAdmin = userId && users.byId[userId].admin;
  const playerId =
    userId && game && game.players.findIndex((p) => p === userId);
  const isPlaying = playerId !== -1;
  const inGame = game && !game.done;
  const kicked = userId && users.byId[userId].left;

  if (kicked) {
    wsclient.removeMessageHandler(handler);
  }

  return (
    <div className="h-[calc(100vh_-_7rem)] grid grid-cols-8 grid-rows-2 gap-x-4">
      {loading && (
        <div className="row-start-1 row-span-1 col-start-2 col-end-4">
          Loading...
        </div>
      )}
      {!loading && failure && (
        <div className="row-start-1 row-span-1 col-start-2 col-end-4">
          {failure}
        </div>
      )}
      {!loading && !failure && (
        <>
          <div className="row-start-1 row-span-full col-start-3 col-span-4 flex flex-col justify-between">
            <div className="flex flex-col gap-x-2">
              <div className="py-2 flex justify-between">
                <div>
                  <strong>Room Name:</strong> {config.name}{" "}
                  {config.private && "🔒"}
                </div>
                <div>
                  <strong>Room Code:</strong> {roomId}
                </div>
              </div>{" "}
              {!inGame && (
                <>
                  {game && <GameSummary game={game} users={users} />}
                  {!game && <div className="py-16">No games played yet</div>}
                  {isAdmin && (
                    <button
                      className="btn btn-accent mt-4 w-48"
                      onClick={startGame}
                    >
                      Start New Game
                    </button>
                  )}
                  {!isAdmin && (
                    <div className="mt-4">
                      Waiting for admin to start game...
                    </div>
                  )}
                </>
              )}
              {inGame && (
                <>
                  <Game
                    game={game}
                    users={users}
                    config={config}
                    playerId={playerId}
                    players={game.players}
                    hands={game.hands}
                    earnings={game.earnings}
                    send={send}
                    wsclient={wsclient}
                    isConnected={isConnected}
                  />
                </>
              )}
            </div>
            <div className="flex justify-end gap-x-2">
              <button className="btn btn-sm btn-outline" onClick={() => {}}>
                Keyboard Inputs
              </button>
              <button
                className="btn btn-sm btn-error"
                disabled={inGame}
                onClick={() => {
                  leaveRoom(true);
                  navigate("/");
                }}
              >
                Leave Room
              </button>
            </div>
          </div>
          <div className="col-start-1 col-span-2 row-start-1 row-span-1 min-h-0">
            <Users
              userId={userId}
              seats={seats}
              spectators={spectators}
              users={users}
              takeSeat={takeSeat}
              startSpectating={startSpectating}
              changeName={changeName}
              promoteUser={promoteUser}
              addBot={addBot}
              kickUser={kickUser}
              removeBot={removeBot}
              isAdmin={isAdmin}
              inGame={inGame}
              maxSpectators={config.maxSpectators}
            />
          </div>
          <div className="col-start-1 col-span-2 row-start-2 row-span-1 min-h-0">
            <GameEvents
              users={users}
              events={game ? game.events : []}
              players={game ? game.players : []}
            />
          </div>
          <div className="col-start-7 col-span-2 row-start-1 row-span-full">
            <Chat
              users={users}
              activityEvents={activityEvents}
              send={send}
              disabled={inGame && isPlaying}
            />
          </div>
        </>
      )}
      <input type="checkbox" id="user-kicked-modal" className="modal-toggle" />
      <div className={"modal " + (kicked ? "modal-open" : "")}>
        <div className="modal-box">
          <p className="py-4">You&apos;ve been kicked from this room!</p>
          <div className="modal-action">
            <label
              htmlFor="user-kicked-modal"
              className="btn"
              onClick={() => navigate("/")}
            >
              Back to home
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
