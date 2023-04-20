import { Component, createMemo, createSignal, Match, Switch } from 'solid-js'
import Scatter from './Scatter'
import Selector from './Selector'
import { Data } from './types'

export type Type = 'scatter' | 'hist'

type Props = {
    data: Data
}

const Widget: Component<Props> = (props: Props) => {
    const [type, setType] = createSignal<Type | undefined>()
    const types = createMemo<Type[]>(() => ['scatter', 'hist'])

    return (
        <>
            <Switch>
                <Match when={type() === undefined}>
                    <Selector
                        value={type()}
                        values={types()}
                        setValue={setType}
                        title={'Type Selection'}
                    />
                </Match>
                <Match when={type() === 'scatter'}>
                    <Scatter data={props.data} />
                </Match>
                <Match when={type() === 'hist'}>"Hist"</Match>
            </Switch>
        </>
    )
}

export default Widget
