import { useEffect, useRef, useState } from 'preact/hooks'
import './app.css'
import init, { solve_sudoku } from './pkg/sudoku_solver.js'
import { CameraCapture } from './CameraCapture';

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
    const [ solved, setSolved ] = useState( false );
    const [ inputPuzzle, setInputPuzzle ] = useState( default_puzzle );
    const [ solvedPuzzle, setSolvedPuzzle ] = useState( null );
    const [ takingPicture, setTakingPicture ] = useState( false );
    const [ hasPhoto, setHasPhoto ] = useState( false );
    const [ photo, setPhoto ] = useState( null );

    
    useEffect(() => {
       ( async () => {
            await init();
       })();
    }, [] )

    const handleSolveClick = () => {
        const linear_puzzle = inputPuzzle.reduce( ( acc, row ) => acc.concat( row ), [] );
        const linear_solution = solve_sudoku( linear_puzzle );
        const solution = [];

        for( let i = 0; i < 9; i++ ){
            solution.push( Array.from(linear_solution.slice( i * 9, i * 9 + 9 ) ) );
        }

        setSolvedPuzzle( solution );
        setSolved( true );
        
    }

    const handleClearClick = () => {
        setInputPuzzle( empty_puzzle.map( r => r.map( i => i ) ) );
        setSolved( false );
    }

    const handleInputChange = ( value, x, y ) => {
        if( solved ){
            return;
        }
        const newPuzzle = inputPuzzle.map( row => [ ...row ] );

        if( value > 0 && value < 10 ){
            newPuzzle[ y ][ x ] = value;
        }

        setInputPuzzle( newPuzzle );
    };

    const handleFromPhotoClick = () => {
        setTakingPicture( true );
    };

    const handleCameraCaptureCancel = () => {
        setTakingPicture( false );
    }

    const handlePictureTaken = ( photo ) => {
        setPhoto( photo );
        setHasPhoto( true );
        setTakingPicture( false );
    }

    return (
        <div className='app'>
            {
                hasPhoto && <img src={photo.src} width={256} height={256} />
            }
            {
                !hasPhoto && <SudokuPuzzle title={ solved ? "Your Solution" : "Your Puzzle" } puzzle={ solved ? solvedPuzzle : inputPuzzle } onChange = { handleInputChange } />
            }
            <div className="app-buttons">
                {
                    !solved && <>
                        <button className="app-buttons__button" onClick={handleFromPhotoClick}>From Photo</button>
                        <button className="app-buttons__button" onClick={handleSolveClick}>Solve!</button>
                    </>
                }
                {
                    solved && <>
                        <button className="app-buttons__button" onClick={handleClearClick}>Clear</button>
                    </>
                }
            </div>
            { takingPicture && <CameraCapture onCancelClick={handleCameraCaptureCancel} onPictureTaken={handlePictureTaken}/> }
        </div>
    )
}
