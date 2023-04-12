import { Component } from 'solid-js'

type Value = string | number | boolean | null

export type Data = {
    [key: string]: Value[]
}

type Props = {
    data: Data
}

const Visualization: Component<Props> = (props: Props) => {
    return (
        <>
            <div>{JSON.stringify(props.data)}</div>
        </>
    )
}

export default Visualization
