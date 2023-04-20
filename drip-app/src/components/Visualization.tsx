import { Component, createSignal, For } from 'solid-js'
import { Data } from './types'
import Widget from './Widget'

type Props = {
    data: Data
}

const Visualization: Component<Props> = (props: Props) => {
    const [widgets, setWidgets] = createSignal<(typeof Widget)[]>([])

    return (
        <>
            <div>
                <For each={widgets()}>
                    {(widget) => widget({ data: props.data })}
                </For>
                <button onClick={() => setWidgets([...widgets(), Widget])}>
                    Add a new component
                </button>
            </div>
        </>
    )
}

export default Visualization
