import React from "react";

import Avatar from "components/Avatar";
import Suit from "components/Suit";

import { SUITS } from "constants";

export const Hands = ({ hands, players, users }) => {
  return (
    <div className="w-full mt-4">
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
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-600">
          {players.map((userId, playerId) => {
            return (
              <tr key={playerId} className="h-16">
                <td className="pl-2 text-left">
                  <Avatar user={users.byId[userId]} />
                </td>
                {SUITS.map((suit) => (
                  <td className="pl-2 text-left" key={suit}>
                    {hands[playerId][suit]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Hands;
