use std::any::Any;

use aws_config::SdkConfig;
use aws_config::meta::region::RegionProviderChain;
use lambda_http::{service_fn, Error, IntoResponse, Request};
use aws_sdk_rekognition as rekognition;
use rekognition::{model::TextDetection, Region, error::DetectTextError};
use serde::{Deserialize,Serialize};
use serde_json::json;
use image;

#[tokio::main]
async fn main() -> Result<(), Error> {
    env_logger::init();
    println!("Getting started!");
    lambda_http::run(service_fn(hello)).await?;
    Ok(())
}

async fn hello(
    request: Request
) -> Result<impl IntoResponse, Error> {
    let image_data = match request.body() {
        lambda_http::Body::Empty => return Ok(json!({"error": "Empty body"})),
        lambda_http::Body::Binary(b) => b,
        lambda_http::Body::Text(_) => return Ok(json!({"error": "Missing binary data"}))
    };

    
    let pic = image::load_from_memory(image_data)?;

    let client = rekognition::Client::new(&get_config().await );
    let blob = rekognition::types::Blob::new( image_data.clone() );
    let img = rekognition::model::Image::builder().bytes( blob ).build();


    let result = client.detect_text()
        .image( img )
        .send()
        .await;

    let output = match result {
        Ok(x) => x,
        Err(e) => {
            let a = e.into_service_error();
            return Ok(json!({"code": a.code().unwrap_or("0"), "message": a.message().unwrap_or("default")  }))
        }
    };

    let words: Vec<DetectedWord> = output.text_detections()
        .unwrap()
        .iter()
        .filter( |td| {
            match *td.r#type().unwrap() {
                rekognition::model::TextTypes::Line => false,
                rekognition::model::TextTypes::Word => true,
                rekognition::model::TextTypes::Unknown(_) => false,
                _ => false,
            }
        })
        .map( |td| DetectedWord::from( td ) )
        .collect();

    Ok(json!({"board": words_to_sudoku( &words, pic.width() as usize, pic.height() as usize )}))

    // Ok(json!({"words": "test"}))
}

#[derive(Serialize, Deserialize, Debug)]
struct DetectedWord {
    pub text: String,
    pub width: f32,
    pub height: f32,
    pub top: f32,
    pub left: f32,
}

impl DetectedWord {
    pub fn get_x_y( &self, width: &usize, height: &usize ) -> (usize, usize) {
        let cell_size = width / 9;

        let cx = ( self.left * *width as f32 ) + ( ( self.width * *width as f32 ) / 2.0 );
        let cy = ( self.top * *height as f32 ) + ( ( self.height * *height as f32 ) / 2.0 );

        ( cx as usize / cell_size, cy as usize / cell_size )
    }
}

impl From<&TextDetection> for DetectedWord {
    fn from(x: &TextDetection) -> Self {
        DetectedWord {
            text: x.detected_text().unwrap_or("").to_owned(),
            width: x.geometry().unwrap().bounding_box().unwrap().width().unwrap_or(0.0),
            height: x.geometry().unwrap().bounding_box().unwrap().height().unwrap_or(0.0),
            top: x.geometry().unwrap().bounding_box().unwrap().top().unwrap_or(0.0),
            left: x.geometry().unwrap().bounding_box().unwrap().left().unwrap_or(0.0),
        }
    }
}

async fn get_config() -> SdkConfig {
    let region_provider = RegionProviderChain::default_provider().or_else(Region::new("us-west-1"));

    aws_config::from_env().region(region_provider).load().await
}

fn words_to_sudoku( words: &Vec<DetectedWord>, width: usize, height: usize ) -> Vec<Vec<usize>> {
    let mut board: Vec::<Vec<usize>> = ( 0..9 ).into_iter()
                                            .map(|_| {
                                                ( 0..9 ).into_iter().map(|_| 0).collect()
                                            }).collect();

    for word in words {
        let ( x, y ) = word.get_x_y( &width, &height );
        board[ y ][ x ] = word.text.parse::<usize>().unwrap_or( 0 );
    }

    board
}