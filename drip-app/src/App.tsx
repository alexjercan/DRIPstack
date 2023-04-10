import type { Component } from 'solid-js'
import { createResource } from 'solid-js'

const fetchMessage = async () => (await fetch('http://localhost:8080')).text()

const App: Component = () => {
    const [message] = createResource(fetchMessage)

    return (
        <>
            <span>{message.loading && 'Loading...'}</span>
            <div>
                <pre>{JSON.stringify(message(), null, 2)}</pre>
            </div>
        </>
    )
}

export default App
