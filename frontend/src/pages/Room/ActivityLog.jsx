import React from "react"


import ActivityEvent from "pages/Room/ActivityEvent"


export const ActivityLog = ({users, activityEvents}) => {


    return <div>

        {activityEvents.map((activityEvent, id) => 
        
            <ActivityEvent key={id} users={users} activityEvent={activityEvent}/>)

        }

    </div>

}