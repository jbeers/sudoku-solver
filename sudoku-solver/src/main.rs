// use std::{process::exit, io::Cursor};

use aws_sdk_rekognition as rekognition;

// use base64::{Engine as _, engine::{self, general_purpose}};
// use image;
use std::fs;

#[tokio::main]
async fn main() -> Result<(), rekognition::Error> {
    let config = aws_config::load_from_env().await;
    let client = rekognition::Client::new(&config);


    let image_file = fs::read("./sudoku_easy.jpg" ).unwrap(); 
    // all this was for naught!
    // the docs say it needs to be base64 encoded but it should not be
    // println!( "{:?}", &image_file );
    // let b64 = general_purpose::STANDARD.encode( image_file );
    // exit(0);
    // let img = image::open( "./sudoku_easy.png" ).unwrap();
    // let mut bytes: Vec<u8> = Vec::new();
    // img.write_to(&mut Cursor::new(&mut bytes), image::ImageOutputFormat::Png );
    // let b64 = general_purpose::STANDARD.encode( bytes );

    // let blob = rekognition::types::Blob::new( b64.as_bytes() );
    let blob = rekognition::types::Blob::new( image_file );
    let img = rekognition::model::Image::builder().bytes( blob ).build();


    let result = client.detect_text()
        .image( img )
        .send()
        .await;

    match result {
        Ok(x) => println!("{:?}", x),
        Err(e) => println!("{:?}", e.into_service_error())
    };

    // let response = result.unwrap();

    // println!( "{:?}", response );


    // ... make some calls with the client

    Ok(())
}