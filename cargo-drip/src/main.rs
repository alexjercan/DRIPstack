use anyhow::Result;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    routing::get,
    Json, Router,
};
use influxdb::{Client, ReadQuery};
use serde::Deserialize;
use serde_json::Value;
use std::{collections::HashMap, env};
use tower_http::cors::CorsLayer;

#[derive(Clone)]
struct AppState {
    client: Client,
}

#[derive(Debug, Default)]
struct Filter {
    tags: HashMap<String, Vec<String>>,
    start_time: Option<usize>,
    end_time: Option<usize>,
    limit: Option<usize>,
}

impl Filter {
    fn get_filter(self: &Self) -> String {
        let tags = self
            .tags
            .iter()
            .map(|(tag, values)| {
                let pairs: Vec<_> = values
                    .iter()
                    .map(|v| format!("\"{}\" = '{}'", tag, v))
                    .collect();
                return pairs.join(" AND ");
            })
            .collect::<Vec<_>>()
            .join(" AND ");

        return vec![
            Some(tags),
            self.start_time.map(|u| format!("\"time\" >= {}", u)),
            self.end_time.map(|u| format!("\"time\" <= {}", u)),
        ]
        .into_iter()
        .filter_map(|e| e)
        .collect::<Vec<_>>()
        .join(" AND ");
    }
}

impl<'de> Deserialize<'de> for Filter {
    fn deserialize<D>(deserializer: D) -> std::result::Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        return Ok(Vec::<(String, String)>::deserialize(deserializer)?
            .into_iter()
            .fold(Filter::default(), |mut acc, (k, v)| {
                match k.as_str() {
                    "start_time" => acc.start_time = v.parse().ok(),
                    "end_time" => acc.end_time = v.parse().ok(),
                    "limit" => acc.limit = v.parse().ok(),
                    _ => {
                        acc.tags.entry(k).or_default().push(v);
                    }
                }

                return acc;
            }));
    }
}

async fn ping(State(state): State<AppState>) -> Result<String, StatusCode> {
    return match state.client.ping().await {
        Ok((build, version)) => Ok(format!("{}: {}", build, version)),
        _ => Err(StatusCode::INTERNAL_SERVER_ERROR),
    };
}

fn parse_measurements(tags: String) -> Option<Vec<String>> {
    let result: Value = serde_json::from_str(&tags).ok()?;
    let results = result.get("results")?;
    let first = results.get(0)?;
    let series = first.get("series")?;
    let first = series.get(0)?;
    let values: &Value = first.get("values")?;
    let values = values.as_array()?;
    let values: Option<Vec<_>> = values
        .iter()
        .map(|value| Some(value.get(0)?.as_str()?.to_owned()))
        .collect();

    return values;
}

async fn measurements(State(state): State<AppState>) -> Result<Json<Vec<String>>, StatusCode> {
    let bucket = state.client.database_name();

    let query = ReadQuery::new(format!("SHOW MEASUREMENTS ON \"{}\"", bucket));
    let result = state
        .client
        .query(query)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    return parse_measurements(result)
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND);
}

fn parse_tags(tags: String) -> Option<Vec<String>> {
    let result: Value = serde_json::from_str(&tags).ok()?;
    let results = result.get("results")?;
    let first = results.get(0)?;
    let series = first.get("series")?;
    let first = series.get(0)?;
    let values: &Value = first.get("values")?;
    let values = values.as_array()?;
    let values: Option<Vec<_>> = values
        .iter()
        .map(|value| Some(value.get(1)?.as_str()?.to_owned()))
        .collect();

    return values;
}

async fn tags(
    State(state): State<AppState>,
    Path(tag): Path<String>,
    Query(query): Query<Filter>,
) -> Result<Json<Vec<String>>, StatusCode> {
    let bucket = state.client.database_name();
    let filter = query.get_filter();

    let filter = match filter.as_str() {
        "" => String::default(),
        _ => format!(" WHERE {}", filter),
    };

    let query = ReadQuery::new(format!(
        "SHOW TAG VALUES ON \"{}\" WITH KEY = \"{}\"{}",
        bucket, tag, filter
    ));
    let result = state
        .client
        .query(query)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    return parse_tags(result).map(Json).ok_or(StatusCode::NOT_FOUND);
}

fn parse_data(data: String) -> Option<HashMap<String, Vec<Value>>> {
    let result: Value = serde_json::from_str(&data).ok()?;
    let results = result.get("results")?;
    let first = results.get(0)?;
    let series = first.get("series")?;
    let first = series.get(0)?.to_owned();

    let columns = first
        .get("columns")?
        .as_array()?
        .iter()
        .map(|value| Some(value.as_str()?.to_owned()))
        .collect::<Option<Vec<_>>>()?;

    let values = first
        .get("values")?
        .as_array()?
        .iter()
        .map(|value| value.as_array())
        .collect::<Option<Vec<&Vec<_>>>>()?;

    let data: HashMap<String, Vec<Value>> = values
        .into_iter()
        .flat_map(|row| {
            return columns
                .iter()
                .zip(row.iter())
                .collect::<Vec<(&String, &Value)>>();
        })
        .fold(HashMap::new(), |mut acc, (k, v)| {
            acc.entry(k.clone()).or_default().push(v.clone());

            return acc;
        });

    return Some(data);
}

async fn data(
    State(state): State<AppState>,
    Path(measurement): Path<String>,
    Query(query): Query<Filter>,
) -> Result<Json<HashMap<String, Vec<Value>>>, StatusCode> {
    let bucket = state.client.database_name();
    let filter = query.get_filter();

    let filter = match filter.as_str() {
        "" => String::default(),
        _ => format!(" WHERE {}", filter),
    };

    let query = ReadQuery::new(format!(
        "SELECT * FROM \"{}\"..{}{}",
        bucket, measurement, filter
    ));
    let result = state
        .client
        .query(query)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    return parse_data(result).map(Json).ok_or(StatusCode::NOT_FOUND);
}

#[tokio::main]
async fn main() -> Result<()> {
    let url = env::var("DRIP_INFLUXDB_URL").unwrap_or("http://localhost:8086".to_string());
    let bucket = env::var("DRIP_INFLUXDB_BUCKET").unwrap_or("my-bucket".to_string());
    let token = env::var("DRIP_INFLUXDB_TOKEN").unwrap_or("my-secret-token".to_string());

    let client = Client::new(url, bucket).with_token(token);
    let state = AppState { client };

    let app = Router::new()
        .route("/ping", get(ping).with_state(state.clone()))
        .route("/measurements", get(measurements).with_state(state.clone()))
        .route("/tags/:tag", get(tags).with_state(state.clone()))
        .route("/data/:measurement", get(data).with_state(state.clone()))
        .layer(CorsLayer::permissive());

    axum::Server::bind(&"0.0.0.0:8080".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();

    return Ok(());
}
