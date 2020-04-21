/**
 * Session management - the state of the single state app
 * 
 * It's worth mentioning that the JS/Preact approach to state is significantly different from
 * Python. Typically, state is treated as immutable, and making changes requires making copies.
 * This is all very different from the mutable instance variables shown in app.py.
 * But you can accomplish the same things without breaking the conventions too much. Instead of
 * neatly organized and separate methods as handlers, you would use a large case statement in a
 * single reducer in Javascript.
 */
///
/// 
import { createContext, useReducer } from "https://unpkg.com/htm/preact/standalone.module.js"

// This should point to the server running your Python backend.
// If you used _path in the router before, you can pass it by giving a path
// at the end of this URL here.
const SOCKET = new WebSocket(`ws://${window.location.hostname}:8001/ws`)

// This is how your state starts on the browser end of the session
const EMPTY = {
    name: "",
    result_vector: [],
}

// This is the context type that you'll pass down through your component structure
const Session = createContext(EMPTY)

// A pretty standard reducer.
//
// This is the only function that should change the state of the application, and even then it
// only creates a new state based on a shallow copy of the last one
const reducer = (state, action) => {
    switch (action.tag) {
        case "assign":
            return {...state, [action.key]: action.value}
        case "error":
            return {...state, error: action}
        
        // Not everything has to be shared; in this case we choose some messages should propagate
        // to the server and some not. This is important to prevent loops, so keep that in mind.
        case "axpy":
        case "any other messages you want..":
            SOCKET.send(JSON.stringify(action));
            return state;
        
        default:
            // No change; you could also choose to send to the server here.
            return state
    }
}

// Open a new session
const openSession = () => {
    const [session, publish] = useReducer(reducer, EMPTY)
    SOCKET.onmessage = ev => publish(JSON.parse(ev.data))
    SOCKET.onerror = ev => publish({
        tag: "error",
        error: "Websocket error",
        details: ev.toString()
    })
    // Depending on your application, if the server closes the socket that may be an error
    SOCKET.onclose = ev => publish({
        tag: "error",
        error: "Websocket error",
        details: ev.toString()
    })
    return [session, publish]
}

export { Session, openSession }