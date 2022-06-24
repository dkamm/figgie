import React, { useState, useCallback } from "react";

import ActivityLog from "pages/Room/ActivityLog";
import ChatInput from "pages/Room/ChatInput";

export const Chat = ({ users, activityEvents, send, disabled }) => {
  const [backscroll, setBackscroll] = useState(false);
  const [backscrollEventCount, setBackscrollEventCount] = useState(0);
  const hasNewEvents = backscrollEventCount != activityEvents.length;

  const sendMessage = useCallback(
    (message) => {
      send("sendMessage", { message });
    },
    [send]
  );

  const scrollToBottom = useCallback(() => {
    setBackscroll(false);
    setBackscrollEventCount(0);
  }, [setBackscroll, setBackscrollEventCount]);

  const onSubmit = useCallback(
    (message) => {
      sendMessage(message);
      setBackscroll(false);
      setBackscrollEventCount(0);
    },
    [sendMessage, setBackscroll, setBackscrollEventCount]
  );

  return (
    <div className="h-full flex flex-col relative">
      <div className="py-2 flex items-center">
        <strong>Chat</strong>
      </div>
      <ActivityLog
        users={users}
        activityEvents={activityEvents}
        backscroll={backscroll}
        setBackscroll={setBackscroll}
        setBackscrollEventCount={setBackscrollEventCount}
      />
      <div className="w-full absolute bottom-16 z-20">
        {backscroll && hasNewEvents && (
          <button
            onClick={scrollToBottom}
            className="block btn btn-primary mx-auto"
          >
            New Messages
          </button>
        )}
      </div>
      <div className="mt-2">
        <ChatInput onSubmit={onSubmit} disabled={disabled} />
      </div>
    </div>
  );
};

export default Chat;
