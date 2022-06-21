import React from "react";

import Avatar from "components/Avatar";
import { Suit } from "components/Suit";

const UserJoined = ({ users, payload }) => {
  const user = users.byId[payload.id];
  return (
    <div>
      <Avatar user={user} /> <em>joined</em>
    </div>
  );
};

const UserLeft = ({ users, payload }) => {
  const user = users.byId[payload.userId];
  return (
    <div>
      <Avatar user={user} /> <em>left</em>
    </div>
  );
};

const UserMessaged = ({ users, payload }) => {
  const user = users.byId[payload.userId];
  return (
    <div>
      <Avatar user={user} />: {payload.message}
    </div>
  );
};

const UserChangedName = ({ users, payload }) => {
  const user = users.byId[payload.userId];
  return (
    <div>
      <Avatar user={user} /> changed their name from{" "}
      <strong>{payload.prevName}</strong>
    </div>
  );
};

const UserPromoted = ({ users, payload }) => {
  const user = users.byId[payload.userId];
  return (
    <div>
      <Avatar user={user} /> was promoted to admin
    </div>
  );
};

const UserKicked = ({ users, payload }) => {
  const user = users.byId[payload.userId];
  return (
    <div>
      <Avatar user={user} /> was kicked
    </div>
  );
};

const GameStarted = ({ payload }) => {
  return <div>Game {payload.id} started!</div>;
};

const GameEnded = ({ payload }) => {
  return <div>Game {payload.id} ended!</div>;
};

const OrderTraded = ({ users, payload }) => {
  const bidUser = users.byId[payload.bidUserId];
  const askUser = users.byId[payload.askUserId];
  return (
    <div>
      {payload.side === 0 && (
        <>
          <Avatar user={bidUser} /> bought <Suit suit={payload.suit} /> from{" "}
          <Avatar user={askUser} /> for <strong>{payload.price}</strong>
        </>
      )}
      {payload.side === 1 && (
        <>
          <Avatar user={askUser} /> sold <Suit suit={payload.suit} /> to{" "}
          <Avatar user={askUser} /> for <strong>{payload.price}</strong>
        </>
      )}
    </div>
  );
};

export const ActivityEvent = ({ users, activityEvent }) => {
  const { type, payload } = activityEvent;
  switch (type) {
    case "userJoined":
      return <UserJoined users={users} payload={payload} />;

    case "userLeft":
      return <UserLeft users={users} payload={payload} />;

    case "userMessaged":
      return <UserMessaged users={users} payload={payload} />;

    case "userChangedName":
      return <UserChangedName users={users} payload={payload} />;

    case "userPromoted":
      return <UserPromoted users={users} payload={payload} />;

    case "userKicked":
      return <UserKicked users={users} payload={payload} />;

    case "gameStarted":
      return <GameStarted payload={payload} />;

    case "gameEnded":
      return <GameEnded payload={payload} />;

    case "orderTraded":
      return <OrderTraded users={users} payload={payload} />;

    default:
      console.error("invalid activity event type", type);
      return null;
  }
};

export default ActivityEvent;
