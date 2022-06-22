import React, { useState, useCallback } from "react";

export const Input = ({ onSubmit }) => {
  const [message, setMessage] = useState("");

  const onMessageChange = useCallback(
    (e) => {
      setMessage(e.target.value);
    },
    [setMessage]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      onSubmit(message);
      setMessage("");
    },
    [onSubmit, message, setMessage]
  );

  return (
    <form className="w-full flex" onSubmit={handleSubmit}>
      <input
        className="input input-bordered flex-grow"
        type="text"
        name="message"
        placeholder="message"
        autoComplete="off"
        value={message}
        onChange={onMessageChange}
      />
      <button type="submit" value="Send" className="btn btn-primary ml-1 p-4">
        Send
      </button>
    </form>
  );
};
