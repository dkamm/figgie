import React, { useState } from "react";

import Avatar from "components/Avatar";

export const SeatedUser = ({
  user,
  isUser,
  isAdmin,
  isSpectating,
  changeName,
  promoteUser,
  kickUser,
  inGame,
}) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);

  const backgroundColor = isSpectating ? "bg-base-100" : "bg-neutral";

  return (
    <tr className={`h-12 ${backgroundColor}`}>
      <td className="p-2 text-right">
        {isUser && "(You)"} {user.admin && "👑"}
      </td>
      <td className="p-2 text-left">
        {editing ? (
          <div className="flex items-center">
            <input
              className="block input input-sm input-bordered w-full mr-1"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-sm btn-primary ml-1"
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
                className="btn btn-sm btn-primary btn-outline"
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
            )}
          </div>
        )}
      </td>
      <td className="p-2 text-left">{user.money}</td>
      <td className="p-2 pl-4 text-left">{user.rebuys}</td>
      <td>
        {isAdmin && !inGame && !user.admin && (
          <div className={`dropdown dropdown-end ${backgroundColor}`}>
            <label tabIndex="0" className={`btn btn-sm m-1 ${backgroundColor}`}>
              …
            </label>
            <ul
              tabIndex="0"
              className="dropdown-content menu p-2 shadow bg-neutral-focus rounded-box w-48"
            >
              <li>
                <a
                  className="text-base-content"
                  onClick={() => promoteUser(user.id)}
                >
                  Promote
                </a>
              </li>
              <li>
                <a className="text-red-400" onClick={() => kickUser(user.id)}>
                  Kick
                </a>
              </li>
            </ul>
          </div>
        )}
      </td>
    </tr>
  );
};

export default SeatedUser;
