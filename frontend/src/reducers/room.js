export const initialState = {
  userId: null,
  users: {
    byId: {},
    allIds: [],
  },
  activityEvents: [],
  seats: [],
  spectators: [],
  config: null,
  game: null,
};

export const roomReducer = (state = {}, { type, payload }) => {
  switch (type) {
    case "joinedRoom": {
      let users = {
        byId: {},
        allIds: [],
      };
      for (const user of payload.users) {
        users.byId[user.id] = user;
        users.allIds.push(user.id);
      }
      return {
        ...state,
        ...payload,
        users,
      };
    }
    case "leftRoom":
      return { ...initialState };
    case "userJoined": {
      let seats = [...state.seats];
      let spectators = [...state.spectators];
      const seat = seats.findIndex((s) => !s);
      if (seat !== -1) {
        // User joined to a seat
        seats[seat] = payload.id;
      } else {
        // User joined to spectators
        const spectatorSeat = spectators.findIndex((s) => !s);
        if (spectatorSeat !== -1) {
          spectators[spectatorSeat] = payload.id;
        }
      }
      return {
        ...state,
        users: {
          byId: {
            ...state.users.byId,
            [payload.id]: payload,
          },
          allIds: [...state.users.allIds, payload.id],
        },
        activityEvents: [...state.activityEvents, { type, payload }],
        seats,
        spectators,
      };
    }
    case "userLeft": {
      let seats = [...state.seats];
      let spectators = [...state.spectators];
      const seat = state.seats.findIndex((s) => s === payload.userId);
      if (seat !== -1) {
        // User was in a seat
        seats[seat] = "";
      } else {
        // User was spectating
        const spectatorSeat = spectators.findIndex((s) => s === payload.userId);
        spectators = [
          ...spectators.slice(0, spectatorSeat),
          ...spectators.slice(spectatorSeat + 1),
        ];
      }
      return {
        ...state,
        users: {
          ...state.users,
          byId: {
            ...state.users.byId,
            [payload.userId]: {
              ...state.users.byId[payload.userId],
              left: true,
            },
          },
        },
        activityEvents: [...state.activityEvents, { type, payload }],
        seats,
        spectators,
      };
    }
    case "userMessaged":
      return {
        ...state,
        activityEvents: [...state.activityEvents, { type, payload }],
      };
    case "userTookSeat": {
      let seats = [...state.seats];
      let spectators = [...state.spectators];
      const seat = seats.findIndex((s) => s === payload.userId);
      if (seat !== -1) {
        // User was sitting in another seat
        seats[seat] = "";
      } else {
        // User was spectating
        const spectatorSeat = spectators.findIndex((s) => s === payload.userId);
        if (spectatorSeat !== -1) {
          spectators = [
            ...spectators.slice(0, spectatorSeat),
            ...spectators.slice(spectatorSeat + 1),
          ];
        }
      }
      seats[payload.seat] = payload.userId;
      return {
        ...state,
        seats,
        spectators,
      };
    }
    case "userChangedName": {
      const prevName = state.users.byId[payload.userId].name;
      return {
        ...state,
        users: {
          ...state.users,
          byId: {
            ...state.users.byId,
            [payload.userId]: {
              ...state.users.byId[payload.userId],
              name: payload.name,
            },
          },
        },
        activityEvents: [
          ...state.activityEvents,
          { type, payload: { prevName, ...payload } },
        ],
      };
    }
    case "userStartedSpectating": {
      let seats = [...state.seats];
      let spectators = [...state.spectators];
      spectators.push(payload.userId);

      const seat = seats.findIndex((s) => s === payload.userId);
      if (seat !== -1) {
        seats[seat] = "";
      }
      return {
        ...state,
        seats,
        spectators,
      };
    }
    case "userPromoted": {
      const adminId = state.users.allIds.filter((id) => {
        return state.users.byId[id].admin;
      });
      return {
        ...state,
        users: {
          ...state.users,
          byId: {
            ...state.users.byId,
            [payload.userId]: {
              ...state.users.byId[payload.userId],
              admin: true,
            },
            [adminId]: {
              ...state.users.byId[adminId],
              admin: false,
            },
          },
        },
        activityEvents: [...state.activityEvents, { type, payload }],
      };
    }
    case "userKicked": {
      let seats = [...state.seats];
      let spectators = [...state.spectators];
      const seat = state.seats.findIndex((s) => s === payload.userId);
      if (seat !== -1) {
        // User was in a seat
        seats[seat] = "";
      } else {
        // User was spectating
        const spectatorSeat = spectators.findIndex((s) => s === payload.userId);
        spectators = [
          ...spectators.slice(0, spectatorSeat),
          ...spectators.slice(spectatorSeat + 1),
        ];
      }
      return {
        ...state,
        users: {
          ...state.users,
          byId: {
            ...state.users.byId,
            [payload.userId]: {
              ...state.users.byId[payload.userId],
              left: true,
            },
          },
        },
        seats,
        spectators,
        activityEvents: [...state.activityEvents, { type, payload }],
      };
    }
    case "gameStarted": {
      const users = {
        ...state.users,
        byId: { ...state.users.byId },
      };
      payload.players.forEach((userId, i) => {
        const user = users.byId[userId];
        users.byId[userId] = {
          ...user,
          money: user.money + payload.earnings[i],
        };
      });
      return {
        ...state,
        users,
        game: payload,
        activityEvents: [...state.activityEvents, { type, payload }],
      };
    }
    case "gameEnded": {
      const users = {
        ...state.users,
        byId: { ...state.users.byId },
      };
      state.game.players.forEach((userId, i) => {
        const user = users.byId[userId];
        users.byId[userId] = {
          ...user,
          money: user.money + payload.bonuses[i],
        };
      });
      return {
        ...state,
        users,
        game: {
          ...state.game,
          ...payload,
          done: true,
        },
        activityEvents: [...state.activityEvents, { type, payload }],
      };
    }
    case "orderAdded": {
      const books = state.game.books.map((b, i) => {
        if (i !== payload.suit) {
          return b;
        }

        let nb = [...b];
        if (!payload.side) {
          nb[0] = payload.price;
          nb[1] = payload.player;
        } else {
          nb[2] = payload.price;
          nb[3] = payload.player;
        }
        return nb;
      });

      return {
        ...state,
        game: {
          ...state.game,
          books: books,
        },
      };
    }
    case "orderTraded": {
      const bidder = payload.bidder;
      const asker = payload.asker;

      const bidUser = state.users.byId[state.game.players[bidder]];
      const askUser = state.users.byId[state.game.players[asker]];

      let hands = state.game.hands.map((h) => {
        return [...h];
      });
      hands[bidder][payload.suit] += 1;
      hands[asker][payload.suit] -= 1;

      let earnings = [...state.game.earnings];
      earnings[bidder] -= payload.price;
      earnings[asker] += payload.price;

      return {
        ...state,
        users: {
          ...state.users,
          byId: {
            ...state.users.byId,
            [bidUser.id]: {
              ...bidUser,
              money: bidUser.money - payload.price,
            },
            [askUser.id]: {
              ...askUser,
              money: askUser.money + payload.price,
            },
          },
        },
        game: {
          ...state.game,
          hands,
          earnings,
          books: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
          ],
        },
        activityEvents: [
          ...state.activityEvents,
          {
            type,
            payload: {
              ...payload,
              bidUserId: bidUser.id,
              askUserId: askUser.id,
            },
          },
        ],
      };
    }
    default:
      return state;
  }
};
