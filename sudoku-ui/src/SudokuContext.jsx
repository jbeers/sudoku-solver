import { useContext } from 'preact/hooks';
import { createContext } from 'react';

export const SudokuContext = createContext();

export const useSudokuContext = () => {
    return useContext( SudokuContext );
}