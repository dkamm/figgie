import React from "react";

import Suit from "components/Suit";
import { SUITS } from "constants";

export const Howto = () => {
  return (
    <div className="w-1/2 mx-auto text-left my-4">
      <h1 className="text-xl font-semibold">How to play</h1>
      <br />
      <p>
        Figgie is a trading simulator game invented by{" "}
        <a
          className="text-blue-400"
          href="https://janestreet.com"
          target="_blank" rel="noreferrer"
        >
          Jane Street
        </a>{" "}
        in order to develop intuition about markets.
      </p>
      <br />
      <p>
        It is played with deck of 40 cards. One suit has 12 cards, two suits
        have 10 cards and the last suit has 8 cards. The suit with 12 cards is
        called the <strong>common</strong> suit, and the other suit with the
        same color as the common suit is called the <strong>goal</strong> suit.
      </p>
      <br />
      <p>
        A game of Figgie has 4 players*. Each player gets dealt 10 cards and
        antes 50 chips into the pot at the start of the game. The game lasts for
        4 minutes, during which players can make bids and offers on each suit.
      </p>
      <br />
      <p>
        The following example illustrates how trading works. Suppose that Alice
        submits a bid for spade for 5 chips and Bob submits an ask for heart for
        7 chips. The market for all suits will look like this:{" "}
      </p>
      <br />
      <table className="table-fixed w-full border border-gray-400 border-collapse">
        <thead className="text-center">
          <tr>
            <th>Bidder</th>
            <th>Bid</th>
            <th>Suit</th>
            <th>Ask</th>
            <th>Asker</th>
          </tr>
        </thead>
        <tbody className="text-center">
          <tr>
            <td className="p-2"></td>
            <td className="p-2"></td>
            <td className="p-2">
              <Suit suit={0} />
            </td>
            <td className="p-2"></td>
            <td className="p-2"></td>
          </tr>
          <tr>
            <td className="p-2">Alice</td>
            <td className="p-2">5</td>
            <td className="p-2">
              <Suit suit={1} />
            </td>
            <td className="p-2"></td>
            <td className="p-2"></td>
          </tr>
          <tr>
            <td className="p-2"></td>
            <td className="p-2"></td>
            <td className="p-2">
              <Suit suit={2} />
            </td>
            <td className="p-2">7</td>
            <td className="p-2">Bob</td>
          </tr>
          <tr>
            <td className="p-2"></td>
            <td className="p-2"></td>
            <td className="p-2">
              <Suit suit={3} />
            </td>
            <td className="p-2"></td>
            <td className="p-2"></td>
          </tr>
        </tbody>
      </table>
      <br />
      <p>
        Next, Charles decides to buy the heart from Bob. He pays Bob 7 chips and
        receives the heart from Bob in exchange. They have made a trade and
        trades in Figgie clear the market, which means that Alice&apos;s bid is
        removed.
      </p>
      <br />
      <p>
        At the end of the game, players get 10 chips from the pot for each card
        of the goal suit that they possess. The leftover pot chips go to the
        player who has the most goal suit cards. If there is a tie for having
        the most goal suit cards, the leftover chips are divided evenly amongst
        those players.
      </p>
      <br />
      <p>Here are some examples to better illustrate how the payout works:</p>
      <br />
      <p>
        <strong>Example 1</strong> - 12 club, 8 spade, 10 heart, 10 diamond
      </p>
      <br />
      <table className="table-fixed w-full border border-gray-400 border-collapse">
        <thead className="text-left">
          <tr>
            <th className="pl-2">Player</th>
            {SUITS.map((s) => (
              <th key={s} className="pl-2">
                <Suit suit={s} />
              </th>
            ))}
            <th className="pl-2">Trading P&L</th>
            <th className="pl-2">Per Card Bonus</th>
            <th className="pl-2">Leftover Bonus</th>
            <th className="pl-2">Total Bonus</th>
            <th className="pl-2">Final Score</th>
          </tr>
        </thead>
        <tbody className="text-left">
          <tr>
            <td className="pl-2">Alice</td>
            <td className="pl-2">2</td>
            <td className="pl-2">4</td>
            <td className="pl-2">1</td>
            <td className="pl-2">2</td>
            <td className="pl-2">-64</td>
            <td className="pl-2">40</td>
            <td className="pl-2">120</td>
            <td className="pl-2">160</td>
            <td className="pl-2">96</td>
          </tr>
          <tr>
            <td className="pl-2">Bob</td>
            <td className="pl-2">3</td>
            <td className="pl-2">2</td>
            <td className="pl-2">3</td>
            <td className="pl-2">3</td>
            <td className="pl-2">-76</td>
            <td className="pl-2">20</td>
            <td className="pl-2">0</td>
            <td className="pl-2">20</td>
            <td className="pl-2">-56</td>
          </tr>
          <tr>
            <td className="pl-2">Charles</td>
            <td className="pl-2">4</td>
            <td className="pl-2">1</td>
            <td className="pl-2">3</td>
            <td className="pl-2">3</td>
            <td className="pl-2">-21</td>
            <td className="pl-2">10</td>
            <td className="pl-2">0</td>
            <td className="pl-2">10</td>
            <td className="pl-2">-11</td>
          </tr>
          <tr>
            <td className="pl-2">Dave</td>
            <td className="pl-2">3</td>
            <td className="pl-2">1</td>
            <td className="pl-2">3</td>
            <td className="pl-2">2</td>
            <td className="pl-2">-33</td>
            <td className="pl-2">10</td>
            <td className="pl-2">0</td>
            <td className="pl-2">10</td>
            <td className="pl-2">-23</td>
          </tr>
        </tbody>
      </table>
      <br />
      In this example, the goal suit is spade and Alice has the most spades with
      4. Since there are 8 spades, the pot remainder after the chips per goal
      card are paid out is 120 chips which Alice gets entirely.
      <br />
      <br />
      <p>
        <strong>Example 2</strong> - 12 club, 10 spade, 10 heart, 8 diamond
      </p>
      <br />
      <table className="table-fixed w-full border border-gray-400 border-collapse">
        <thead className="text-left">
          <tr>
            <th className="pl-2">Player</th>
            {SUITS.map((s) => (
              <th key={s} className="pl-2">
                <Suit suit={s} />
              </th>
            ))}
            <th className="pl-2">Trading P&L</th>
            <th className="pl-2">Per Card Bonus</th>
            <th className="pl-2">Leftover Bonus</th>
            <th className="pl-2">Total Bonus</th>
            <th className="pl-2">Final Score</th>
          </tr>
        </thead>
        <tbody className="text-left">
          <tr>
            <td className="pl-2">Alice</td>
            <td className="pl-2">2</td>
            <td className="pl-2">4</td>
            <td className="pl-2">1</td>
            <td className="pl-2">2</td>
            <td className="pl-2">-64</td>
            <td className="pl-2">40</td>
            <td className="pl-2">50</td>
            <td className="pl-2">90</td>
            <td className="pl-2">36</td>
          </tr>
          <tr>
            <td className="pl-2">Bob</td>
            <td className="pl-2">3</td>
            <td className="pl-2">4</td>
            <td className="pl-2">3</td>
            <td className="pl-2">1</td>
            <td className="pl-2">-76</td>
            <td className="pl-2">40</td>
            <td className="pl-2">50</td>
            <td className="pl-2">90</td>
            <td className="pl-2">24</td>
          </tr>
          <tr>
            <td className="pl-2">Charles</td>
            <td className="pl-2">4</td>
            <td className="pl-2">2</td>
            <td className="pl-2">3</td>
            <td className="pl-2">3</td>
            <td className="pl-2">-21</td>
            <td className="pl-2">20</td>
            <td className="pl-2">0</td>
            <td className="pl-2">20</td>
            <td className="pl-2">-1</td>
          </tr>
          <tr>
            <td className="pl-2">Dave</td>
            <td className="pl-2">3</td>
            <td className="pl-2">0</td>
            <td className="pl-2">3</td>
            <td className="pl-2">2</td>
            <td className="pl-2">-33</td>
            <td className="pl-2">0</td>
            <td className="pl-2">0</td>
            <td className="pl-2">0</td>
            <td className="pl-2">-33</td>
          </tr>
        </tbody>
      </table>
      <br />
      <p>
        In this example, the goal suit is spade and Alice and Bob have tied for
        the most spades with 4 each. Since there are 10 spades, the pot
        remainder after the chips per goal card are paid out is 100 chips which
        Alice and Bob split evenly at 50 apiece.
      </p>
      <br />
      <p>
        Since the bonus for getting the most goal suit cards can be substantial,
        it is common for players to attempt to figure out which card is common
        suit (and consequently which card is the goal suit). Players should also
        determine their likelihood to win or tie for the most goal suits, which
        may affect their trading strategy.
      </p>
      <br />
      <p>
        *Note: Figgie can also be played with 5 players where each player
        receives 8 cards instead of 10 and antes 40 chips instead of 50. This
        mode is currently unsupported.
      </p>
    </div>
  );
};

export default Howto;
