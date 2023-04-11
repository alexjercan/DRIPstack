import { Component, createSignal, createResource, For } from 'solid-js'
import { CheckItem, Item } from './CheckItem'

const fetchTags = async (tag: string): Promise<string[]> => {
    return (await fetch(`http://localhost:8080/tags/${tag}`)).json()
}

const App: Component = () => {
    const [dates, setDates] = createSignal<Item[]>([])
    const [rooms, setRooms] = createSignal<Item[]>([])

    fetchTags('date').then((dates) =>
        setDates(dates.map((date) => ({ text: date, selected: false })))
    )
    fetchTags('room').then((rooms) =>
        setRooms(rooms.map((room) => ({ text: room, selected: false })))
    )

    return (
        <>
            <For each={dates()}>
                {(item) => (
                    <CheckItem
                        item={item}
                        onChange={() => {
                            setDates((items) => {
                                const newItems = items.map((it) =>
                                    it === item
                                        ? { ...it, selected: !it.selected }
                                        : it
                                )
                                return newItems
                            })
                        }}
                    />
                )}
            </For>
            <For each={rooms()}>
                {(item) => (
                    <CheckItem
                        item={item}
                        onChange={() => {
                            setDates((items) => {
                                const newItems = items.map((it) =>
                                    it === item
                                        ? { ...it, selected: !it.selected }
                                        : it
                                )
                                return newItems
                            })
                        }}
                    />
                )}
            </For>
        </>
    )
}

export default App
