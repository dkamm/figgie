import React from "react";

import SeatedUser from "pages/Room/SeatedUser";

export const Spectators = ({
  userId,
  spectators,
  users,
  changeName,
  promoteUser,
  kickUser,
  isAdmin,
  inGame,
}) => {
  const isEmpty = spectators.length === 0;
  return (
    <table className="table-fixed w-full border border-gray-400 border-collapse">
      <thead className="border-b-2 border-gray-400">
        <tr className="p-2 h-8">
          <th className="w-20"></th>
          <th className="pl-2 text-left">User</th>
          <th className="pl-2 text-left w-16">Money</th>
          <th className="p-2 w-52"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-600">
        {isEmpty && (
          <tr>
            <td colSpan={4} className="w-full text-center p-4 h-16">
              No one is spectating right now
            </td>
          </tr>
        )}
        {!isEmpty &&
          spectators.map((spectator, i) => {
            const user = users.byId[spectator];
            return (
              <SeatedUser
                key={i}
                user={user}
                isUser={user.id === userId}
                isAdmin={isAdmin}
                changeName={changeName}
                isSpectating={true}
                promoteUser={promoteUser}
                kickUser={kickUser}
                inGame={inGame}
              />
            );
          })}
      </tbody>
    </table>
  );
};
