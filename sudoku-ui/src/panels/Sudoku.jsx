import { useSudokuContext } from "../SudokuContext";
import { solve_sudoku } from '../pkg/sudoku_solver.js'

export const default_puzzle = [
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

export const empty_puzzle = [
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


const SudokuPuzzle = ( { title, puzzle, onChange, parseFailures = [] } ) => {
    const isParseFailure = ( x, y ) => parseFailures.find( f => f[0] === x && f[1] === y );


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
                                    className={`puzzle__cell ${isParseFailure( x, y ) ? 'puzzle__cell--parse-failure' : ''}`}
                                    value={ num ? num : '' }
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

export const SudokuPanel = ( {
    handleFromPhotoClick
} ) => {
    const[ state, dispatch ] = useSudokuContext();

    const handleInputChange = ( value, x, y ) => {
        if( state.solved ){
            return;
        }

        dispatch({ type: 'CHANGE_INPUT', x, y, value } );
    };

    const handleClearClick = () => {
        dispatch({ type: 'CLEAR_PUZZLE' });
    }

    const handleSolveClick = () => {
        const linear_puzzle = state.inputPuzzle.reduce( ( acc, row ) => acc.concat( row ), [] );
        try{
            const linear_solution = solve_sudoku( linear_puzzle );
            const solution = [];
            
            for( let i = 0; i < 9; i++ ){
                solution.push( Array.from(linear_solution.slice( i * 9, i * 9 + 9 ) ) );
            }

            dispatch({type: 'SET_SOLUTION', solution });
        }
        catch( e ){
            dispatch({type: 'SOLVING_ERROR', errorMessage: "Sorry! I don't think your puzzle has a solution! Please check your inputs."});
        }
    }

    return <div>
        <SudokuPuzzle
            title={ state.solved ? "Your Solution" : "Your Puzzle" }
            puzzle={ state.solved ? state.solvedPuzzle : state.inputPuzzle }
            onChange = { handleInputChange }
            parseFailures = { state.parseFailures }
        />
        <div className="app-buttons">
            {
                !state.solved && <>
                    <button className="app-buttons__button" onClick={handleFromPhotoClick}>From Photo</button>
                    <button className="app-buttons__button" onClick={handleSolveClick}>Solve!</button>
                </>
            }
            {
                state.solved && <>
                    <button className="app-buttons__button" onClick={handleClearClick}>Clear</button>
                </>
            }
        </div>
        { !state.errorMessage ? null : <p>{state.errorMessage}</p> }
    </div>
}