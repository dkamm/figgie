import React, { useEffect, useState } from "react";

import { useWSClient } from "contexts/WSContext";

export const Timer = ({ serverTime, duration }) => {
  const { wsclient } = useWSClient();

  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const elapsed =
        (now - serverTime - wsclient.getLatency() - wsclient.getOffset()) /
        1000;

      const remaining = Math.max(Math.floor(duration - elapsed), 0);

      setRemaining(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [serverTime, duration, setRemaining]);

  return (
    <div>
      {Math.floor(remaining / 60)}:{Math.floor((remaining % 60) / 10)}
      {remaining % 10}
    </div>
  );
};
