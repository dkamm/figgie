import React from "react";

export const EmptySeat = ({ seat, takeSeat, inGame, isSpectator }) => {
  const color = isSpectator ? "" : "bg-neutral";
  return (
    <tr className={`h-12 ${color}`}>
      <td className="p-2 text-right"></td>
      <td className="p-2 text-left">
        {!inGame && !isSpectator && (
          <button
            className="btn btn-sm btn-secondary btn-outline p-2"
            onClick={() => {
              takeSeat(seat);
            }}
          >
            Take Seat
          </button>
        )}
        {(isSpectator || inGame) && <div>(vacant)</div>}
      </td>
      <td className="p-2 text-left"></td>
      <td className="p-2 text-left"></td>
      <td className="p-2 text-left"></td>
    </tr>
  );
};

export default EmptySeat;
