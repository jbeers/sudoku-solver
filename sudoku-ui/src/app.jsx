import { useEffect, useRef, useState } from 'preact/hooks'
import './app.css'
import init, { solve_sudoku } from './pkg/sudoku_solver.js'
import { CameraCapture } from './CameraCapture';
import githubLogo from './assets/github-mark-white.svg';
import { About } from './About';

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

async function requestSolution( photoBlob ){
    return {
        "board": [
            [
                3,
                1,
                5,
                7,
                6,
                0,
                2,
                0,
                0
            ],
            [
                0,
                0,
                0,
                3,
                2,
                0,
                0,
                1,
                0
            ],
            [
                0,
                6,
                9,
                5,
                8,
                0,
                4,
                3,
                7
            ],
            [
                0,
                8,
                0,
                0,
                0,
                3,
                0,
                0,
                0
            ],
            [
                0,
                0,
                0,
                6,
                0,
                0,
                9,
                0,
                8
            ],
            [
                9,
                0,
                1,
                0,
                0,
                0,
                0,
                6,
                4
            ],
            [
                8,
                0,
                3,
                0,
                0,
                6,
                7,
                0,
                0
            ],
            [
                0,
                9,
                2,
                1,
                0,
                7,
                0,
                0,
                0
            ],
            [
                0,
                0,
                0,
                9,
                0,
                0,
                0,
                4,
                0
            ]
        ],
        "message": "parse failure",
        "parse_failures": [
            [
                8,
                0
            ]
        ]
    };
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", photoBlob.type );
    const response = await fetch( 'https://q6nxqmkx5n6md6wjs2j3it6gde0tywiv.lambda-url.us-west-1.on.aws/', {
        headers: myHeaders,
        method: 'POST',
        body: photoBlob
    });

    return response.json();
}

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
    const [ parseFailures, setParseFailures ] = useState( [] );
    const [ solvedPuzzle, setSolvedPuzzle ] = useState( null );
    const [ takingPicture, setTakingPicture ] = useState( false );
    const [ errorMessage, setErrorMessage ] = useState( null );
    const [ showAbout, setShowAbout ] = useState( false );

    
    useEffect(() => {
       ( async () => {
            await init();
       })();
    }, [] )

    useEffect(() => {
        if( parseFailures.length ){
            setErrorMessage( 'Some numbers were unable to be parsed. Please check your inputs.' );
        }
        
    }, [parseFailures] );

    const handleSolveClick = () => {
        const linear_puzzle = inputPuzzle.reduce( ( acc, row ) => acc.concat( row ), [] );
        try{
            const linear_solution = solve_sudoku( linear_puzzle );
            const solution = [];
            
            for( let i = 0; i < 9; i++ ){
                solution.push( Array.from(linear_solution.slice( i * 9, i * 9 + 9 ) ) );
            }
            
            setSolvedPuzzle( solution );
            setParseFailures( [] );
            setSolved( true );
        }
        catch( e ){
            setParseFailures( [] );
            setErrorMessage( "Sorry! I don't think your puzzle has a solution! Please check your inputs." );
        }
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
        setParseFailures( parseFailures.filter( f => !( f[0] === x && f[1] === y ) ) );
    };

    const handleFromPhotoClick = () => {
        setTakingPicture( true );
    };

    const handleCameraCaptureCancel = () => {
        setTakingPicture( false );
    }

    const handlePictureTaken = async ( photoBlob ) => {
       
        try{
            const res = await requestSolution( photoBlob );
            setInputPuzzle( res.board );
            setParseFailures( res.parse_failures );
            setTakingPicture( false );
        }
        catch( e ){
            setInputPuzzle( empty_puzzle.map( r => r.map( i => i ) ) );
            setTakingPicture( false );
        }
    }

    const handleAboutClick = (e) => {
        e.preventDefault();

        setShowAbout( true );
    }

    const handleAboutDone = () =>{
        setShowAbout( false );
    }

    return (
        <div className='app'>
            <div className="top-navigation">
                <h1 className="top-navigation__title">Sudoku Solver<span className="top-navigation__beta-tag">BETA</span></h1>
                <a className="top-navigation__about" onClick={handleAboutClick}>About</a>
                <a href="https://github.com/jbeers/sudoku-solver"><img className="top-navigation__github" src={githubLogo}/></a>
            </div>
            <SudokuPanel
                solved={ solved }
                solvedPuzzle={solvedPuzzle}
                inputPuzzle={inputPuzzle}
                handleInputChange={handleInputChange}
                parseFailures={parseFailures}
                handleFromPhotoClick = { handleFromPhotoClick }
                handleSolveClick = { handleSolveClick }
                handleClearClick = { handleClearClick }
                errorMessage = { errorMessage }
            />
            { takingPicture && <CameraCapture onCancelClick={handleCameraCaptureCancel} onPictureTaken={handlePictureTaken}/> }
            { showAbout && <About onComplete={handleAboutDone}/>}
        </div>
    )
}

const SudokuPanel = ( {
    solved,
    solvedPuzzle,
    inputPuzzle,
    handleInputChange,
    parseFailures,
    handleFromPhotoClick,
    handleSolveClick,
    handleClearClick,
    errorMessage
} ) => {
    return <div>
        <SudokuPuzzle
            title={ solved ? "Your Solution" : "Your Puzzle" }
            puzzle={ solved ? solvedPuzzle : inputPuzzle }
            onChange = { handleInputChange }
            parseFailures = { parseFailures }
        />
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
        { !errorMessage ? null : <p>{errorMessage}</p> }
    </div>
}