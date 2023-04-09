

# My Process

* Define the project
    * What is the single end goal
    * What are the parts of the whole
    * briefly organize and simplify
* Research 
    * AWS rust/lamda
    * WASM
    * AWS Rekognition
    * Sudoku -> Exact Cover -> Dancing Links -> dlx-rs
* Prototype
    * Attempt Sudoku solver
    * Lamda setup - https://aws.amazon.com/blogs/opensource/rust-runtime-for-aws-lambda/
    * Design interface
    * Figure out hosting
* Implement
    * User Interface
    * Lamda functions
    * Hosting
* Release!


Setting up rust lamda
tried to follow https://aws.amazon.com/blogs/opensource/rust-runtime-for-aws-lambda/ but it was outdated
they suggest lamda-runtim 0.1 but hte latest release is 0.7.3
ran into issues 
    Unrecoverable error while fetching next event: description() is deprecated; use Display
    logger was incorrect - had to use simple_logger::SimpleLogger::new().with_utc_timestamps().with_level(log::Level::Info).init()?;
    changed // use lambda::error::HandlerError; to use lambda::Error as LamdaError;

Found the lamda-runtime crate documentation and started over
installed brew
installed cargo-lamda


https://blog.logrocket.com/deploy-lambda-functions-rust/#upload-AWS-deploy-command

mr7zFAydNMbNFT4ySjxXppebYg8kLbWEhN9e4OjB

arn:aws:iam::836905967778:role/rust-role


 cargo lambda deploy --iam-role arn:aws:iam::836905967778:role/rust-role --binary-name solve rust-test

 https://kop43yn3mg3vkhzjewmkibziam0ywzsm.lambda-url.us-west-1.on.aws/


3/13/23
I've really been getting caught up in the details of trying to figure out aws, rust, and rekognition all at the same time. I haven't been taking an iterative approach like I should have. 

I want to end up with a page hosted on my blog that allows someone to upload a picture of a sudoku, send it to aws, extracts the puzzle, solves it, and displays the solution to the user.

I know how to to some of this but I need to learn alot
* how to proxy from my wordpress blog
* how to use aws lambda functions
* how to connect to rekognition using rust
* how to solve sudoku

I could simplify this a lot by just buidling an html page that allows a user to type in their sudoku puzzle and then use the dancing links algorithm to solve it in the browser.

I like this idea because I can still learn WASM but also layer more functionality in later.

I'm anxious to get started. I'm going in too many directions. Should I define a roadmap or start picking technologies?

Roadmap

* Create a web page with a ui for entering the sudoku puzzle and solving
    * react or yew? - just use react for now so progress can be made
    * make a wasm module to solve the puzzle
* release and create a blog post
* image rekognition

Found this library - https://crates.io/crates/aws-sdk-rekognition/0.24.0
It allows you to create a client and then process images as either base64 or in s3.
I could possibly create a lambda or url that just gets the image as base64 and returns the result.
That sounds way better than integrating with s3.

3/28

created a github action
my rust build was failing so i had to split my rust project into two crates
after that I created a docker image for a nginx container with a self-signed ssl cert
i was able to run npm build in my ui project and then serve it using my nginx containre
after that I could access the site on my phone using https://my-hostname and view the site on my phone - it worked!

4/9

Made huge progress! Thank you Jesus! Created the following user story and implemented the checks.

when a user first vists the page    ✔
    they should see an empty sudoku board with two buttons  ✔
    the first button should be "From Photo" ✔
    the second button should say "solve"    ✔
When a user clicks "From Photo"     ❌
    they should see a ui for selecting a photo  ✔
    the photo ui should show a square region with a grid for locating the sudoku    ✔
    the photo ui should have a button to cancel ✔
    the photo ui should have a button to confirm    ✔
    when the user clicks confirm it should send hte picture to the sudoku lambda        ❌
when the sudoku lambda responds with success it should load the sudoku board    ❌
when teh sudoku lambda responds with failur eit should display an error message ❌
when the user clicks "Solve"    ✔
    it should change the title to "Solution"    ✔
    it should display the original numbers in a certain color   ❌
    it should display the solution colors in another color  ❌
    it should show a button to start over   ✔
    if their is no valid solution it should display an error message    ❌

The mobile version doesn't look at all like what the emulator shows. Will need to do some on-device debugging. 
