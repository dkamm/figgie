import React, { useState } from "react";

import Avatar from "components/Avatar";

export const SeatedUser = ({
  user,
  isUser,
  isAdmin,
  changeName,
  promoteUser,
  kickUser,
  inGame,
}) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);

  return (
    <tr className="p-2 h-16">
      <td className="p-2 text-right">
        {isUser && "(You)"} {user.admin && "👑"}
      </td>
      <td className="p-2 text-left">
        {editing ? (
          <div className="flex items-center">
            <input
              className="block input input-bordered w-full"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
            <button
              className="btn btn-secondary"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary ml-1"
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
          <div className="flex items-center justify-between">
            <Avatar user={user} />
            {isUser && !inGame && (
              <button
                className="btn btn-primary btn-outline"
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
            )}
          </div>
        )}
      </td>
      <td className="p-2 text-left">{user.money}</td>
      <td>
        {isAdmin && !inGame && !user.admin && (
          <div className="p-2 flex">
            <button
              className="btn btn-warn btn-outline"
              onClick={() => {
                promoteUser(user.id);
              }}
            >
              Promote
            </button>
            <button
              className="btn btn-error btn-outline ml-2"
              onClick={() => {
                kickUser(user.id);
              }}
            >
              Kick
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default SeatedUser;
