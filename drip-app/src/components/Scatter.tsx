import { Component, createEffect } from 'solid-js'
import * as Plotly from 'plotly.js-basic-dist'
import { Data } from './types'

export type ScatterConifg = {
    xaxes: string
    yaxes: string
}

type ScatterProps = {
    config: ScatterConifg
    data: Data
}

const Scatter: Component<ScatterProps> = (props: ScatterProps) => {
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
        for (let sensor in props.data) {
            let x = props.data[sensor][props.config.xaxes]
            let y = props.data[sensor][props.config.yaxes]

            data.push({
                x,
                y,
                type: 'scatter',
                name: sensor,
                xaxis: 'x',
                yaxis: 'y',
                showlegend: true,
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
                xaxis: {
                    title: { text: props.config.xaxes },
                    showticklabels: true,
                },
                yaxis: {
                    title: { text: props.config.yaxes },
                },
                autosize: true,
                height: 700,
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

export default Scatter
