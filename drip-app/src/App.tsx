import type { Component } from 'solid-js'
import { createSignal, createResource } from 'solid-js'

const fetchTags = async (tag: string): [string] => {
    return (
        await fetch(`http://localhost:8080/tags/${tag}`)
    ).json();
}

const App: Component = () => {
    const [dates] = createResource(() => fetchTags("date"));
    const [rooms] = createResource(() => fetchTags("room"));

    return (
        <>
            <div>
                <pre>{JSON.stringify(dates(), null, 2)}</pre>
            </div>
            <div>
                <pre>{JSON.stringify(rooms(), null, 2)}</pre>
            </div>
        </>
    )
}

export default App
