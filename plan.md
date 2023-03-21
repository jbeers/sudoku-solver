
# Overview


* User goes to page
* Uploads an image of sudoku
* crops image
* submits to lambda function
* upload image to s3
* run image through rekognition to extract text
* convert text matches to a sudoku
* solve sudoku using dancing links
* return solution
* update interface to display solution



# Tasks

Design html page
build html page
figure out how to upload images to s3 in rust
figure out how to call rekognition api in rust
write code to create sudoku from rekognition return
connect sudoku to dancing links
incorporate solution back into html page
