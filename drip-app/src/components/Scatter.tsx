import {
    Component,
    createEffect,
    createMemo,
    createSignal,
    Show,
} from 'solid-js'
import * as Plotly from 'plotly.js-basic-dist'
import { Data } from './types'
import Selector from './Selector'

type Props = {
    data: Data
}

const scatter = (
    data: Data,
    plot_div_id: string,
    xaxis: string,
    yaxis: string
) => {
    let color = 0
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

    let traces: Plotly.Data[] = []
    for (let sensor in data) {
        let x = data[sensor][xaxis]
        let y = data[sensor][yaxis]

        traces.push({
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

    return Plotly.newPlot(
        plot_div_id,
        traces,
        {
            title: { text: `Scatter Plot ${yaxis} vs ${xaxis}` },
            xaxis: {
                title: { text: xaxis },
                showticklabels: true,
            },
            yaxis: {
                title: { text: yaxis },
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
}

const Scatter: Component<Props> = (props: Props) => {
    const plot_div_id = createMemo(() => 'plot_div_' + Math.random())
    const columns = createMemo(() => {
        let columns = new Set<string>()
        for (let sensor in props.data) {
            let data = props.data[sensor]
            for (let column in data) {
                columns.add(column)
            }
        }
        return Array.from(columns)
    })

    const [xaxis, setXaxis] = createSignal<string | undefined>()
    const [yaxis, setYaxis] = createSignal<string | undefined>()

    createEffect(() => {
        let selectedXaxis = xaxis()
        let selectedYaxis = yaxis()
        let div_id = plot_div_id()

        if (selectedXaxis === undefined || selectedYaxis === undefined) {
            return
        }

        scatter(props.data, div_id, selectedXaxis, selectedYaxis)
    })

    return (
        <>
            <Show when={xaxis() === undefined || yaxis() === undefined}>
                <Selector
                    value={xaxis()}
                    values={columns()}
                    setValue={setXaxis}
                    title={'xaxis Selection'}
                />
                <Selector
                    value={yaxis()}
                    values={columns()}
                    setValue={setYaxis}
                    title={'yaxis Selection'}
                />
            </Show>
            <div id={plot_div_id()} />
        </>
    )
}

export default Scatter
