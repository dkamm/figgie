import React from "react";

import ActivityLog from "pages/Room/ActivityLog";
import Input from "pages/Room/Input";

export const Chat = ({ users, activityEvents, onSubmit }) => {
  return (
    <div className="mt-4">
      <div className="py-2 flex items-center">
        <strong>Chat</strong>
      </div>
      <div className="w-full overflow-scroll border border-gray-400 p-2">
        <ActivityLog users={users} activityEvents={activityEvents} />
      </div>
      <div className="mt-2">
        <Input onSubmit={onSubmit} />
      </div>
    </div>
  );
};

export default Chat;
