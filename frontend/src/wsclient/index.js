export const ReconnectingWebsocket = (url) => {
    let ws = null
    let connected = false
    let reconnect = true
    let stateChangeListeners = []
    let onMessageHandlers = []

    const addMessageHandler = (handler) => {
        onMessageHandlers.push(handler)
    }

    const removeMessageHandler = (handler) => {
        onMessageHandlers = onMessageHandlers.filter(h => h !== handler)
    }

    const addStateChangeListener = (listener) => {
        stateChangeListeners.push(listener)
    }

    const removeStateChangeListener = (listener) => {
        stateChangeListeners = stateChangeListeners.filter(l => l !== listener)
    }

    const connect = () => {
        ws = new WebSocket(url)
        ws.onopen = () => {
            connected = true
            stateChangeListeners.forEach(l => l(true))
        }
        ws.onmessage = (event) => {
            onMessageHandlers.forEach(h => h(event))
        }
        ws.onclose = () => {
            connected = false
            stateChangeListeners.forEach(l => l(false))
            if (!reconnect) {
                return
            }
            setTimeout(connect, 1000)
        }
    }

    const close = () => {
        reconnect = false
        ws.close()
    }

    const send = (message) => {
        ws.send(message)
    }

    connect()

    return {
        send,
        close,
        addStateChangeListener,
        removeStateChangeListener,
        addMessageHandler,
        removeMessageHandler,
        isConnected: () => connected,
    }
}
