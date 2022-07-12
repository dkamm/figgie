import React, { useState, useCallback } from "react";

const CHAR2SUIT = {
  c: 0,
  s: 1,
  h: 2,
  d: 3,
};

const SendOrderMatcher =
  /^(?<firstTwo>(cb|ca|sb|sa|hb|ha|db|da))(?<price>\d+)$/;
const PennyMatcher = /^(?<direction>(u|d))(?<suit>(c|s|h|d))$/;
const TakeMatcher = /^(?<direction>(t|s))(?<suit>(c|s|h|d))$/;

export const OrderInput = ({ sendOrder, books, setRejectReason }) => {
  const [message, setMessage] = useState("");

  const onMessageChange = useCallback(
    (e) => {
      setMessage(e.target.value);
    },
    [setMessage]
  );

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();

      const trimmed = message.replaceAll(" ", "");

      const orderMatch = trimmed.match(SendOrderMatcher);
      if (orderMatch) {
        const suit = CHAR2SUIT[orderMatch.groups.firstTwo[0]];
        const side = orderMatch.groups.firstTwo[1] === "b" ? 0 : 1;
        const price = parseInt(orderMatch.groups.price);
        sendOrder(price, suit, side);
        setMessage("");
        return;
      }

      const pennyMatch = trimmed.match(PennyMatcher);
      if (pennyMatch) {
        const suit = CHAR2SUIT[pennyMatch.groups.suit];
        const book = books[suit];
        let price;
        let side;

        if (pennyMatch.groups.direction === "u") {
          price = book[0] + 1;
          side = 0;
        } else {
          price = book[2] - 1;
          side = 1;
        }
        sendOrder(price, suit, side);
        setMessage("");
        return;
      }

      const takeMatch = trimmed.match(TakeMatcher);
      if (takeMatch) {
        const suit = CHAR2SUIT[takeMatch.groups.suit];
        const book = books[suit];
        let price;
        let side;
        if (takeMatch.groups.direction === "t") {
          if (!book[2]) {
            setRejectReason("No ask order to take");
            setMessage("");
            return;
          }
          price = 100;
          side = 0;
        } else {
          if (!book[0]) {
            setRejectReason("No bid order to sell to");
            setMessage("");
            return;
          }
          price = 1;
          side = 1;
        }
        sendOrder(price, suit, side);
        setMessage("");
        return;
      }
      setRejectReason("Invalid command- check the cheatsheet");
    },
    [sendOrder, message, setMessage, books, setRejectReason]
  );

  return (
    <form className="w-full mt-4 flex" onSubmit={onSubmit}>
      <input
        className="input input-bordered flex-grow"
        type="text"
        name="message"
        placeholder="Enter an order here"
        autoComplete="off"
        value={message}
        onChange={onMessageChange}
      />
      <button type="submit" value="Submit" className="btn btn-primary ml-1 p-4">
        Submit
      </button>
    </form>
  );
};

export default OrderInput;
