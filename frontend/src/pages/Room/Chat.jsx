import React from "react";

import ActivityLog from "pages/Room/ActivityLog";
import ChatInput from "pages/Room/ChatInput";

export const Chat = ({ users, activityEvents, send, disabled }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="py-2 flex items-center">
        <strong>Chat</strong>
      </div>
      <ActivityLog users={users} activityEvents={activityEvents} />
      <div className="mt-2">
        <ChatInput send={send} disabled={disabled} />
      </div>
    </div>
  );
};

export default Chat;
