import React from "react";

import Avatar from "components/Avatar";
import Suit from "components/Suit";

import { SUITS } from "constants";

export const GameSummary = ({ game, users }) => {
  const playersEarnings = [];
  for (let i = 0; i < game.players.length; i++) {
    playersEarnings.push({
      playerId: i,
      userId: game.players[i],
      earning: game.earnings[i],
    });
  }

  playersEarnings.sort((a, b) => {
    return b.earning - a.earning;
  });

  return (
    <div>
      <div className="flex justify-between items-end py-2">
        <strong className="block">Game #{game.id} Results</strong>
        <div className="flex items-center justify-end gap-x-4">
          <div className="flex items-center gap-x-1">
            <div>Goal Suit:</div>
            <Suit suit={game.goalSuit} />
          </div>
          <div className="flex items-center gap-x-1">
            <div>Goal Count:</div>
            <div>{game.goalCount}</div>
          </div>
          <div className="flex items-center gap-x-1 justify-between w-28">
            <div>Time left:</div>
            <div>0:00</div>
          </div>
        </div>
      </div>
      <table className="table-fixed w-full border border-gray-400 border-collapse">
        <thead className="border-b border-gray-400">
          <tr className="p-2 h-8">
            <th className="text-left pl-2">Player</th>
            {SUITS.map((s) => (
              <th className="text-left pl-2" key={s}>
                <Suit suit={s} styles={"text-lg"} />
              </th>
            ))}
            <th className="text-left pl-2">Earnings</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-600">
          {playersEarnings.map(({ userId, playerId, earning }) => {
            const user = users.byId[userId];
            const hand = game.hands[playerId];
            return (
              <tr key={playerId} className="h-16">
                <td className="pl-2 text-left">
                  <Avatar user={user} playerId={playerId} />
                </td>
                {hand.map((c, i) => (
                  <td className="pl-2 text-left" key={i}>
                    {c}
                  </td>
                ))}
                <td className="pl-2 text-left">
                  {earning >= 0 && "+"}
                  {earning}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default GameSummary;
