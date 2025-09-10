import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';

interface GameBoardProps {
    board: string[][];
    onMove: (move: any) => void;
    disabled: boolean;
    playerColor: string;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, onMove, disabled, playerColor }) => {
    const [selectedSquare, setSelectedSquare] = useState<{row: number, col: number} | null>(null);
    const screenWidth = Dimensions.get('window').width;
    const boardSize = screenWidth - 40;
    const squareSize = boardSize / 8;

    if (!board) {
        return (
            <View style={[styles.container, { width: boardSize, height: boardSize }]}>
                <Text style={styles.loadingText}>Loading game...</Text>
            </View>
        );
    }

    const handleSquarePress = (row: number, col: number) => {
        if (disabled) return;

        if (selectedSquare) {
            // Make move
            const move = {
                from: `${String.fromCharCode(97 + selectedSquare.col)}${8 - selectedSquare.row}`,
                to: `${String.fromCharCode(97 + col)}${8 - row}`,
                piece: board[selectedSquare.row][selectedSquare.col]
            };

            onMove(move);
            setSelectedSquare(null);
        } else {
            // Select piece
            if (board[row][col] !== '.') {
                setSelectedSquare({ row, col });
            }
        }
    };

    const getPieceEmoji = (piece: string) => {
        const pieceMap: { [key: string]: string } = {
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
        };
        return pieceMap[piece] || '';
    };

    const isSelected = (row: number, col: number) => {
        return selectedSquare?.row === row && selectedSquare?.col === col;
    };

    const renderSquare = (row: number, col: number) => {
        const isLight = (row + col) % 2 === 0;
        const piece = board[row][col];

        return (
            <TouchableOpacity
                key={`${row}-${col}`}
                style={[
                    styles.square,
                    { width: squareSize, height: squareSize },
                    isLight ? styles.lightSquare : styles.darkSquare,
                    isSelected(row, col) && styles.selectedSquare,
                ]}
                onPress={() => handleSquarePress(row, col)}
                disabled={disabled}
            >
                <Text style={styles.piece}>
                    {getPieceEmoji(piece)}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { width: boardSize, height: boardSize }]}>
            {board.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                    {row.map((_, colIndex) => renderSquare(rowIndex, colIndex))}
                </View>
            ))}
            {disabled && <View style={styles.disabledOverlay} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderWidth: 2,
        borderColor: '#4CAF50',
        borderRadius: 8,
    },
    row: {
        flexDirection: 'row',
    },
    square: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: '#333',
    },
    lightSquare: {
        backgroundColor: '#f0d9b5',
    },
    darkSquare: {
        backgroundColor: '#b58863',
    },
    selectedSquare: {
        backgroundColor: '#7fb069',
    },
    piece: {
        fontSize: 24,
    },
    loadingText: {
        color: '#ffffff',
        textAlign: 'center',
        marginTop: 50,
    },
    disabledOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
});

export default GameBoard;