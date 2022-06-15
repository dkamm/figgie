import React from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  Outlet,
} from "react-router-dom";
import { Home } from "pages/Home";

import "main.css";
import { createRoot } from "react-dom/client";
import { ReconnectingWebsocket } from "wsclient";
import { WS_URL } from "config";
import { WSClientProvider } from "./contexts/WSContext";
import { Rooms } from "pages/Rooms";
import { Room } from "pages/Room";

const wsclient = ReconnectingWebsocket(WS_URL)

const App = () => {
  return (
    <div>
      <main id="main" className={"flex-grow overflow-y-auto flex flex-col"}>
        <Outlet />
      </main>
    </div>
  );
};

const container = document.getElementById("app");
const root = createRoot(container);
root.render(
  <React.StrictMode>
      <WSClientProvider wsclient={wsclient}>
        <BrowserRouter>
            <Routes>
            <Route path={"/"} element={<App />} >
                <Route path={"rooms"} element={<Rooms />}>
                    <Route path={":roomId"} element={<Room />} />
                </Route>
                <Route index element={<Home />} />
                <Route index element={<Navigate replace to={"/"} />} />
            </Route>
            </Routes>
        </BrowserRouter>
      </WSClientProvider>
  </React.StrictMode>
);
