export type Value = string | number | null

export type SensorData = {
    [key: string]: Value[]
}

export type Data = {
    [key: string]: SensorData
}
