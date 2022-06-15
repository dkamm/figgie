export const initialState = {
    userId: null,
    users: {
        byId: {},
        allIds: [],
    },
    activityEvents: [],
}


export const roomReducer = (state = {}, {type, payload}) => {
    switch (type) {
        case "joinedRoom":
            let users = {
                byId: {},
                allIds: [],
            }
            for (const user of payload.users) {
                users.byId[user.id] = user
                users.allIds.push(user.id)
            }
            return {
                ...state, 
                userId: payload.userId,
                users,                
            }
        case "leftRoom":
            return {...initialState}
        case "userJoined":
            return {
                ...state,
                users: {
                    byId: {
                        ...state.users.byId,
                        [payload.id]: payload,
                    },
                    allIds: [...state.users.allIds, payload.id],
                },
                activityEvents: [...state.activityEvents, {type, payload}],
            }
        case "userLeft":
            return {
                ...state,
                users: {
                    ...state.users,
                    byId: {
                        ...state.users.byId,
                        [payload.userId]: {
                            ...state.users.byId[payload.id],
                            left: true,
                        },
                    }
                },
                activityEvents: [...state.activityEvents, {type, payload}],
            }
        case "userMessaged":
            return {...state, activityEvents: [...state.activityEvents, {type, payload}]}
        default:
            return state
    }
}