import { Component, createSignal } from 'solid-js'
import { Data } from './components/types'
import DataLoader from './components/DataLoader'
import Visualization from './components/Visualization'

const App: Component = () => {
    const [data, setData] = createSignal<Data>({})

    return (
        <>
            <h2>Configuration Menu</h2>
            <DataLoader setData={setData} />
            <h2>Visualization</h2>
            <Visualization data={data()} />
        </>
    )
}

export default App
