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
        userId: payload.userId,
        users,
        seats: payload.seats,
        spectators: payload.spectators,
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
          spectators.slice(0, spectatorSeat),
          ...spectators.slice(spectatorSeat + 1),
          "",
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
          spectators[spectatorSeat] = "";
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
      const spectatorSeat = spectators.findIndex((s) => !s);
      spectators[spectatorSeat] = payload.userId;

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
    default:
      return state;
  }
};
