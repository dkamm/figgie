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
  isSpectating,
  inGame,
  startSpectating,
}) => {
  const isEmpty = spectators.length === 0;
  return (
    <div className="mt-4">
      <div className="flex justify-between items-end py-2 h-12">
        <strong className="block">Spectators</strong>
        {!isSpectating && !inGame && (
          <button
            className="btn btn-sm btn-accent btn-outline"
            onClick={startSpectating}
          >
            Spectate
          </button>
        )}
      </div>
      <table className="table-fixed w-full border border-gray-400 border-collapse">
        <thead className="border-b border-gray-400">
          <tr className="p-2 h-8">
            <th className="w-20"></th>
            <th className="pl-2 text-left">User</th>
            <th className="pl-2 text-left w-16">Money</th>
            <th className="pl-4 text-left w-20">Rebuys</th>
            <th className="p-2 w-52"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-600">
          {isEmpty && (
            <tr>
              <td colSpan={5} className="w-full text-center p-4 h-16">
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
    </div>
  );
};

export default Spectators;
