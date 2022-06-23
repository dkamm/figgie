import React from "react";

import ActivityEvent from "pages/Room/ActivityEvent";

export const ActivityLog = ({ users, activityEvents }) => {
  return (
    <div className="h-full overflow-y-scroll border border-gray-400 p-2">
      {activityEvents.map((activityEvent, id) => (
        <ActivityEvent key={id} users={users} activityEvent={activityEvent} />
      ))}
    </div>
  );
};

export default ActivityLog;
