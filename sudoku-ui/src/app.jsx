import { render } from 'preact'
import { useEffect, useReducer } from 'preact/hooks'
import { Outlet, RouterProvider, createHashRouter, useNavigate } from 'react-router-dom';
import init from './pkg/sudoku_solver.js'
import githubLogo from './assets/github-mark-white.svg';
import { default_puzzle, empty_puzzle, SudokuPanel, AboutPanel, CameraCapturePanel } from './panels';
import { SudokuContext } from './SudokuContext';
import './app.css'

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

const Root = () => {
    const navigate = useNavigate();

    const handleAboutClick = (e) => {
        e.preventDefault();

        navigate( '/about' );
    }

    return <div className='app'>
        <div className="top-navigation">
            <h1 className="top-navigation__title">Sudoku Solver<span className="top-navigation__beta-tag">BETA</span></h1>
            <a className="top-navigation__about" onClick={handleAboutClick}>About</a>
            <a href="https://github.com/jbeers/sudoku-solver"><img className="top-navigation__github" src={githubLogo}/></a>
        </div>
        <Outlet />
    </div>
}

const routes = createHashRouter([
    {
        path: '/',
        element: <Root />,
        children: [
            {
                path: '',
                element: <SudokuPanel />
            },
            {
                path: '/about',
                element: <AboutPanel />
            },
            {
                path: '/capture',
                element: <CameraCapturePanel />
            }
        ]
    }
]);



const App = () => {
    const [ state, dispatch ] = useReducer( reducer, initial_state );
    
    useEffect(() => {
       ( async () => {
            await init();
       })();
    }, [] )

    return <SudokuContext.Provider value={[state, dispatch]}>
        <RouterProvider router={routes} />
    </SudokuContext.Provider>
}

render(<App />, document.getElementById('app'))