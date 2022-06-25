import React, { useState } from "react";

import Avatar from "components/Avatar";
import Suit from "components/Suit";

const OrderAdded = ({ users, players, payload }) => {
  const user = users.byId[players[payload.player]];
  return (
    <div>
      <Avatar user={user} playerId={payload.player} />{" "}
      {payload.side === 0 ? "bid" : "sell"}{" "}
      <Suit suit={payload.suit} inline={true} /> at{" "}
      <strong>{payload.price}</strong>
    </div>
  );
};

export const OrderTraded = ({ users, players, payload }) => {
  const bidUser = users.byId[players[payload.bidder]];
  const askUser = users.byId[players[payload.asker]];
  return (
    <div>
      {payload.side === 0 && (
        <>
          <Avatar user={bidUser} playerId={payload.bidder} /> bought{" "}
          <Suit suit={payload.suit} /> from{" "}
          <Avatar user={askUser} playerId={payload.asker} /> for{" "}
          <strong>{payload.price}</strong>
        </>
      )}
      {payload.side === 1 && (
        <>
          <Avatar user={askUser} playerId={payload.asker} /> sold{" "}
          <Suit suit={payload.suit} /> to{" "}
          <Avatar user={bidUser} playerId={payload.bidder} /> for{" "}
          <strong>{payload.price}</strong>
        </>
      )}
    </div>
  );
};

export const GameEvents = ({ users, players, events }) => {
  const [mode, setMode] = useState("trades");

  const allEventsActive = mode === "allEvents" ? "tab-active" : "";
  const tradesActive = mode === "trades" ? "tab-active" : "";

  const filteredEvents = events.filter((event) => {
    if (mode === "trades" && event.type != "orderTraded") {
      return false;
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-end py-2">
        <strong className="block">Events</strong>
      </div>
      <div className="tabs">
        <a className={`tab ${tradesActive}`} onClick={() => setMode("trades")}>
          Trades
        </a>
        <a
          className={`tab ${allEventsActive}`}
          onClick={() => setMode("allEvents")}
        >
          All Events
        </a>
      </div>
      <div className="h-full overflow-y-scroll border border-base-content p-2">
        {filteredEvents.length === 0 && (
          <div>
            {mode === "trades" && "No trades yet"}
            {mode === "allEvents" && "No game events yet"}
          </div>
        )}
        {filteredEvents.map(({ type, payload }, i) => {
          switch (type) {
            case "orderAdded":
              return (
                <OrderAdded
                  key={i}
                  users={users}
                  players={players}
                  payload={payload}
                />
              );
            case "orderTraded":
              return (
                <OrderTraded
                  key={i}
                  users={users}
                  players={players}
                  payload={payload}
                />
              );
            default:
              console.error("invalid type", type);
              return null;
          }
        })}
      </div>
    </div>
  );
};

export default GameEvents;
