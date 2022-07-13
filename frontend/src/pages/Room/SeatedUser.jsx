import React, { useState, useRef, useEffect } from "react";

import Avatar from "components/Avatar";

export const SeatedUser = ({
  user,
  isYou,
  adminView,
  isSpectating,
  changeName,
  promoteUser,
  kickUser,
  removeBot,
  inGame,
  playerId = -1,
}) => {
  const editNameRef = useRef();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);

  useEffect(() => {
    if (editing && editNameRef.current) {
      editNameRef.current.focus();
    }
  }, [editing]);

  const backgroundColor = isSpectating ? "bg-base-100" : "bg-neutral";
  const isBot = user.id.slice(0, 3) === "bot";
  const isAdmin = user.admin;

  return (
    <tr className={`h-12 ${backgroundColor}`}>
      <td className="w-4 pl-2 text-right items-center">
        {isYou && "⭐"} {isAdmin && "👑"} {isBot && "🤖"}
      </td>
      <td className="p-2 text-left">
        {editing ? (
          <div className="flex items-center">
            <input
              className="block input input-sm input-bordered w-full mr-1"
              type="text"
              value={name}
              ref={editNameRef}
              onBlur={(e) => {
                if (e.target.value !== user.name) {
                  changeName(e.target.value);
                }
                setEditing(false);
              }}
              onChange={(e) => {
                setName(e.target.value);
              }}
              maxLength={16}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <Avatar user={user} playerId={playerId} />
          </div>
        )}
      </td>
      <td className="p-2 text-left">{user.money}</td>
      <td className="p-2 pl-4 text-left">{user.rebuys}</td>
      <td>
        {(isYou || adminView) && (
          <div className={`dropdown dropdown-end ${backgroundColor}`}>
            <label
              tabIndex="0"
              className={`btn btn-sm m-1 ${backgroundColor}`}
              disabled={inGame}
            >
              …
            </label>
            <ul
              tabIndex="0"
              className="z-100 dropdown-content menu p-2 shadow bg-neutral-focus rounded-box w-48"
            >
              {" "}
              {adminView && isBot && (
                <li>
                  <a
                    className="text-base-content"
                    onClick={() => {
                      removeBot(user.id);
                    }}
                  >
                    Remove bot
                  </a>
                </li>
              )}
              {isYou && (
                <li>
                  <a
                    className="text-base-content"
                    onClick={() => {
                      setEditing(true);
                    }}
                  >
                    Change name
                  </a>
                </li>
              )}
              {adminView && !isAdmin && !isBot && (
                <>
                  <li>
                    <a
                      className="text-base-content"
                      onClick={() => promoteUser(user.id)}
                    >
                      Promote
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-red-400"
                      onClick={() => kickUser(user.id)}
                    >
                      Kick
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </td>
    </tr>
  );
};

export default SeatedUser;
