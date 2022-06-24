import React from "react";

// Need to instantiate the colors for tailwind
const COLORS = [
  "text-player-0",
  "text-player-1",
  "text-player-2",
  "text-player-3",
];

export const Avatar = ({ user, playerId = -1 }) => {
  const color = playerId !== -1 ? COLORS[playerId] : "";
  return <strong className={color}>{user.name}</strong>;
};

export default Avatar;
