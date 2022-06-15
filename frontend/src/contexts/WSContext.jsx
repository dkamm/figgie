import React, {useState, useEffect} from "react"

const wsClientContext = React.createContext(null)


export const WSClientProvider = ({wsclient, children}) => {

    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        wsclient.addStateChangeListener(setIsConnected)
        setIsConnected(wsclient.isConnected())
        return () => {
            wsclient.removeStateChangeListener(setIsConnected)
        }
    }, [wsclient, setIsConnected])

    const value = {
        wsclient,
        isConnected
    }

    return <wsClientContext.Provider value={value}>
        {children}
    </wsClientContext.Provider>

}


export const useWSClient = () => {

    const context = React.useContext(wsClientContext)

    if (context === undefined) {
        throw new Error("useWSClient must be used within a WSClientProvider")
    }

    return context
}