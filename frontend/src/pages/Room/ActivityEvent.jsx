import React from "react";

import Avatar from "components/Avatar";

const UserJoined = ({ users, payload, playerId }) => {
  const user = users.byId[payload.id];
  return (
    <div>
      <Avatar user={user} playerId={playerId} /> <em>joined</em>
    </div>
  );
};

const UserLeft = ({ users, payload, playerId }) => {
  const user = users.byId[payload.userId];
  return (
    <div>
      <Avatar user={user} playerId={playerId} /> <em>left</em>
    </div>
  );
};

const UserMessaged = ({ users, payload, playerId }) => {
  const user = users.byId[payload.userId];
  return (
    <div>
      <Avatar user={user} playerId={playerId} />: {payload.message}
    </div>
  );
};

const UserChangedName = ({ users, payload, playerId }) => {
  const user = users.byId[payload.userId];
  return (
    <div>
      <Avatar user={user} playerId={playerId} /> changed their name from{" "}
      <strong>{payload.prevName}</strong>
    </div>
  );
};

const UserPromoted = ({ users, payload, playerId }) => {
  const user = users.byId[payload.userId];
  return (
    <div>
      <Avatar user={user} playerId={playerId} /> was promoted to admin
    </div>
  );
};

const UserKicked = ({ users, payload, playerId }) => {
  const user = users.byId[payload.userId];
  return (
    <div>
      <Avatar user={user} playerId={playerId} /> was kicked
    </div>
  );
};

const GameStarted = ({ payload }) => {
  return <div>Game {payload.id} started!</div>;
};

const GameEnded = ({ payload }) => {
  return <div>Game {payload.id} ended!</div>;
};

export const ActivityEvent = ({ users, activityEvent }) => {
  const { type, payload, playerId } = activityEvent;
  switch (type) {
    case "userJoined":
      return <UserJoined users={users} payload={payload} />;

    case "userLeft":
      return <UserLeft users={users} playerId={playerId} payload={payload} />;

    case "userMessaged":
      return (
        <UserMessaged users={users} playerId={playerId} payload={payload} />
      );

    case "userChangedName":
      return (
        <UserChangedName users={users} playerId={playerId} payload={payload} />
      );

    case "userPromoted":
      return (
        <UserPromoted users={users} playerId={playerId} payload={payload} />
      );

    case "userKicked":
      return <UserKicked users={users} playerId={playerId} payload={payload} />;

    case "gameStarted":
      return <GameStarted payload={payload} />;

    case "gameEnded":
      return <GameEnded payload={payload} />;

    default:
      console.error("invalid activity event type", type);
      return null;
  }
};

export default ActivityEvent;
