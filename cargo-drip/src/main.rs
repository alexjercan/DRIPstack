use anyhow::Result;
use axum::{
    extract::{Path, State},
    routing::get,
    Router,
};
use chrono::prelude::{DateTime, Utc};
use influxdb::{Client, ReadQuery, Timestamp};
use std::env;
use tower_http::cors::CorsLayer;

#[derive(Clone)]
struct AppState {
    client: Client,
}

async fn ping(State(state): State<AppState>) -> String {
    return match state.client.ping().await {
        Ok((build, version)) => format!("{}: {}", build, version),
        Err(err) => format!("{}", err),
    };
}

async fn home(
    State(state): State<AppState>,
    Path((room, start, end)): Path<(String, u128, u128)>,
) -> String {
    let start: DateTime<Utc> = Timestamp::Milliseconds(start).into();
    let end: DateTime<Utc> = Timestamp::Milliseconds(end).into();
    let read_query = ReadQuery::new(format!(
        "SELECT * FROM home WHERE \"room\" = '{}' AND time >= '{:?}' AND time <= '{:?}'",
        room, start, end
    ));
    let read_result = state.client.query(read_query).await;
    return match read_result {
        Ok(text) => text,
        Err(err) => format!("{:?}", err),
    };
}

#[tokio::main]
async fn main() -> Result<()> {
    let url = env::var("DRIP_INFLUXDB_URL").unwrap_or("http://localhost:8086".to_string());
    let bucket = env::var("DRIP_INFLUXDB_BUCKET").unwrap_or("my-bucket".to_string());
    let token = env::var("DRIP_INFLUXDB_TOKEN").unwrap_or("my-secret-token".to_string());

    let client = Client::new(url, bucket).with_token(token);
    let state = AppState { client };

    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/ping", get(ping).with_state(state.clone()))
        .route(
            "/home/:room/:start/:end",
            get(home).with_state(state.clone()),
        )
        .layer(CorsLayer::permissive());

    axum::Server::bind(&"0.0.0.0:8080".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();

    return Ok(());
}
