extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

use dlx_rs::Sudoku;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, World!");
}

#[wasm_bindgen]
pub fn get_string() -> String {
    String::from( "This is a test" )
}

#[wasm_bindgen]
pub fn other() -> bool {
    true
}

#[wasm_bindgen]
pub fn solve_sudoku( sudoku: Vec<usize> ) -> Vec<usize> {
    Sudoku::new_from_input(&sudoku).next().unwrap()
}

#[wasm_bindgen]
pub fn test() -> Box<[i32]> {
    vec![
        5, 3, 0, 0, 7, 0, 0, 0, 0,
        6, 0, 0, 1, 9, 5, 0, 0, 0,
        0, 9, 8, 0, 0, 0, 0, 6, 0,
        8, 0, 0, 0, 6, 0, 0, 0, 3,
        4, 0, 0, 8, 0, 3, 0, 0, 1,
        7, 0, 0, 0, 2, 0, 0, 0, 6,
        0, 6, 0, 0, 0, 0, 2, 8, 0,
        0, 0, 0, 4, 1, 9, 0, 0, 5,
        0, 0, 0, 0, 8, 0, 0, 7, 9,
    ].into_boxed_slice()
}