import { Component, createSignal, createEffect, For } from 'solid-js'
import Visualization, { RoomData, Data } from './Visualization'

type Item = {
    text: string
    selected: boolean
}

const fetchProjects = async (): Promise<string[]> => {
    return (await fetch('http://localhost:8080/measurements')).json()
}

const fetchDates = async (project: string): Promise<string[]> => {
    return (await fetch(`http://localhost:8080/tags/${project}/date`)).json()
}

const fetchRooms = async (project: string, date: string): Promise<string[]> => {
    return (await fetch(`http://localhost:8080/tags/${project}/room?date=${date}`)).json()
}

const fetchData = async (project: string, date: string, room: string): Promise<RoomData> => {
    return (await (
        await fetch(`http://localhost:8080/data/${project}?date=${date}&room=${room}`)
    ).json()) as RoomData
}

const App: Component = () => {
    const [projects, setProjects] = createSignal<Item[]>([])
    const [dates, setDates] = createSignal<Item[]>([])
    const [rooms, setRooms] = createSignal<string[]>([])
    const [data, setData] = createSignal<Data>({})

    fetchProjects().then((projects) =>
        setProjects(projects.map((project) => ({text: project, selected: false})))
    )

    createEffect(() => {
        let project = projects().find(({ selected }) => selected)?.text

        if (project === undefined) {
            return setDates([])
        }

        fetchDates(project).then((dates) =>
            setDates(dates.map((date) => ({ text: date, selected: false })))
        )
    })

    createEffect(() => {
        let project = projects().find(({ selected }) => selected)?.text
        let date = dates().find(({ selected }) => selected)?.text

        if (project === undefined || date === undefined) {
            return setRooms([])
        }

        fetchRooms(project, date).then(setRooms)
    })

    createEffect(async () => {
        let project = projects().find(({ selected }) => selected)?.text
        let date = dates().find(({ selected }) => selected)?.text

        if (project === undefined || date === undefined) {
            return setData({})
        }

        let newData: Data = {}
        for (let room of rooms()) {
            newData[room] = await fetchData(project, date, room)
        }
        setData(newData)
    })

    return (
        <>
            <h2>Configuration Menu</h2>
            <div>
                <h3>Project Selection</h3>
                <For each={projects()}>
                    {(item) => (
                        <label>
                            <input
                                type="radio"
                                name="project"
                                checked={item.selected}
                                onChange={() => {
                                    setProjects((items) => {
                                        const newItems = items.slice()
                                        const index = newItems.indexOf(item)
                                        newItems.forEach((it, i) => {
                                            it.selected = i === index
                                        })
                                        return newItems
                                    })
                                }}
                            />
                            {item.text}
                        </label>
                    )}
                </For>
            </div>
            <div>
                <h3>Date Selection</h3>
                <For each={dates()}>
                    {(item) => (
                        <label>
                            <input
                                type="radio"
                                name="date"
                                checked={item.selected}
                                onChange={() => {
                                    setDates((items) => {
                                        const newItems = items.slice()
                                        const index = newItems.indexOf(item)
                                        newItems.forEach((it, i) => {
                                            it.selected = i === index
                                        })
                                        return newItems
                                    })
                                }}
                            />
                            {item.text}
                        </label>
                    )}
                </For>
            </div>
            <h2>Visualization</h2>
            <div>
                <Visualization data={data()} />
            </div>
        </>
    )
}

export default App
