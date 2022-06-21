import React, { useState } from "react";

import { Avatar } from "components/Avatar";

const EmptySeat = ({ seat, takeSeat, inGame }) => {
  return (
    <tr>
      <td></td>
      <td>
        {!inGame && (
          <button
            onClick={() => {
              takeSeat(seat);
            }}
          >
            Take Seat
          </button>
        )}
      </td>
      <td></td>
      <td></td>
    </tr>
  );
};

const SeatedUser = ({
  user,
  isUser,
  isAdmin,
  changeName,
  promoteUser,
  kickUser,
  isSpectating,
  inGame,
}) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);

  return (
    <tr className={isSpectating ? "bg-gray-100" : ""}>
      <td className="text-right">
        {isUser && "(You)"} {user.admin && "👑"}
      </td>
      <td className="text-left">
        {editing ? (
          <div className="flex items-center">
            <input
              className="block"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
            <button onClick={() => setEditing(false)}>Cancel</button>
            <button
              onClick={() => {
                if (name != user.name) {
                  changeName(name);
                }
                setEditing(false);
              }}
            >
              Save
            </button>
          </div>
        ) : (
          !inGame && (
            <div className="flex items-center justify-between">
              <Avatar user={user} />
              {isUser && <button onClick={() => setEditing(true)}>Edit</button>}
            </div>
          )
        )}
      </td>
      <td className="text-left">{user.money}</td>
      <td>
        {isAdmin && !inGame && (
          <>
            <button
              onClick={() => {
                promoteUser(user.id);
              }}
            >
              Promote
            </button>
            <button
              onClick={() => {
                kickUser(user.id);
              }}
            >
              Kick
            </button>
          </>
        )}
      </td>
    </tr>
  );
};

export const Seats = ({
  userId,
  seats,
  spectators,
  users,
  takeSeat,
  changeName,
  promoteUser,
  kickUser,
  isAdmin,
  inGame,
}) => {
  return (
    <table className="w-full table-fixed">
      <thead>
        <tr>
          <th></th>
          <th className="text-left">User</th>
          <th className="text-left">Money</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
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
        {spectators
          .filter((s) => s)
          .map((spectator, i) => {
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
