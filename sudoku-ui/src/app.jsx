import { useEffect, useState } from 'preact/hooks'
import './app.css'
import init from './pkg/sudoku_solver.js'
import { CameraCapture } from './CameraCapture';
import githubLogo from './assets/github-mark-white.svg';
import { About } from './About';
import { default_puzzle, empty_puzzle, SudokuPanel } from './panels';
import { useReducer } from 'preact/hooks';
import { SudokuContext } from './SudokuContext';

async function requestSolution( photoBlob ){
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", photoBlob.type );
    const response = await fetch( 'https://q6nxqmkx5n6md6wjs2j3it6gde0tywiv.lambda-url.us-west-1.on.aws/', {
        headers: myHeaders,
        method: 'POST',
        body: photoBlob
    });

    return response.json();
}

const initial_state = {
    solved: false,
    inputPuzzle: default_puzzle,
    solvedPuzzle: null,
    parseFailures: [],
    errorMessage: null
}

function reducer( state, action ){
    if( action.type === 'ERROR' ){
        return { ...state, errorMessage: action.errorMessage }
    }
    else if( action.type === "SET_SOLUTION" ){
        return {
            ...state,
            solvedPuzzle: action.solution,
            solved: true,
            parseFailures: [],
            errorMessage: null
        };
    }
    else if( action.type === "SOLVING_ERROR" ){
        return {
            ...state,
            solved: false,
            parseFailures: [],
            errorMessage: "Sorry! I don't think your puzzle has a solution! Please check your inputs."
        };
    }
    else if( action.type === "CLEAR_PUZZLE" ){
        return {
            ...state,
            inputPuzzle: empty_puzzle.map( r => r.map( i => i ) ),
            solvedPuzzle: null,
            solved: false
        };
    }
    else if ( action.type === 'CHANGE_INPUT' ){
        const newPuzzle = state.inputPuzzle.map( row => [ ...row ] );

        if( action.value > 0 && action.value < 10 ){
            newPuzzle[ action.y ][ action.x ] = action.value;
        }
        
        return {
            ...state,
            inputPuzzle: newPuzzle,
            parseFailures: state.parseFailures.filter( f => !( f[0] === action.x && f[1] === action.y ) )
        };
    }
    else if( action.type === 'HANDLE_API_RESPONSE' ){
        return {
            ...state,
            inputPuzzle: action.response.board,
            parseFailures: action.response.parse_failures
        };
    }
    else if( action.type === 'HANDLE_API_ERROR' ){
        return {
            ...state,
            inputPuzzle: empty_puzzle.map( r => r.map( i => i ) ),
            errorMessage: 'Unable to contact the API. Please enter your puzzle manually.'
        };
    }

    return { ...state };
}

export function App() {
    const [ takingPicture, setTakingPicture ] = useState( false );
    const [ showAbout, setShowAbout ] = useState( false );
    const [ state, dispatch ] = useReducer( reducer, initial_state );

    
    useEffect(() => {
       ( async () => {
            await init();
       })();
    }, [] )

    useEffect(() => {
        if( state.parseFailures.length ){
            dispatch({type: 'ERROR', errorMessage: 'Some numbers were unable to be parsed. Please check your inputs.'});
        }
        
    }, [state.parseFailures] );


    const handleFromPhotoClick = () => {
        setTakingPicture( true );
    };

    const handleCameraCaptureCancel = () => {
        setTakingPicture( false );
    }

    const handlePictureTaken = async ( photoBlob ) => {
       
        try{
            const response = await requestSolution( photoBlob );
            dispatch({ type: 'HANDLE_API_RESPONSE', response } )
            setTakingPicture( false );
        }
        catch( e ){
            dispatch({ type: 'HANDLE_API_ERROR' } )
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
            <SudokuContext.Provider value={[state, dispatch]}>
                <div className="top-navigation">
                    <h1 className="top-navigation__title">Sudoku Solver<span className="top-navigation__beta-tag">BETA</span></h1>
                    <a className="top-navigation__about" onClick={handleAboutClick}>About</a>
                    <a href="https://github.com/jbeers/sudoku-solver"><img className="top-navigation__github" src={githubLogo}/></a>
                </div>
                <SudokuPanel
                    handleFromPhotoClick = { handleFromPhotoClick }
                />
                { takingPicture && <CameraCapture onCancelClick={handleCameraCaptureCancel} onPictureTaken={handlePictureTaken}/> }
                { showAbout && <About onComplete={handleAboutDone}/>}
            </SudokuContext.Provider>
        </div>
    )
}
