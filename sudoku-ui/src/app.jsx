import { useEffect, useState } from 'preact/hooks'
import './app.css'
import init, { solve_sudoku } from './pkg/sudoku_solver.js'

const default_puzzle = [
    [ 4, 0, 0, 9, 0, 0, 0, 5, 0 ],
    [ 0, 0, 5, 6, 0, 7, 2, 0, 4 ],
    [ 0, 0, 0, 0, 0, 4, 7, 0, 0 ],
    [ 8, 7, 0, 3, 0, 0, 6, 0, 0 ],
    [ 0, 0, 9, 7, 2, 0, 1, 8, 0 ],
    [ 0, 0, 6, 8, 9, 1, 0, 0, 0 ],
    [ 1, 0, 2, 4, 0, 0, 5, 6, 8 ],
    [ 7, 6, 0, 5, 3, 8, 0, 0, 1 ],
    [ 0, 0, 8, 0, 0, 2, 0, 7, 0 ]
];

const empty_puzzle = [
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
];

const SudokuPuzzle = ( { title, puzzle, onChange } ) => {


    return <div className='puzzle'>
        <h1>{title}</h1>
        <div className='puzzle__game'>
            {
                ( puzzle || empty_puzzle ).map( ( row, y ) => (
                    <div className='puzzle__row' key={y}>
                        {
                            row.map( ( num, x ) => (
                                <input
                                    key={x}
                                    type='number'
                                    className='puzzle__cell'
                                    value={ num ? num : null }
                                    onChange = {
                                        ( e ) => {
                                            onChange( e.target.value, x, y )
                                        }
                                    }
                                />
                            )
                        )}
                    </div>
                ))
            }
        </div>
    </div>
}

export function App() {
    const [ inputPuzzle, setInputPuzzle ] = useState( default_puzzle );
    const [ solvedPuzzle, setSolvedPuzzle ] = useState( null );

    
    useEffect(() => {
       ( async () => {
            await init();
       })();
    }, [] )

    const handleClick = () => {
        const linear_puzzle = inputPuzzle.reduce( ( acc, row ) => acc.concat( row ), [] );
        const linear_solution = solve_sudoku( linear_puzzle );
        const solution = [];

        for( let i = 0; i < 9; i++ ){
            solution.push( Array.from(linear_solution.slice( i * 9, i * 9 + 9 ) ) );
        }

        setSolvedPuzzle( solution );
        
    }

    const handleInputChange = ( value, x, y ) => {
        const newPuzzle = inputPuzzle.map( row => [ ...row ] );

        if( value > 0 && value < 10 ){
            newPuzzle[ y ][ x ] = value;
        }

        setInputPuzzle( newPuzzle );
    };

    return (
        <div className='app'>
            <SudokuPuzzle title={ "Your Puzzle" } puzzle={inputPuzzle} onChange = { handleInputChange } />
            <button onClick={handleClick}>Solve!</button>
            <SudokuPuzzle title={ "The Solution "} puzzle={solvedPuzzle} onChange = { () => {} }/>
        </div>
    )
}
