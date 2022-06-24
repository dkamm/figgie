import React from "react";

export const EmptySeat = ({
  seat,
  takeSeat,
  startSpectating,
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
      <td className="p-2 text-left"></td>
    </tr>
  );
};

export default EmptySeat;
