// use lambda_runtime::{service_fn, LambdaEvent, Error};
// use serde_json::{json, Value};

// #[tokio::main]
// async fn main() -> Result<(), Error> {
//     let func = service_fn(func);
//     lambda_runtime::run(func).await?;
//     Ok(())
// }

// async fn func(event: LambdaEvent<Value>) -> Result<Value, Error> {
//     let (event, _context) = event.into_parts();
//     let first_name = event["firstName"].as_str().unwrap_or("world");

//     Ok(json!({ "message": format!("Hello, {}!", first_name) }))
// }


use lambda_http::{service_fn, Error, IntoResponse, Request, RequestExt};
use serde::{Deserialize,Serialize};
use serde_json::json;
// use serde_json::{json, Value};

#[derive(Deserialize,Serialize)]
struct Data {
    pub name: String
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    lambda_http::run(service_fn(hello)).await?;
    Ok(())
}

// async fn hello(
//     request: Request
// ) -> Result<impl IntoResponse, std::convert::Infallible> {
//     let _context = request.lambda_context();

//     Ok(format!(
//         "hello {}!!!",
//         request
//             .query_string_parameters()
//             .first("name")
//             .unwrap_or_else(|| "stranger")
//     ))
// }

async fn hello(
    request: Request
) -> Result<impl IntoResponse, Error> {
    let body = request.payload::<Data>()?;
    
    let name = match body {
        Some(data) => data.name,
        None => String::from( "Default" ),
    };


    Ok(json!({ "message": format!("Hello, {name}")}))
}