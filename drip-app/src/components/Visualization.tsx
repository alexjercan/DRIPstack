import { Component, createMemo, createSignal, Match, Switch } from 'solid-js'
import Scatter from './Scatter'
import Selector from './Selector'
import { Data } from './types'

export type Type = 'scatter' | 'hist' | undefined

type Props = {
    type: Type
    data: Data
}

const Visualization: Component<Props> = (props: Props) => {
    const [types, setTypes] = createSignal([
        { text: 'scatter', selected: false },
        { text: 'hist', selected: false },
    ])
    const type = createMemo(() => {
        return types().find(({ selected }) => selected)?.text as Type
    })

    return (
        <>
            <Switch>
                <Match when={type() === undefined}>
                    <Selector
                        tags={types}
                        setTags={setTypes}
                        tag={{ name: 'type', type: 'single' }}
                    />
                </Match>
                <Match when={type() === 'scatter'}>
                    {Scatter({
                        // TODO: these are hardcoded fix
                        config: { xaxes: 'time', yaxes: 'co' },
                        data: props.data,
                    })}
                </Match>
                <Match when={type() === 'hist'}>
                    {Scatter({
                        // TODO: this should be a histogram but meh
                        config: { xaxes: 'time', yaxes: 'temp' },
                        data: props.data,
                    })}
                </Match>
            </Switch>
        </>
    )
}

export default Visualization
