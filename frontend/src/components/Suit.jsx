import React from "react";

const SUIT_EMOJIS = ["♣", "♠", "♥", "♦"];

export const Suit = ({ suit, styles = "text-base", block = false }) => {
  const color = suit < 2 ? "text-gray-400" : "text-red-400";
  const display = block ? "block" : "";

  return (
    <span className={`${color} ${styles} ${display}`}>{SUIT_EMOJIS[suit]}</span>
  );
};

export default Suit;
