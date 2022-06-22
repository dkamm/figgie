import React from "react";

import SeatedUser from "pages/Room/SeatedUser";

const EmptySeat = ({ seat, takeSeat, inGame }) => {
  return (
    <tr className="p-2 h-16">
      <td className="p-2 text-right"></td>
      <td className="p-2 text-left">
        {!inGame && (
          <button
            className="btn btn-secondary btn-outline p-2"
            onClick={() => {
              takeSeat(seat);
            }}
          >
            Take Seat
          </button>
        )}
      </td>
      <td className="p-2 text-left"></td>
      <td className="p-2 text-left"></td>
    </tr>
  );
};

export const Seats = ({
  userId,
  seats,
  users,
  takeSeat,
  changeName,
  promoteUser,
  kickUser,
  isAdmin,
  inGame,
}) => {
  return (
    <table className="table-fixed w-full border-2 border-gray-400 border-collapse rounded">
      <thead className="border-b-2 border-gray-400">
        <tr className="h-8 p-2">
          <th className="w-20"></th>
          <th className="pl-2 text-left">User</th>
          <th className="pl-2 text-left w-16">Money</th>
          <th className="pl-2 w-52"></th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-600">
        {seats.map((seat, i) => {
          if (seat) {
            const user = users.byId[seat];
            return (
              <SeatedUser
                key={i}
                user={user}
                isUser={user.id === userId}
                isAdmin={isAdmin}
                changeName={changeName}
                isSpectating={false}
                promoteUser={promoteUser}
                kickUser={kickUser}
                inGame={inGame}
              />
            );
          }
          return (
            <EmptySeat key={i} seat={i} takeSeat={takeSeat} inGame={inGame} />
          );
        })}
      </tbody>
    </table>
  );
};
