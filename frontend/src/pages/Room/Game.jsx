import React, { useCallback, useEffect, useState } from "react";

import Avatar from "components/Avatar";
import Suit from "components/Suit";
import Timer from "pages/Room/Timer";
import OrderInput from "pages/Room/OrderInput";
import { OrderTraded } from "pages/Room/GameEvents";

const Bid = ({ bid, suit, isSpectating, sendOrder }) => {
  return (
    <div className=" flex flex-col items-center justify-center">
      {!isSpectating && (
        <button
          className="block btn btn-circle btn-xs"
          onClick={() => {
            sendOrder(bid + 1, suit, 0);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            version="1.1"
            viewBox="0 0 700 700"
            className="h-6 w-6 fill-current text-white hover:text-gray-400"
          >
            <g>
              <path d="m350 0c-154.44 0-280 125.56-280 280s125.56 280 280 280 280-125.56 280-280-125.56-280-280-280zm0 525c-135.08 0-245-109.92-245-245s109.92-245 245-245 245 109.92 245 245-109.92 245-245 245zm103.03-289.73c6.7812 6.7812 6.7812 17.938 0 24.719-3.3906 3.3906-7.875 5.1406-12.359 5.1406s-8.9688-1.75-12.359-5.1406l-60.812-60.812v203.88c0 9.625-7.875 17.5-17.5 17.5s-17.5-7.875-17.5-17.5v-203.88l-60.812 60.812c-6.7812 6.7812-17.938 6.7812-24.719 0s-6.7812-17.938 0-24.719l90.672-90.672c6.7812-6.7812 17.938-6.7812 24.719 0z" />
            </g>
          </svg>
        </button>
      )}
      <div>{bid}</div>
    </div>
  );
};

const Ask = ({ ask, suit, isSpectating, sendOrder }) => {
  return (
    <div className=" flex flex-col items-center justify-center">
      {!isSpectating && (
        <button
          className="block btn btn-circle btn-xs"
          onClick={() => {
            sendOrder(ask - 1, suit, 1);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            version="1.1"
            viewBox="0 0 700 700"
            className="h-6 w-6 fill-current text-white hover:text-gray-400"
          >
            <g>
              <path d="m547.97 82.031c-52.828-52.938-123.16-82.031-197.97-82.031s-145.14 29.094-197.97 82.031-82.031 123.16-82.031 197.97 29.094 145.14 82.031 197.97c52.828 52.938 123.16 82.031 197.97 82.031s145.14-29.094 197.97-82.031 82.031-123.16 82.031-197.97-29.094-145.14-82.031-197.97zm-197.97 442.97c-135.08 0-245-109.92-245-245s109.92-245 245-245 245 109.92 245 245-109.92 245-245 245zm103.03-225.09c6.7812 6.7812 6.7812 17.938 0 24.719l-90.672 90.672c-3.2812 3.2812-7.7656 5.1406-12.359 5.1406s-9.0781-1.8594-12.359-5.1406l-90.672-90.672c-6.7812-6.7812-6.7812-17.938 0-24.719 6.8906-6.8906 17.938-6.7812 24.719 0l60.812 60.812v-203.77c0-9.625 7.875-17.5 17.5-17.5s17.5 7.875 17.5 17.5v203.88l60.812-60.812c6.8906-6.8906 17.938-6.8906 24.719-0.10938z" />
            </g>
          </svg>
        </button>
      )}
      <div>{ask}</div>
    </div>
  );
};

export const Game = ({
  game,
  users,
  players,
  playerId,
  hand,
  config,
  send,
  wsclient,
  isConnected,
}) => {
  const isPlaying = playerId !== -1;
  const isSpectating = playerId === -1;

  const [rejectReason, setRejectReason] = useState("");
  const [trade, setTrade] = useState(null);

  const handler = useCallback(
    (message) => {
      const { type, payload } = message;
      if (type === "orderRejected") {
        setRejectReason(payload.reason);
        setTrade(null);
      } else if (type === "orderTraded") {
        setTrade(payload);
        setRejectReason("");
      }
    },
    [setRejectReason, setTrade]
  );

  const sendOrder = useCallback(
    (price, suit, side) => {
      send("sendOrder", { price, suit, side });
      setRejectReason("");
    },
    [send, setRejectReason]
  );

  useEffect(() => {
    if (!isConnected) return;
    wsclient.addMessageHandler(handler);
    return () => wsclient.removeMessageHandler(handler);
  }, [handler]);

  return (
    <div>
      <div className="flex justify-between items-end py-2">
        <strong className="block">Game #{game.id}</strong>
        <div className="flex items-center gap-x-1 justify-between w-28">
          <div>Time left:</div>
          <Timer
            serverTime={Date.parse(game.startedAt)}
            duration={config.gameTime}
          />
        </div>
      </div>
      <table className="table-fixed w-full border border-gray-400 border-collapse">
        <thead className="border-b border-gray-400">
          <tr className="p-2 h-8">
            <th className="text-center"></th>
            <th className="text-center">Bidder</th>
            <th className="text-center">Bid</th>
            <th className="text-center">Suit</th>
            <th className="text-center">Ask</th>
            <th className="text-center">Asker</th>
            <th className="text-center"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-600">
          {game.books.map((book, suit) => {
            const bid = book[0];
            const bidder = book[1];
            const ask = book[2];
            const asker = book[3];

            const bidUser = bid && users.byId[game.players[bidder]];
            const askUser = ask && users.byId[game.players[asker]];

            return (
              <tr key={suit} className="h-16">
                <td className="text-center">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      sendOrder(1, suit, 1);
                    }}
                    disabled={bid === 0 || bidder === playerId || !bidUser}
                  >
                    Sell
                  </button>
                </td>
                <td className="text-center">
                  {bidUser ? <Avatar user={bidUser} playerId={bidder} /> : null}
                </td>
                <td
                  key={`bid-${bid}`}
                  className={
                    `text-center text-player-${bidder} ` +
                    (bid !== 0 ? "animate-blink" : "")
                  }
                >
                  {bid !== 0 && (
                    <Bid
                      bid={bid}
                      suit={suit}
                      isSpectating={isSpectating}
                      sendOrder={sendOrder}
                    />
                  )}
                </td>
                <td className="text-center">
                  <div className="flex flex-col items-center">
                    <Suit suit={suit} styles="text-lg" block={true} />
                    {playerId !== -1 && <div>{hand[suit]}</div>}
                  </div>
                </td>
                <td
                  key={`ask-${ask}`}
                  className={
                    `text-center text-player-${asker} ` +
                    (ask !== 0 ? "animate-blink" : "")
                  }
                >
                  {ask !== 0 && (
                    <Ask
                      ask={ask}
                      suit={suit}
                      isSpectating={isSpectating}
                      sendOrder={sendOrder}
                    />
                  )}
                </td>
                <td className="text-center">
                  {askUser ? <Avatar user={askUser} playerId={asker} /> : null}
                </td>
                <td className="text-center">
                  <button
                    className="btn btn-sm btn-secondary"
                    disabled={ask == 0 || asker === playerId || !askUser}
                    onClick={() => {
                      sendOrder(100, suit, 0);
                    }}
                  >
                    Take
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {isPlaying && <OrderInput sendOrder={sendOrder} />}
      {rejectReason && (
        <div className="alert alert-error shadow-lg mt-2">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{rejectReason}</span>
          </div>
        </div>
      )}
      {trade && (
        <div className="alert shadow-lg mt-2 bg-neutral">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <OrderTraded users={users} players={players} payload={trade} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
