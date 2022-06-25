import React, { useState, useCallback } from "react";

const CHAR2SUIT = {
  c: 0,
  s: 1,
  h: 2,
  d: 3,
};

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

      const tokens = message.split(" ");

      const suit = CHAR2SUIT[tokens[0][0]];
      const side = tokens[1][0] === "b" ? 0 : 1;
      const price = parseInt(tokens[2]);

      sendOrder(price, suit, side);
      setMessage("");
    },
    [sendOrder, message, setMessage]
  );

  return (
    <div>
      <form className="w-full flex" onSubmit={onSubmit}>
        <input
          className="input input-bordered flex-grow"
          type="text"
          name="message"
          placeholder="message"
          autoComplete="off"
          value={message}
          onChange={onMessageChange}
        />
        <button
          type="submit"
          value="Submit"
          className="btn btn-primary ml-1 p-4"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default OrderInput;
