import React from "react";

import ActivityLog from "pages/Room/ActivityLog";
import Input from "pages/Room/Input";

export const Chat = ({ users, activityEvents, onSubmit }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="py-2 flex items-center">
        <strong>Chat</strong>
      </div>
      <ActivityLog users={users} activityEvents={activityEvents} />
      <div className="mt-2">
        <Input onSubmit={onSubmit} />
      </div>
    </div>
  );
};

export default Chat;
