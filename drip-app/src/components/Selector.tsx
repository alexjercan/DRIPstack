import { For, Setter } from 'solid-js'

type Props<T> = {
    value?: T
    values: T[]
    setValue: (v?: T) => void
    title: string
}

const Selector = <T extends unknown>(props: Props<T>) => {
    return (
        <div>
            <h3>{props.title}</h3>
            <For each={props.values}>
                {(item) => (
                    <label>
                        <input
                            type="radio"
                            name={props.title}
                            checked={item === props.value}
                            onChange={() => {
                                props.setValue(item)
                            }}
                        />
                        {item as string}
                    </label>
                )}
            </For>
        </div>
    )
}

export default Selector
