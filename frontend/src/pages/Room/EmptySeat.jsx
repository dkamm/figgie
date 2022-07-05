import React from "react";

export const EmptySeat = ({
  seat,
  takeSeat,
  startSpectating,
  addBot,
  isAdmin,
  inGame,
  isSpectator,
}) => {
  const color = isSpectator ? "" : "bg-neutral";
  return (
    <tr className={`h-12 ${color}`}>
      <td className="p-2 text-right"></td>
      <td className="p-2 text-left">
        {!isSpectator && (
          <button
            className="btn btn-sm btn-secondary btn-outline p-2"
            onClick={() => {
              takeSeat(seat);
            }}
            disabled={inGame}
          >
            Take Seat
          </button>
        )}
        {isSpectator && (
          <button
            className="block btn btn-sm btn-accent btn-outline"
            onClick={() => {
              startSpectating(seat);
            }}
            disabled={inGame}
          >
            Spectate
          </button>
        )}
      </td>
      <td className="p-2 text-left"></td>
      <td className="p-2 text-left"></td>
      <td>
        {isAdmin && !isSpectator && (
          <div className={`dropdown dropdown-end`}>
            <label tabIndex="0" className={`btn btn-sm m-1`}>
              …
            </label>
            <ul
              tabIndex="0"
              className="z-100 dropdown-content menu p-2 shadow bg-neutral-focus rounded-box w-48"
            >
              <li>
                <a
                  className="text-base-content"
                  onClick={() => {
                    addBot(seat);
                  }}
                >
                  Add Bot
                </a>
              </li>
            </ul>
          </div>
        )}
      </td>
    </tr>
  );
};

export default EmptySeat;
