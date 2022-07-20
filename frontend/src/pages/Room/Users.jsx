import React from "react";

import SeatedUser from "pages/Room/SeatedUser";
import EmptySeat from "pages/Room/EmptySeat";

export const Users = ({
  userId,
  seats,
  spectators,
  users,
  takeSeat,
  startSpectating,
  changeName,
  promoteUser,
  addBot,
  kickUser,
  removeBot,
  adminView,
  inGame,
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-end py-2">
        <strong className="block">Users</strong>
      </div>
      <div className="table-sticky-header h-full overflow-auto">
        <table className="table-fixed w-full border border-base-content border-collapse rounded">
          <thead className="sticky top-0 border border-base-content z-10 bg-base-100">
            <tr className="h-8 p-2 border border-base-content sticky top-0">
              <th className="w-12 sticky top-0 z-10"></th>
              <th className="pl-2 text-left sticky top-0 z-10">User</th>
              <th className="pl-2 text-left w-16 sticky top-0 z-10">Money</th>
              <th className="pl-2 text-left w-16 sticky top-0 z-10"></th>
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
                    isYou={user.id === userId}
                    adminView={adminView}
                    changeName={changeName}
                    isSpectating={false}
                    promoteUser={promoteUser}
                    kickUser={kickUser}
                    removeBot={removeBot}
                    inGame={inGame}
                    playerId={i}
                  />
                );
              }
              return (
                <EmptySeat
                  key={i}
                  seat={i}
                  takeSeat={takeSeat}
                  startSpectating={startSpectating}
                  inGame={inGame}
                  isSpectatorSeat={false}
                  adminView={adminView}
                  addBot={addBot}
                />
              );
            })}
            {spectators &&
              spectators.map((spectator, i) => {
                if (spectator === "") {
                  return (
                    <EmptySeat
                      key={`spectator-seat-${i}`}
                      seat={i}
                      takeSeat={takeSeat}
                      startSpectating={startSpectating}
                      inGame={inGame}
                      isSpectatorSeat={true}
                      adminView={adminView}
                      addBot={addBot}
                    />
                  );
                }
                const user = users.byId[spectator];
                return (
                  <SeatedUser
                    key={spectator}
                    user={user}
                    isYou={user.id === userId}
                    adminView={adminView}
                    changeName={changeName}
                    isSpectating={true}
                    promoteUser={promoteUser}
                    kickUser={kickUser}
                    removeBot={removeBot}
                    inGame={inGame}
                  />
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
