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

    let colors = [
        '#1F77B4', // muted blue
        '#FF7F0E', // safety orange
        '#2CA02C', // cooked asparagus green
        '#D62728', // brick red
        '#9467BD', // muted purple
        '#8C564B', // chestnut brown
        '#E377C2', // raspberry yogurt pink
        '#7F7F7F', // middle gray
        '#BCBD22', // curry yellow-green
        '#17BECF', // blue-teal
    ]

    createEffect(() => {
        let color = 0

        let data: Plotly.Data[] = []
        for (let room in props.data) {
            let x = props.data[room]['time'] as string[]
            let co = props.data[room]['co'] as number[]
            let temp = props.data[room]['temp'] as number[]
            let hum = props.data[room]['hum'] as number[]

            data.push({
                x,
                y: co,
                type: 'scatter',
                name: room,
                xaxis: 'x',
                yaxis: 'y',
                showlegend: true,
                line: {
                    color: colors[color],
                },
            })
            data.push({
                x,
                y: temp,
                type: 'scatter',
                name: room,
                xaxis: 'x',
                yaxis: 'y2',
                showlegend: false,
                line: {
                    color: colors[color],
                },
            })
            data.push({
                x,
                y: hum,
                type: 'scatter',
                name: room,
                xaxis: 'x',
                yaxis: 'y3',
                showlegend: false,
                line: {
                    color: colors[color],
                },
            })

            color += 1
        }

        Plotly.newPlot(
            plot_div_id,
            data,
            {
                title: { text: 'Scatter Plot' },
                grid: {
                    rows: 3,
                    columns: 1,
                    xaxes: ['x', 'x', 'x'],
                    yaxes: ['y', 'y2', 'y3'],
                },
                xaxis: {
                    title: { text: 'time' },
                    showticklabels: true,
                    type: 'date',
                },
                yaxis: {
                    title: { text: 'co [-]' },
                    type: 'linear',
                },
                yaxis2: {
                    title: { text: 'temp [C]' },
                    type: 'linear',
                },
                yaxis3: {
                    title: { text: 'hum [%]' },
                    type: 'linear',
                },
                autosize: true,
                height: 1700,
                hovermode: 'x unified',
                legend: {
                    orientation: 'h',
                    yanchor: 'bottom',
                    y: 1.1,
                    xanchor: 'left',
                    x: 0.01,
                    itemwidth: 0.33,
                },
                margin: { r: 50, t: 50, l: 50, b: 50 },
            },
            { responsive: true }
        )
    })

    return <div id={plot_div_id} />
}

export default Visualization
