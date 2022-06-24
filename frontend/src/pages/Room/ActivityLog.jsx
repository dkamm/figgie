import React, { useEffect, useRef, useCallback } from "react";

import ActivityEvent from "pages/Room/ActivityEvent";

export const ActivityLog = ({
  users,
  activityEvents,
  backscroll,
  setBackscroll,
  setBackscrollEventCount,
}) => {
  const chatRef = useRef();
  const endRef = useRef();

  useEffect(() => {
    if (!backscroll) {
      // TODO: get this to work with behavior=smooth as the backscroll detection does not work with it.
      // onScroll will be called multiple times with backscroll=false and atBottom=false as part of the animation.
      endRef.current.scrollIntoView();
    }
  }, [backscroll, activityEvents]);

  const onScroll = useCallback(() => {
    const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
    const atBottom = scrollTop + clientHeight >= scrollHeight;

    if (!backscroll && !atBottom) {
      setBackscroll(true);
      setBackscrollEventCount(activityEvents.length);
    }

    if (backscroll && atBottom) {
      setBackscroll(false);
      setBackscrollEventCount(0);
    }
  }, [backscroll, setBackscroll, setBackscrollEventCount, activityEvents]);

  return (
    <div
      className="h-full w-full overflow-y-scroll border border-base-content p-2"
      ref={chatRef}
      onScroll={onScroll}
    >
      {activityEvents.map((activityEvent, id) => (
        <ActivityEvent key={id} users={users} activityEvent={activityEvent} />
      ))}
      <div ref={endRef} />
    </div>
  );
};

export default ActivityLog;
