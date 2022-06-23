import React from "react";

import Avatar from "components/Avatar";
import Suit from "components/Suit";
import Timer from "pages/Room/Timer";

export const Game = ({ game, users, config }) => {
  return (
    <div>
      <div className="flex justify-between items-end py-2">
        <strong className="block">Game #{game.id}</strong>
        <div className="flex items-center gap-x-1 justify-between w-28">
          <div>Time left:</div>
          <Timer
            serverTime={Date.parse(game.startedAt)}
            duration={config.gameTime}
          />
        </div>
      </div>
      <table className="table-fixed w-full border border-gray-400 border-collapse">
        <thead className="border-b border-gray-400">
          <tr className="p-2 h-8">
            <th className="pl-2 text-left">Suit</th>
            <th className="pl-2 text-left">Bidder</th>
            <th className="pl-2 text-left">Bid</th>
            <th className="pl-2 text-left">Ask</th>
            <th className="pl-2 text-left">Asker</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-600">
          {game.books.map((book, suit) => {
            const bid = book[0];
            const bidder = book[1];
            const ask = book[2];
            const asker = book[3];

            const bidUser = bid && users.byId[game.players[bidder]];
            const askUser = ask && users.byId[game.players[asker]];

            return (
              <tr key={suit} className="h-16">
                <td className="pl-2 text-left">
                  <Suit suit={suit} styles="text-lg" />
                </td>
                <td className="pl-2 text-left">
                  {bidUser ? <Avatar user={bidUser} /> : null}
                </td>
                <td className="pl-2 text-left">{bid || null}</td>
                <td className="pl-2 text-left">{ask || null}</td>
                <td className="pl-2 text-left">
                  {askUser ? <Avatar user={askUser} /> : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Game;
