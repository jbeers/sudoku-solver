import { useEffect, useRef, useState } from 'preact/hooks'
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

const CameraCapture = ( { onCancelClick }) => {
    const video = useRef();
    const overlayCanvas = useRef();
    const outputCanvas = useRef();

    useEffect( () => {
        const context = overlayCanvas.current.getContext("2d");
        overlayCanvas.current.width = window.innerWidth;
        overlayCanvas.current.height = window.innerHeight;
        context.beginPath();
        context.strokeStyle = '#000';
        const rectSize = window.outerWidth - 40;
        const rectX = 20,
            rectY = window.outerHeight / 2 - rectSize / 2;
        context.rect( rectX, rectY, rectSize, rectSize );
        context.stroke();

        context.fillStyle = '#000a';
        context.fillRect( 0, 0, window.outerWidth, window.outerHeight / 2 - rectSize / 2 );
        context.fillRect( 0, window.outerHeight / 2 - rectSize / 2, 20, rectSize );
        context.fillRect( window.outerWidth - 20, window.outerHeight / 2 - rectSize / 2, 20, rectSize );
        context.fillRect( 0, window.outerHeight / 2 + rectSize / 2, window.outerWidth, window.outerHeight / 2 - rectSize / 2 );

        for( var i = 1; i < 3; i++ ){
            context.beginPath();
            context.moveTo( rectX + i * ( rectSize / 3 ), rectY );
            context.lineTo( rectX + i * ( rectSize / 3 ), rectY + rectSize );
            context.stroke();

            context.beginPath();
            context.moveTo( rectX, rectY + i * ( rectSize / 3 ) );
            context.lineTo( rectX + rectSize, rectY + i * ( rectSize / 3 ) );
            context.stroke();
        }

        navigator.mediaDevices
            .getUserMedia({
                video: {
                    width: window.outerWidth,
                    height: window.outerHeight,
                    facingMode: { exact: "environment" }
                },
                audio: false
            })
            .then((stream) => {
                video.current.srcObject = stream;
                video.current.play();
            })
            .catch((err) => {
                console.error(`An error occurred: ${err}`);
            });
    }, [] );

    const handleTakePictureClick = () => {
        const rectSize = window.outerWidth - 40;
        const context = outputCanvas.current.getContext("2d");
        outputCanvas.current.width = 512;
        outputCanvas.current.height = 512;
        context.fillStyle = 'red';
        const sx = 20,
            sy = window.outerHeight / 2 - rectSize / 2;
        const sSize = window.outerWidth - 40;

        context.drawImage( video.current, sx, sy, sSize, sSize, 0, 0, 512, 512 );
        var image = new Image();
        image.src = outputCanvas.current.toDataURL();

        var w = window.open("");
        w.document.write(image.outerHTML);
    };

    const handleCancelClick = () => {
        onCancelClick();
    };

    return <div className="camera-capture">
        <video className="camera-capture__video" ref={video} >Video stream not available.</video>
        <canvas className="camera-capture__overlay-canvas" ref={overlayCanvas} />
        <canvas className="camera-capture__output-canvas" ref={outputCanvas} style={{visibility: "hidden"}}/>
        <div className="camera-capture__controls">
            <button className="app-buttons__button" onClick={handleCancelClick}>Cancel</button>
            <button className="app-buttons__button" onClick={handleTakePictureClick}>Take Picture</button>
        </div>
    </div>
}

export function App() {
    const [ solved, setSolved ] = useState( false );
    const [ inputPuzzle, setInputPuzzle ] = useState( default_puzzle );
    const [ solvedPuzzle, setSolvedPuzzle ] = useState( null );
    const [ takingPicture, setTakingPicture ] = useState( false );

    
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

    return (
        <div className='app'>
            <SudokuPuzzle title={ solved ? "Your Solution" : "Your Puzzle" } puzzle={ solved ? solvedPuzzle : inputPuzzle } onChange = { handleInputChange } />
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
            { takingPicture && <CameraCapture onCancelClick={handleCameraCaptureCancel}/> }
        </div>
    )
}
