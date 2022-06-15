import React, {useState, useCallback} from "react"


export const Input = ({onSubmit}) => {

    const [message, setMessage] = useState("")

    const onMessageChange = useCallback((e) => {
        setMessage(e.target.value)
    }, [setMessage])

    const handleSubmit = useCallback((e) => {
        e.preventDefault()
        onSubmit(message)
        setMessage("")
    }, [onSubmit, message, setMessage])

    return <form onSubmit={handleSubmit}>
            <input type="text" name="message" placeholder="message" 
                value={message} 
                onChange={onMessageChange}
            />
            <input type="submit" value="Send"/>
        </form>
}