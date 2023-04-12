import { Component, createSignal, createEffect, For } from 'solid-js'

type Item = {
    text: string
    selected: boolean
}

const fetchRooms = async (): Promise<string[]> => {
    return (await fetch('http://localhost:8080/tags/room')).json()
}

const fetchDates = async (room: string): Promise<string[]> => {
    return (await fetch(`http://localhost:8080/tags/date?room=${room}`)).json()
}

const fetchData = async (room: string, date: string): Promise<any> => {
    return (
        await fetch(`http://localhost:8080/data?room=${room}&date=${date}`)
    ).json()
}

const App: Component = () => {
    const [rooms, setRooms] = createSignal<Item[]>([])

    fetchRooms().then((rooms) =>
        setRooms(rooms.map((room) => ({ text: room, selected: false })))
    )

    const [dates, setDates] = createSignal<Item[]>([])
    createEffect(() => {
        let room = rooms().find(({ selected }) => selected)?.text

        if (room === undefined) {
            return
        }

        fetchDates(room).then((dates) =>
            setDates(dates.map((date) => ({ text: date, selected: false })))
        )
    })

    const [data, setData] = createSignal({})
    createEffect(() => {
        let room = rooms().find(({ selected }) => selected)?.text
        let date = dates().find(({ selected }) => selected)?.text

        if (room === undefined || date === undefined) {
            return
        }

        fetchData(room, date).then(setData)
    })

    return (
        <>
            <h2>Configuration Menu</h2>
            <div>
                <h3>Room Selection</h3>
                <For each={rooms()}>
                    {(item) => (
                        <label>
                            <input
                                type="radio"
                                name="room"
                                checked={item.selected}
                                onChange={() => {
                                    setRooms((items) => {
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
            <div>{JSON.stringify(data())}</div>
        </>
    )
}

export default App
