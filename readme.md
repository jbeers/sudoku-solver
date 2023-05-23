# Sudoku Solver 📝

Ever found yourself stumped by a sudoku puzzle! Fear no more! [This project](https://diastolicdesign.com/sudoku-solver/) will help you out! Simply open up the app type in your puzzle or use your phone's camera to take a picture of the puzzle and click solve!

This is a fun proof-of-concept I developed as a way to test out my AWS free tier membership. The app consists of three primary parts.

* UI Frontend - React/Vite
* Puzzle Text Extractor - AWS Lambda, AWS Rekognition
* Puzzle Solver - Rust WebAssembly

## The Frontend 💻

Just your standard React app built with Vite. Special attention was given to allowing the user to correct any mistakes the image parser makes while extracting text. Originally I started out with an all or nothing approach, either the puzzle would be correctly extracted or it would fail. I was able to modify the system so that it extracts things as best it can and shows the user which boxes it failed to parse. The user can easily see what Rekognition got right and what it missed and correct any mistakes or missing pieces.

## Extracting Text From the Image 🤖

Text extraction was done using Amazon's Rekognition. I wrote an AWS Lambda in Rust to connect to the Rekognition API. Rust made it very easy to get up and running. It also made refactoring a sinch. It looks like AWS Rust support is still in its infancy but is growing fast.

## Solving the Puzzle 🧪

Originally I set out to write my own solver. I made some progress but after failing some of the harder puzzles I dedcided to do some research. Wikipedia has a great article on [Sudoku solving algorithms](https://en.wikipedia.org/wiki/Sudoku_solving_algorithms). I was surprised by the number of different approaches. I decided to pursue the [Dancing Links algorithm](https://en.wikipedia.org/wiki/Dancing_Links) by Donald Knuth. Eventually while browsing Rust packages I came across the excellent [dlx-rs](https://crates.io/crates/dlx-rs) library.

Because of Rust's first-class WebAssembly support it was pretty easy to import the dlx-rs library, build a WebAssembly module, and import it into my app. This WebAssembly library is what does all the heavy lifting when you click the "Solve!" button.

## Possible Improvements 🚀

* Provide the ability to take the picture and then crop it manually for easier capturing
* Train Rekognition to recognize a sudoku puzzle and provide the dimensions of it
