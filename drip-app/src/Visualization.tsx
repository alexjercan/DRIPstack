import { Component, createEffect } from 'solid-js'
import * as Plotly from 'plotly.js-basic-dist'

type Value = string | number | boolean | null

export type Data = {
    [key: string]: Value[]
}

type Props = {
    data: Data
}

const Visualization: Component<Props> = (props: Props) => {
    let plot_div_id = 'plot_div_' + Math.random()

    createEffect(() => {
        let x = props.data["time"] as string[];
        let y = props.data["co"] as number[];
        Plotly.newPlot(
            plot_div_id,
            [{ x, y, type: 'scatter' }],
            { title: 'My Plot' },
            { responsive: true }
        )
    })

    return <div id={plot_div_id} />
}

export default Visualization
