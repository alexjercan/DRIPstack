export type Item = {
    text: string
    selected: boolean
}

type Props = {
    item: Item
    onChange: any
}

export function CheckItem(props: Props) {
    return (
        <label>
            <input
                type="checkbox"
                checked={props.item.selected}
                onChange={props.onChange}
            />
            {props.item.text}
        </label>
    )
}
