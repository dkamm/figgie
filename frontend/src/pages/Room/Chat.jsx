import React from "react";

import ActivityLog from "pages/Room/ActivityLog";
import Input from "pages/Room/Input";

export const Chat = ({ users, activityEvents, onSubmit, disabled }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="py-2 flex items-center">
        <strong>Chat</strong>
      </div>
      <ActivityLog users={users} activityEvents={activityEvents} />
      <div className="mt-2">
        <Input onSubmit={onSubmit} disabled={disabled} />
      </div>
    </div>
  );
};

export default Chat;
