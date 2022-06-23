import React from "react";

import Suit from "components/Suit";
import { SUITS } from "constants";

export const Hand = ({ hand }) => {
  return (
    <div className="w-full mt-4">
      <div className="py-2">
        <strong>Your Hand</strong>
      </div>
      <table className="table-fixed w-full border border-gray-400 border-collapse">
        <thead className="border-b border-gray-400">
          <tr className="h-8 p-2">
            {SUITS.map((suit) => (
              <th className="pl-2 text-left" key={suit}>
                <Suit suit={suit} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="h-16">
            {SUITS.map((suit) => (
              <td className="pl-2 text-left" key={suit}>
                {hand[suit]}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Hand;
