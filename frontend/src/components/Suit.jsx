import React from "react";

const SUIT_EMOJIS = ["♣", "♠", "♥", "♦"];

export const Suit = ({ suit }) => {
  return (
    <div className={suit < 2 ? "text-black" : "text-red-400"}>
      {SUIT_EMOJIS[suit]}
    </div>
  );
};

export default Suit;
