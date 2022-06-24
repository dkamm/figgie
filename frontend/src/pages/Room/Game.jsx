import React from "react";

import Avatar from "components/Avatar";
import Suit from "components/Suit";
import Timer from "pages/Room/Timer";

export const Game = ({ game, users, playerId, hand, config }) => {
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
            <th className="text-center">Bidder</th>
            <th className="text-center">Bid</th>
            <th className="text-center">Suit</th>
            <th className="text-center">Ask</th>
            <th className="text-center">Asker</th>
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
                <td className="text-center">
                  {bidUser ? <Avatar user={bidUser} playerId={bidder} /> : null}
                </td>
                <td className={`text-center text-player-${bidder}`}>
                  {bid || null}
                </td>
                <td className="text-center">
                  <div className="flex flex-col gap-y-1 items-center">
                    <Suit suit={suit} styles="text-lg" block={true} />
                    {playerId !== -1 && <div>{hand[suit]}</div>}
                  </div>
                </td>
                <td className={`text-center text-player-${asker}`}>
                  {ask || null}
                </td>
                <td className="text-center">
                  {askUser ? <Avatar user={askUser} playerId={asker} /> : null}
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
