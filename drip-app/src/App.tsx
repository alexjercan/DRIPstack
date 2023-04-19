import {
    Component,
    createSignal,
    createEffect,
    For,
    Accessor,
    Setter,
} from 'solid-js'
import Visualization from './components/Visualization'
import { SensorData, Data } from './components/types'
import Selector, { Item, Tag } from './components/Selector'
import { tags } from './tags'

const fetchProjects = async (): Promise<string[]> => {
    return (await fetch('http://localhost:8080/measurements')).json()
}

const fetchTagValues = async (
    name: string,
    project: string,
    params: string
): Promise<string[]> => {
    return (
        await fetch(`http://localhost:8080/tags/${project}/${name}?${params}`)
    ).json()
}

const fetchData = async (
    project: string,
    params: string
): Promise<SensorData> => {
    return (await (
        await fetch(`http://localhost:8080/data/${project}?${params}`)
    ).json()) as SensorData
}

type Signals<T> = {
    [key: string]: [Accessor<T>, Setter<T>, Tag, string[]]
}

const App: Component = () => {
    const [projects, setProjects] = createSignal<Item[]>([])
    const [data, setData] = createSignal<Data>({})

    let dependencies: string[] = []
    let signals: Signals<Item[]> = {}
    for (let tag of tags) {
        const { name } = tag
        const [signal, setSignal] = createSignal<Item[]>([])

        signals[name] = [signal, setSignal, tag, [...dependencies]]

        createEffect(() => {
            setSignal([])

            let project = projects().find(({ selected }) => selected)?.text

            if (project === undefined) {
                return
            }

            let querries: string[] = []
            for (let dependency of signals[name][3]) {
                const [dSignal] = signals[dependency]
                let dItems = dSignal().filter(({ selected }) => selected)
                if (dItems.length === 0) {
                    return
                }
                for (let { text } of dItems) {
                    querries.push(`${dependency}=${text}`)
                }
            }
            let params = querries.join('&')

            fetchTagValues(name, project, params).then((values) =>
                setSignal(
                    values.map((value) => ({ text: value, selected: false }))
                )
            )
        })

        dependencies.push(name)
    }

    fetchProjects().then((projects) =>
        setProjects(
            projects.map((project) => ({ text: project, selected: false }))
        )
    )

    createEffect(async () => {
        setData({})

        let project = projects().find(({ selected }) => selected)?.text

        if (project === undefined) {
            return
        }

        let querries: string[] = []
        for (let dependency of dependencies.slice(0, -1)) {
            const [dSignal] = signals[dependency]
            let dItems = dSignal().filter(({ selected }) => selected)
            if (dItems.length === 0) {
                return
            }
            for (let { text } of dItems) {
                querries.push(`${dependency}=${text}`)
            }
        }
        let params = querries.join('&')

        let newData: Data = {}
        let dependency = dependencies[dependencies.length - 1]
        const [dSignal] = signals[dependency]
        let dItems = dSignal().filter(({ selected }) => selected)
        for (let { text } of dItems) {
            newData[text] = await fetchData(project, [params, text].join('&'))
        }
        setData(newData)
    })

    const [widgets, setWidgets] = createSignal<number[]>([])

    return (
        <>
            <h2>Configuration Menu</h2>
            <Selector
                tags={projects}
                setTags={setProjects}
                tag={{ name: 'project', type: 'single' }}
            />

            <For each={dependencies}>
                {(item) => (
                    <Selector
                        tags={signals[item][0]}
                        setTags={signals[item][1]}
                        tag={signals[item][2]}
                    />
                )}
            </For>

            <h2>Visualization</h2>
            <div>
                <For each={widgets()}>
                    {() => <Visualization data={data()} type={undefined} />}
                </For>
                <button
                    onClick={() => setWidgets([...widgets(), widgets().length])}
                >
                    Add a new component
                </button>
            </div>
        </>
    )
}

export default App
