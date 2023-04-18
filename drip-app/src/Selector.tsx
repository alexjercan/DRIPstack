import { Accessor, Component, For, Setter } from 'solid-js'

export type Tag = {
    name: string
    type: 'single' | 'multi'
}

export type Item = {
    text: string
    selected: boolean
}

type Props = {
    tags: Accessor<Item[]>
    setTags: Setter<Item[]>
    tag: Tag
}

const Selector: Component<Props> = (props: Props) => {
    if (props.tag.type === 'single') {
        return SelectorSingle(props);
    } else{
        return SelectorMulti(props);
    }
}

const SelectorSingle: Component<Props> = (props: Props) => {
    return (
        <div>
            <h3>{props.tag.name} Selection</h3>
            <For each={props.tags()}>
                {(item) => (
                    <label>
                        <input
                            type="radio"
                            name={props.tag.name}
                            checked={item.selected}
                            onChange={() => {
                                props.setTags((items) => {
                                    const newItems = items.slice()
                                    const index = newItems.indexOf(item)
                                    newItems.forEach((it, i) => {
                                        it.selected = i === index
                                    })
                                    return newItems
                                })
                            }}
                        />
                        {item.text}
                    </label>
                )}
            </For>
        </div>
    )
}

const SelectorMulti: Component<Props> = (props: Props) => {
    return (
        <div>
            <h3>{props.tag.name} Selection</h3>
            <For each={props.tags()}>
                {(item) => (
                    <label>
                        <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => {
                                props.setTags((items) => {
                                    const newItems = items.slice()
                                    const index = newItems.indexOf(item)
                                    newItems.forEach((it, i) => {
                                        if (i === index) {
                                            it.selected = !it.selected
                                        }
                                    })
                                    return newItems
                                })
                            }}
                        />
                        {item.text}
                    </label>
                )}
            </For>
        </div>
    )
}

export default Selector
