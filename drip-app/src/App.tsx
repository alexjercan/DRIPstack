import type { Component } from 'solid-js'
import { createSignal, createResource } from 'solid-js'

const fetchResult = async (room: string) => {
    return (
        await fetch(`http://localhost:8080/home/${room}/1/2000000000000`)
    ).json()
}

const App: Component = () => {
    const [room, setRoom] = createSignal()
    const [result] = createResource(room, fetchResult)

    return (
        <>
            <input
                type="string"
                placeholder="room"
                onInput={(e) => setRoom(e.currentTarget.value)}
            />
            <span>{result.loading && 'Loading...'}</span>
            <div>
                <pre>{JSON.stringify(result(), null, 2)}</pre>
            </div>
        </>
    )
}

export default App
