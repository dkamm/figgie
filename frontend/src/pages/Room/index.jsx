import React, { useCallback, useEffect, useReducer, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useWSClient } from "contexts/WSContext";
import { roomReducer, initialState } from "reducers/room";
import Users from "pages/Room/Users";
import Game from "pages/Room/Game";
import GameSummary from "pages/Room/GameSummary";
import GameEvents from "pages/Room/GameEvents";
import Chat from "pages/Room/Chat";

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
        case "orderAdded":
        case "orderTraded":
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

  //const leaveRoom = useCallback(() => {
  //    send("leaveRoom", null)
  //}, [send])

  useEffect(() => {
    if (!isConnected) return;
    wsclient.addMessageHandler(handler);
    joinRoom(name);
    return () => wsclient.removeMessageHandler(handler);
  }, [wsclient, handler, isConnected, joinRoom, name]);

  const isAdmin = userId && users.byId[userId].admin;
  const isSpectating = userId && spectators.find((s) => s === userId);
  const playerId =
    userId && game && game.players.findIndex((p) => p === userId);
  const isPlaying = playerId !== -1;
  const inGame = game && !game.done;

  return (
    <div className="h-[calc(100vh_-_7rem)] grid grid-cols-8 grid-rows-8 gap-x-4">
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
        <>
          {!inGame && (
            <>
              <div className="col-start-2 col-span-4 row-start-1 row-span-4">
                <GameSummary game={game} users={users} />
                {isAdmin && (
                  <button className="btn btn-accent mt-4" onClick={startGame}>
                    Start New Game
                  </button>
                )}
                {!isAdmin && (
                  <div className="mt-4">Waiting for admin to start game...</div>
                )}
              </div>
            </>
          )}
          {inGame && (
            <>
              <div className="col-start-2 col-span-4 h-full flex flex-col gap-y-2">
                <Game
                  game={game}
                  users={users}
                  config={config}
                  playerId={playerId}
                  players={game.players}
                  hand={game.hands[playerId]}
                  send={send}
                  wsclient={wsclient}
                  isConnected={isConnected}
                />
              </div>
            </>
          )}
          {game && (
            <div
              className={
                "col-start-2 col-span-4 " +
                (isSpectating && inGame && !isAdmin
                  ? "row-start-5 row-span-4"
                  : "row-start-6 row-span-3")
              }
            >
              <GameEvents
                users={users}
                events={game.events}
                players={game.players}
              />
            </div>
          )}
          <div className="col-start-6 col-span-3 row-start-1 row-span-4 min-h-0">
            <Users
              userId={userId}
              seats={seats}
              spectators={spectators}
              users={users}
              takeSeat={takeSeat}
              startSpectating={startSpectating}
              changeName={changeName}
              promoteUser={promoteUser}
              kickUser={kickUser}
              isAdmin={isAdmin}
              inGame={inGame}
              maxSpectators={config.maxSpectators}
            />
          </div>
          <div className="col-start-6 col-span-3 row-start-5 row-span-4 min-h-0">
            <Chat
              users={users}
              activityEvents={activityEvents}
              send={send}
              disabled={inGame && isPlaying}
            />
          </div>
        </>
      )}
    </div>
  );
};
