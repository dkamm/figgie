import React from "react";
import { useWSClient } from "contexts/WSContext";


export const Home = () => {

    const {isConnected} = useWSClient()

    return (
        <div>
        <h1>Home</h1>
        {isConnected ? <p>Connected</p> : <p>Not connected</p>}
        </div>
    );
}
