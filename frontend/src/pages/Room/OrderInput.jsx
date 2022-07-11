import React, { useState, useCallback } from "react";

const CHAR2SUIT = {
  c: 0,
  s: 1,
  h: 2,
  d: 3,
};

const OrderMatcher = /(?<firstTwo>(cb|cs|sb|ss|hb|hs|db|ds))(?<price>\d+)$/;

export const OrderInput = ({ sendOrder }) => {
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

      const orderMatch = trimmed.match(OrderMatcher);
      if (orderMatch) {
        const suit = CHAR2SUIT[orderMatch.groups.firstTwo[0]];
        const side = orderMatch.groups.firstTwo[1] === "b" ? 0 : 1;
        const price = parseInt(orderMatch.groups.price);
        sendOrder(price, suit, side);
        setMessage("");
        return;
      }
    },
    [sendOrder, message, setMessage]
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
