import React, { useCallback } from "react";
import {
  BrowserRouter,
  Link,
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
  const onClickNavLink = useCallback(() => {}, []);

  return (
    <div className="w-full h-screen flex flex-col">
      <header
        id="header"
        className={"w-full z-50 border-b border-gray-400 sticky top-0"}
      >
        <nav
          className={
            "flex items-center justify-between h-16 w-full mx-auto px-4"
          }
        >
          <Link to={"/"}>
            <span className={"ml-1"}>Figgie</span>
          </Link>
          <ul className={"flex space-x-4"}>
            <li>
              <Link
                className={"block hover:opacity-75"}
                to={"/"}
                onClick={onClickNavLink}
              >
                Home
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <main id="main" className={"w-full flex flex-grow p-4"}>
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
              <Route index element={<Navigate replace to={"/"} />} />
            </Route>
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WSClientProvider>
  </React.StrictMode>
);
