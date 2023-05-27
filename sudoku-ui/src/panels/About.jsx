import githubLogo from '../assets/github-mark-white.svg';
import './About.css';
import { useNavigate } from 'react-router-dom';

export const AboutPanel = () => {
    const navigate = useNavigate();

    const handleGoBackClick = () => {
        navigate( '/' );
    }

    return  <div className="about">
        <div className="top-navigation">
            <h1 className="top-navigation__title">Sudoku Solver</h1>
            <a className="top-navigation__about" >About</a>
            <a href="https://github.com/jbeers/sudoku-solver"><img className="top-navigation__github" src={githubLogo}/></a>
        </div>
        <div className="about-content">
            <p>
                This app lets a user manually input a sudoku puzzle or submit an image to be processed by AWS Rekognition to automatically extract the puzzle. After the puzzle has been entered a solution is found using the Dancing Links algorithm. 
            </p>
            <p>
                The interface is written using React. The interaction with AWS Rekognition is done using a Rust based AWS Lambda function. The Sudoku solving functionality was achieved using the <a href="https://crates.io/crates/dlx-rs">dlx-rs</a> Rust library and is accessible in the app via WebAssembly. 
            </p>
            <p>
                Take a look at the readme in my github project for more information.
            </p>
            <a className='about__github' href="https://github.com/jbeers/sudoku-solver"><img src={githubLogo}/></a>
            <button className="about__goback" onClick={handleGoBackClick}>Go Back!</button>
        </div>
    </div>
}