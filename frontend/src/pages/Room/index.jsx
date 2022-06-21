import React, { useCallback, useEffect, useReducer, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useWSClient } from "contexts/WSContext";
import { Avatar } from "components/Avatar";
import { Suit } from "components/Suit";
import { roomReducer, initialState } from "reducers/room";
import { ActivityLog } from "pages/Room/ActivityLog";
import { Input } from "pages/Room/Input";
import { Seats } from "pages/Room/Seats";
import { SUITS } from "constants";

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

  const [{ userId, users, activityEvents, seats, spectators, game }, dispatch] =
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
          <div className="row-span-full col-start-1 col-end-3">
            {!inGame && game && (
              <table className="table-fixed w-full">
                <thead>
                  <tr>
                    <th className="text-left">Player</th>
                    {SUITS.map((s) => (
                      <th className="text-left" key={s}>
                        <Suit suit={s} />
                      </th>
                    ))}
                    <th className="text-left">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {game.players.map((userId, i) => {
                    const user = users.byId[userId];
                    const hand = game.hands[i];

                    return (
                      <tr key={i}>
                        <td className="text-left">
                          <Avatar user={user} />
                        </td>
                        {hand.map((c, i) => (
                          <td className="text-left" key={i}>
                            {c}
                          </td>
                        ))}
                        <td className="text-left">{game.earnings[i]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {inGame && (
              <table className="table-fixed w-full">
                <thead>
                  <tr>
                    <th className="text-left">Suit</th>
                    <th className="text-left">Bidder</th>
                    <th className="text-left">Bid</th>
                    <th className="text-left">Ask</th>
                    <th className="text-left">Asker</th>
                  </tr>
                </thead>
                <tbody>
                  {game.books.map((book, suit) => {
                    const bid = book[0];
                    const bidder = book[1];
                    const ask = book[2];
                    const asker = book[3];

                    const bidUser = bid && users.byId[game.players[bidder]];
                    const askUser = ask && users.byId[game.players[asker]];

                    return (
                      <tr key={suit}>
                        <td className="text-left">
                          <Suit suit={suit} />
                        </td>
                        <td className="">
                          {bidUser ? <Avatar user={bidUser} /> : null}
                        </td>
                        <td className="">{bid || null}</td>
                        <td className="">{ask || null}</td>
                        <td className="">
                          {askUser ? <Avatar user={askUser} /> : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {inGame && playerId !== -1 && (
              <table className="table-fixed w-full">
                <thead>
                  <tr>
                    {SUITS.map((suit) => (
                      <th className="text-left" key={suit}>
                        <Suit suit={suit} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {SUITS.map((suit) => (
                      <td className="text-left" key={suit}>
                        {game.hands[playerId][suit]}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            )}
            {inGame && playerId === -1 && (
              <table className="table-fixed w-full">
                <thead>
                  <tr>
                    <th className="text-left">Player</th>
                    {SUITS.map((suit) => (
                      <th className="text-left" key={suit}>
                        <Suit suit={suit} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {game.players.map((userId, playerId) => {
                    return (
                      <tr key={playerId}>
                        <td className="text-left">
                          <Avatar user={users.byId[userId]} />
                        </td>
                        {SUITS.map((suit) => (
                          <td className="text-left" key={suit}>
                            {game.hands[playerId][suit]}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <div className="row-span-full col-start-3 col-span-2">
            {isAdmin && !inGame && (
              <button onClick={startGame}>New Game</button>
            )}
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
                promoteUser={promoteUser}
                kickUser={kickUser}
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
              <Input
                onSubmit={
                  inGame && isPlaying ? onInputSubmitGame : onInputSubmit
                }
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
