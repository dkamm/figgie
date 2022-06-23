import React from "react";

const SUIT_EMOJIS = ["♣", "♠", "♥", "♦"];

export const Suit = ({ suit, styles = "text-base" }) => {
  const color = suit < 2 ? "text-gray-400" : "text-red-400";

  return <div className={`${color} ${styles}`}>{SUIT_EMOJIS[suit]}</div>;
};

export default Suit;
