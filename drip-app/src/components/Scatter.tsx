import {
    Component,
    createEffect,
    createMemo,
    createSignal,
    Show,
} from 'solid-js'
import * as Plotly from 'plotly.js-basic-dist'
import { Data } from './types'
import Selector, { Item } from './Selector'

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

type ScatterConifg = {
    xaxes: string
    yaxes: string
}

type ScatterProps = {
    data: Data
}

const Scatter: Component<ScatterProps> = (props: ScatterProps) => {
    const columns = createMemo(() => {
        let columns = new Set<string>()
        for (let sensor in props.data) {
            let data = props.data[sensor]
            for (let column in data) {
                columns.add(column)
            }
        }
        return Array.from(columns).map((column) => ({ text: column, selected: false }))
    })

    const [xColumns, setXColumns] = createSignal<Item[]>(columns())
    const [yColumns, setYColumns] = createSignal<Item[]>(columns())

    const xaxes = createMemo(
        () => xColumns().find(({ selected }) => selected)?.text
    )
    const yaxes = createMemo(
        () => yColumns().find(({ selected }) => selected)?.text
    )

    createEffect(() => {
        let xaxesValue = xaxes()
        let yaxesValue = yaxes()

        if (xaxesValue === undefined || yaxesValue === undefined) {
            return
        }

        let color = 0

        let data: Plotly.Data[] = []
        for (let sensor in props.data) {
            let x = props.data[sensor][xaxesValue]
            let y = props.data[sensor][yaxesValue]

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
                    title: { text: xaxesValue },
                    showticklabels: true,
                },
                yaxis: {
                    title: { text: yaxesValue },
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

    return (
        <>
            <Show when={xaxes() === undefined || yaxes() === undefined}>
                <Selector
                    tags={xColumns}
                    setTags={setXColumns}
                    tag={{ name: 'xaxes', type: 'single' }}
                />
                <Selector
                    tags={yColumns}
                    setTags={setYColumns}
                    tag={{ name: 'yaxes', type: 'single' }}
                />
            </Show>
            <div id={plot_div_id} />
        </>
    )
}

export default Scatter
