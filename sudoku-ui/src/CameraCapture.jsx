import { useEffect, useRef, useState } from 'preact/hooks';

function drawOverlay( context ){
    context.beginPath();
    context.strokeStyle = '#000';
    const rectSize = window.innerWidth - 40;
    const rectX = 20,
        rectY = window.innerHeight / 2 - rectSize / 2;
    context.rect( rectX, rectY, rectSize, rectSize );
    context.stroke();

    console.log( rectX )
        console.log( rectY )
        console.log( rectSize )

    context.fillStyle = '#000a';
    context.fillRect( 0, 0, window.innerWidth, window.innerHeight / 2 - rectSize / 2 );
    context.fillRect( 0, window.innerHeight / 2 - rectSize / 2, 20, rectSize );
    context.fillRect( window.innerWidth - 20, window.innerHeight / 2 - rectSize / 2, 20, rectSize );
    context.fillRect( 0, window.innerHeight / 2 + rectSize / 2, window.innerWidth, window.innerHeight / 2 - rectSize / 2 );

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
}

function startVideoCapture( video ){
    navigator.mediaDevices
            .getUserMedia({
                video: {
                    width: window.innerHeight,
                    height: window.innerWidth,
                    facingMode: { exact: "environment" }
                },
                audio: false
            })
            .then((stream) => {
                video.current.srcObject = stream;
                video.current.play();
                video.current.height = window.innerHeight;
            })
            .catch((err) => {
                console.error(`An error occurred: ${err}`);
            });
}


export const CameraCapture = ( { onCancelClick, onPictureTaken }) => {
    const video = useRef();
    const overlayCanvas = useRef();
    const outputCanvas = useRef();

    useEffect( () => {
        overlayCanvas.current.width = window.innerWidth;
        overlayCanvas.current.height = window.innerHeight;
        const context = overlayCanvas.current.getContext("2d");
        drawOverlay( context );
        startVideoCapture( video );

        const rectSize = window.innerWidth - 40;
        outputCanvas.current.width = rectSize;
        outputCanvas.current.height = rectSize;
        
    }, [] );

    const handleTakePictureClick = () => {
        const rectSize = window.innerWidth - 40;
        const context = outputCanvas.current.getContext("2d");
        outputCanvas.current.width = rectSize;
        outputCanvas.current.height = rectSize;
        context.fillStyle = 'red';
        const sx = 20,
            sy = (window.innerHeight / 2) - (rectSize / 2),
            sSize = rectSize;
        // const sx = ( 20 / window.innerWidth ) * video.current.videoWidth,
        //     sy = ( ((window.innerHeight / 2) - (rectSize / 2) )/ window.innerHeight ) * video.current.videoHeight,
        //     sSize = ( rectSize / window.innerWidth ) * video.current.videoWidth;
        console.log( sy );
        // debugger;
        context.fillRect( 0, 0, rectSize, rectSize );
        context.drawImage( video.current, sx, sy, sSize, sSize, 0, 0, rectSize, rectSize );
        var image = new Image();
        image.src = outputCanvas.current.toDataURL();

        onPictureTaken( image );

        // console.log( outputCanvas.current.toDataURL() );

        // var w = window.open("");
        // w.document.write(image.innerHTML);
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