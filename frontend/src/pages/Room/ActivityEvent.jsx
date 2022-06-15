import React from "react"

import Avatar from "components/Avatar"

const UserJoined = ({users, payload}) => {
    const user = users.byId[payload.id]
    return <div>
        <Avatar user={user}/> <em>joined</em>
    </div>
}

const UserLeft = ({users, payload}) => {
    const user = users.byId[payload.userId]
    return <div>
        <Avatar user={user}/> <em>left</em>
    </div>
}

const UserMessaged = ({users, payload}) => {
    const user = users.byId[payload.userId]
    return <div>
        <Avatar user={user}/>: {payload.message}
    </div>
}

export const ActivityEvent = ({users, activityEvent}) => {
    const {type, payload} = activityEvent
    switch (type) {
        case "userJoined":
            return <UserJoined users={users} payload={payload}/>

        case "userLeft":
            return <UserLeft users={users} payload={payload}/>

        case "userMessaged":
            return <UserMessaged users={users} payload={payload}/>

        default:
            console.error("invalid activity event type", type)
            return null
    }
}

export default ActivityEvent;