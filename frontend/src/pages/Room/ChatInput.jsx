import React, { useState, useCallback } from "react";

export const ChatInput = ({ send, disabled }) => {
  const [message, setMessage] = useState("");

  const sendMessage = useCallback(
    (message) => {
      send("sendMessage", { message });
    },
    [send]
  );

  const onMessageChange = useCallback(
    (e) => {
      setMessage(e.target.value);
    },
    [setMessage]
  );

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      sendMessage(message);
      setMessage("");
    },
    [sendMessage, message, setMessage]
  );

  return (
    <form className="w-full flex" onSubmit={onSubmit}>
      <input
        className="input input-bordered flex-grow"
        type="text"
        name="message"
        placeholder="message"
        autoComplete="off"
        value={message}
        onChange={onMessageChange}
        disabled={disabled}
      />
      <button
        type="submit"
        value="Send"
        className="btn btn-primary ml-1 p-4"
        disabled={disabled}
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;
