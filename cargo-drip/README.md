<div align="center">

# Cargo DRIP

The back-end for the DRIP stack built with Rust and [axum](https://github.com/tokio-rs/axum).

</div>

## Quickstart

The application requires the following environment variables defined.

- `DRIP_INFLUXDB_URL` defines the url of the InfluxDb database (default `http://localhost:8086`).
- `DRIP_INFLUXDB_TOKEN` defines the token used to create a connection to the database (default `my-secret-token`).
- `DRIP_INFLUXDB_BUCKET` defines the name of the bucket used inside the InfluxDb databse (default `my-bucket`).

Run with cargo or build.

```bash
$ cargo run
```
