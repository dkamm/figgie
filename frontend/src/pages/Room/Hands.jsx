import React from "react";

import Avatar from "components/Avatar";
import Suit from "components/Suit";

import { SUITS } from "constants";

export const Hands = ({ hands, players, users, earnings }) => {
  return (
    <div className="w-full">
      <div className="py-2">
        <strong>Hands</strong>
      </div>
      <table className="table-fixed w-full border border-gray-400 border-collapse">
        <thead className="border-b border-gray-400">
          <tr className="h-8 p-2">
            <th className="pl-2 text-left">Player</th>
            {SUITS.map((suit) => (
              <th className="pl-2 text-left" key={suit}>
                <Suit suit={suit} />
              </th>
            ))}
            <th className="pl-2 text-left">Earnings</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-600">
          {players
            .filter((p) => p)
            .map((userId, playerId) => {
              return (
                <tr key={playerId} className="h-12">
                  <td className="pl-2 text-left">
                    <Avatar user={users.byId[userId]} playerId={playerId} />
                  </td>
                  {SUITS.map((suit) => (
                    <td className="pl-2 text-left" key={suit}>
                      {hands[playerId][suit]}
                    </td>
                  ))}
                  <td className="pl-2 text-left">{earnings[playerId]}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default Hands;
