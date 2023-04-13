import { Component, createEffect } from 'solid-js'
import * as Plotly from 'plotly.js-basic-dist'

type Value = string | number | boolean | null

export type RoomData = {
    [key: string]: Value[]
}

export type Data = {
    [key: string]: RoomData
}

type Props = {
    data: Data
}

const Visualization: Component<Props> = (props: Props) => {
    let plot_div_id = 'plot_div_' + Math.random()

    createEffect(() => {
        let data: Plotly.Data[] = [];
        for (let room in props.data) {
            let x = props.data[room]["time"] as string[];
            let y = props.data[room]["co"] as number[];

            data.push({x, y, type: 'scatter', name: room})
        }

        Plotly.newPlot(
            plot_div_id,
            data,
            { title: 'co levels', showlegend: true },
            { responsive: true }
        )
    })

    return <div id={plot_div_id} />
}

export default Visualization
