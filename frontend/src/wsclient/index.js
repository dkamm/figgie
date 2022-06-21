export const ReconnectingWebsocket = (url) => {
  let ws = null;
  let connected = false;
  let reconnect = true;
  let stateChangeListeners = [];
  let onMessageHandlers = [];
  let offset = 0;
  let latency = 0;
  let lastPingTime = 0;
  let pinger = 0;
  let pingCount = 0;
  const k = 10;
  const alpha = 1 - Math.exp(Math.log(0.1) / k);

  const addMessageHandler = (handler) => {
    onMessageHandlers.push(handler);
  };

  const removeMessageHandler = (handler) => {
    onMessageHandlers = onMessageHandlers.filter((h) => h !== handler);
  };

  const addStateChangeListener = (listener) => {
    stateChangeListeners.push(listener);
  };

  const removeStateChangeListener = (listener) => {
    stateChangeListeners = stateChangeListeners.filter((l) => l !== listener);
  };

  const send = (message) => {
    ws.send(JSON.stringify(message));
  };

  const pongHandler = (message) => {
    const { type, payload } = message;
    if (type === "pong") {
      const now = new Date().getTime();
      const { time } = payload;
      if (lastPingTime > 0) {
        const l = (now - lastPingTime) / 2;
        const d = now - time - (pingCount === 1 ? l : latency);
        if (pingCount <= k) {
          offset = (d * 1) / pingCount + (offset * (pingCount - 1)) / pingCount;
          latency =
            (l * 1) / pingCount + (latency * (pingCount - 1)) / pingCount;
        } else {
          offset = alpha * d + (1 - alpha) * offset;
          latency = alpha * l + (1 - alpha) * latency;
        }
      }
    }
  };

  const connect = () => {
    ws = new WebSocket(url);
    ws.onopen = () => {
      connected = true;
      stateChangeListeners.forEach((l) => l(true));

      pinger = setInterval(() => {
        send({ type: "ping" });
        lastPingTime = new Date().getTime();
        pingCount += 1;
      }, 3000);
    };
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "pong") {
        pongHandler(message);
      } else {
        onMessageHandlers.forEach((h) => h(message));
      }
    };
    ws.onclose = () => {
      connected = false;
      clearInterval(pinger);
      stateChangeListeners.forEach((l) => l(false));
      if (!reconnect) {
        return;
      }
      setTimeout(connect, 1000);
    };
  };

  const close = () => {
    reconnect = false;
    ws.close();
  };

  connect();

  return {
    send,
    close,
    addStateChangeListener,
    removeStateChangeListener,
    addMessageHandler,
    removeMessageHandler,
    isConnected: () => connected,
    getOffset: () => offset,
    getLatency: () => latency,
  };
};
