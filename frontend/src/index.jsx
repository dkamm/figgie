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

const wsclient = ReconnectingWebsocket(WS_URL);

const App = () => {
  return (
    <div className="w-full min-h-screen">
      <main id="main" className={"w-full p-4"}>
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
          <Route path={"/"} element={<App />}>
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
