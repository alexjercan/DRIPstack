import { Component, createEffect, createSignal, Setter } from 'solid-js'
import Selector from './Selector'
import { Data, SensorData } from './types'

type Props = {
    setData: Setter<Data>
}

const fetchProjects = async (): Promise<string[]> => {
    return (await fetch('http://localhost:8080/measurements')).json()
}

const fetchDates = async (project: string): Promise<string[]> => {
    return (await fetch(`http://localhost:8080/tags/${project}/date`)).json()
}

const fetchRooms = async (project: string, date: string): Promise<string[]> => {
    return (
        await fetch(`http://localhost:8080/tags/${project}/room?date=${date}`)
    ).json()
}

const fetchData = async (
    project: string,
    date: string,
    room: string
): Promise<SensorData> => {
    return (await (
        await fetch(
            `http://localhost:8080/data/${project}?date=${date}&room=${room}`
        )
    ).json()) as SensorData
}

const DataLoader: Component<Props> = (props: Props) => {
    const [project, setProject] = createSignal<string | undefined>()
    const [date, setDate] = createSignal<string | undefined>()

    const [projects, setProjects] = createSignal<string[]>([])
    const [dates, setDates] = createSignal<string[]>([])

    fetchProjects().then(setProjects)

    createEffect(() => {
        setDate(undefined)
        setDates([])

        let selectedProject = project()

        if (selectedProject === undefined) {
            return
        }

        fetchDates(selectedProject).then(setDates)
    })

    createEffect(async () => {
        props.setData({})

        let selectedProject = project()
        let selectedDate = date()

        if (selectedProject === undefined || selectedDate === undefined) {
            return
        }

        let newData: Data = {}
        let rooms = await fetchRooms(selectedProject, selectedDate)
        for (let room of rooms) {
            newData[room] = await fetchData(selectedProject, selectedDate, room)
        }
        props.setData(newData)
    })

    return (
        <>
            <Selector
                value={project()}
                values={projects()}
                setValue={setProject}
                title={'Project Selection'}
            />
            <Selector
                value={date()}
                values={dates()}
                setValue={setDate}
                title={'Date Selection'}
            />
        </>
    )
}

export default DataLoader
