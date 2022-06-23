import React, { useCallback, useEffect, useReducer, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useWSClient } from "contexts/WSContext";
import { roomReducer, initialState } from "reducers/room";
import Seats from "pages/Room/Seats";
import Spectators from "pages/Room/Spectators";
import Game from "pages/Room/Game";
import GameSummary from "pages/Room/GameSummary";
import Hand from "pages/Room/Hand";
import Hands from "pages/Room/Hands";
import Chat from "pages/Room/Chat";

const CHAR2SUIT = {
  c: 0,
  s: 1,
  h: 2,
  d: 3,
};

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
        case "orderRejected":
        case "orderTraded":
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

  const sendOrder = useCallback(
    (price, suit, side) => {
      send("sendOrder", { price, suit, side });
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

  const onInputSubmit = useCallback(
    (message) => {
      sendMessage(message);
    },
    [sendMessage]
  );

  const onInputSubmitGame = useCallback(
    (message) => {
      const tokens = message.split(" ");

      const suit = CHAR2SUIT[tokens[0][0]];
      const side = tokens[1][0] === "b" ? 0 : 1;
      const price = parseInt(tokens[2]);

      sendOrder(price, suit, side);
    },
    [sendOrder]
  );

  const isAdmin = userId && users.byId[userId].admin;
  const isSpectating = userId && spectators.find((s) => s === userId);
  const playerId =
    userId && game && game.players.findIndex((p) => p === userId);
  const isPlaying = playerId !== -1;
  const inGame = game && !game.done;

  console.log("playerid", playerId);

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
        <>
          <div className="row-span-full col-start-1 col-end-3 mr-1">
            {!inGame && (
              <>
                <GameSummary game={game} users={users} />
                {isAdmin && (
                  <button className="btn btn-accent mt-4" onClick={startGame}>
                    Start New Game
                  </button>
                )}
              </>
            )}
            {inGame && (
              <>
                <Game game={game} users={users} config={config} />
                {playerId !== -1 && <Hand hand={game.hands[playerId]} />}
                {playerId === -1 && (
                  <Hands
                    hands={game.hands}
                    players={game.players}
                    users={users}
                  />
                )}
              </>
            )}
          </div>
          <div className="ml-2 row-span-full col-start-3 col-span-2">
            <div className="h-full flex flex-col">
              <div className="max-h-1/2 overflow-auto">
                <Seats
                  userId={userId}
                  seats={seats}
                  users={users}
                  takeSeat={takeSeat}
                  changeName={changeName}
                  promoteUser={promoteUser}
                  kickUser={kickUser}
                  isAdmin={isAdmin}
                  inGame={inGame}
                />
                <Spectators
                  userId={userId}
                  blah={spectators}
                  spectators={spectators}
                  users={users}
                  changeName={changeName}
                  promoteUser={promoteUser}
                  kickUser={kickUser}
                  isAdmin={isAdmin}
                  isSpectating={isSpectating}
                  inGame={inGame}
                  startSpectating={startSpectating}
                />
              </div>
              <div className="w-full flex-grow">
                <Chat
                  users={users}
                  activityEvents={activityEvents}
                  onSubmit={
                    inGame && isPlaying ? onInputSubmitGame : onInputSubmit
                  }
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
