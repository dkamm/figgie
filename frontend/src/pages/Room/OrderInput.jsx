import React, { useState, useCallback, useEffect } from "react";

const CHAR2SUIT = {
  c: 0,
  s: 1,
  h: 2,
  d: 3,
};

export const OrderInput = ({ wsclient, isConnected, send }) => {
  const [message, setMessage] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const sendOrder = useCallback(
    (price, suit, side) => {
      send("sendOrder", { price, suit, side });
    },
    [send]
  );

  const handler = useCallback(
    (message) => {
      const { type, payload } = message;
      if (type === "orderRejected") {
        setRejectReason(payload.reason);
      }
    },
    [setRejectReason]
  );

  const onMessageChange = useCallback(
    (e) => {
      setMessage(e.target.value);
    },
    [setMessage]
  );

  useEffect(() => {
    if (!isConnected) return;
    wsclient.addMessageHandler(handler);
    return () => wsclient.removeMessageHandler(handler);
  }, [handler]);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();

      const tokens = message.split(" ");

      const suit = CHAR2SUIT[tokens[0][0]];
      const side = tokens[1][0] === "b" ? 0 : 1;
      const price = parseInt(tokens[2]);

      sendOrder(price, suit, side);
      setRejectReason("");
      setMessage("");
    },
    [sendOrder, message, setRejectReason, setMessage]
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
      {rejectReason && (
        <div className="alert alert-error shadow-lg mt-2">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{rejectReason}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderInput;
