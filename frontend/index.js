/// Entry point for the front end browser app

// These are your basic primitives for building apps from stateful components
// htm gives a convenient way to write HTML templates,
// and preact gives you a convenient way to compose them into larger apps
import { html, render, useState, useContext } from "https://unpkg.com/htm/preact/standalone.module.js"

// Usually the session will get sorta long so it's usually better to keep it in a different file.
import { Session, openSession } from "./session.js"

const App = () => {
    const [session, publish] = openSession();

    // This is not quite JSX but it's close and it's very minimal
    return html`
        <${Session.Provider} value=${[session, publish]}>
            <${TrivialComponent} />
            <${BasicSessionComponent} />
        <//>
    `
}

const TrivialComponent = () => {
    // This component doesn't actually use the session.
    // Most components in your app probably won't even need it.
    // So expect to make many components that look like this one


    // For more information on this approach to maintaining state, check out React hooks
    const [yak_shaved, setYakShaved] = useState(false)

    return html`
        <article class="card">
            <header> Yak Shaving Status </header>
            <p> The yak has ${yak_shaved || "not"} been shaven. </p>
            <button
                onClick=${() => setYakShaved(true)}
            > Shave the yak! </button>
        </article>`
}

const BasicSessionComponent = () => {
    // This component uses the session to communicate state
    const [session, publish] = useContext(Session)

    // For more information on this approach to maintaining state, check out React hooks
    const [a, setA] = useState(3.15)
    const [x, setX] = useState([3, 7, 31, 127])
    const [y, setY] = useState([6, 28, 496, 8128])

    // Since it's async it's not really a big deal if it takes a while,
    // but if it does, remember to leave some UI breadcrumbs for your users to let them know
    // things haven't frozen up
    const launchImmenseComputation = () => {
        // This is probably more complicated so you probably want to move it outside your HTML
        publish({tag: "axpy", a, x, y})
    }

    return html`
        <article class="card">
            <header> Multiply Vectors </header>
            <p> Compute a * x + y </p>
            <label for="a"> a </label>
            <input name="a" type="number" value=${a} onChange=${e => setA(e.target.value)} />

            <label for="x"> x </label>
            <input value=${x.join(" ")} onChange=${e => setX(e.target.value.split(" ").map(n => n*1.0))} />

            <label for="y"> y </label>
            <input value=${y.join(" ")} onChange=${e => setY(e.target.value.split(" ").map(n => n*1.0))} />
            <button onClick=${launchImmenseComputation}> Run Calculation! </button>
            <p>Result: ${session.result_vector.join(" ")}</p>
        </article>`
}

render(html`<${App} />`, document.body)