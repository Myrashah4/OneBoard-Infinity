import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import GameBoard from '../components/GameBoard';
import HardwareSimulation from '../components/HardwareSimulation';
import SocketService from '../services/SocketService';

interface GameScreenProps {
    navigation: any;
    route: any;
}

const GameScreen: React.FC<GameScreenProps> = ({ navigation, route }) => {
    const [gameState, setGameState] = useState<any>(null);
    const [hardwareLogs, setHardwareLogs] = useState<string[]>([]);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const { gameData, username, playerId } = route.params;

    useEffect(() => {
        // Initialize game state
        setGameState(gameData);
        setIsMyTurn(gameData.currentPlayer === playerId);

        // Listen for move updates
        SocketService.onMoveExecuted((moveData) => {
            console.log('Move executed:', moveData);
            setGameState(moveData.gameState);
            setIsMyTurn(moveData.nextPlayer === playerId);

            // Add hardware simulation log
            addHardwareLog(`🤖 Moving piece: ${moveData.move.from} → ${moveData.move.to}`);
            setTimeout(() => {
                addHardwareLog(`✅ Hardware movement completed`);
            }, 2000);
        });
    }, []);

    const addHardwareLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setHardwareLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 10));
    };

    const handleMove = (move: any) => {
        if (!isMyTurn) return;

        addHardwareLog(`📤 Sending move command to hardware...`);
        SocketService.makeMove(gameState.id, move);
        setIsMyTurn(false);
    };

    const getPlayerInfo = () => {
        if (!gameState) return null;

        const myPlayer = gameState.players.find((p: any) => p.id === playerId);
        const opponent = gameState.players.find((p: any) => p.id !== playerId);

        return { myPlayer, opponent };
    };

    const playerInfo = getPlayerInfo();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Chess Game</Text>
                {playerInfo && (
                    <View style={styles.playerInfo}>
                        <Text style={styles.playerText}>
                            You: {playerInfo.myPlayer?.username} ({playerInfo.myPlayer?.color})
                        </Text>
                        <Text style={styles.playerText}>
                            Opponent: {playerInfo.opponent?.username} ({playerInfo.opponent?.color})
                        </Text>
                        <Text style={[styles.turnText, isMyTurn ? styles.myTurn : styles.waitingTurn]}>
                            {isMyTurn ? "Your Turn" : "Opponent's Turn"}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.gameArea}>
                <GameBoard
                    board={gameState?.board}
                    onMove={handleMove}
                    disabled={!isMyTurn}
                    playerColor={playerInfo?.myPlayer?.color}
                />
            </View>

            <HardwareSimulation logs={hardwareLogs} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    header: {
        padding: 15,
        backgroundColor: '#2d2d54',
    },
    title: {
        fontSize: 20,
        color: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    playerInfo: {
        marginTop: 10,
        alignItems: 'center',
    },
    playerText: {
        color: '#ccc',
        fontSize: 12,
    },
    turnText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 5,
    },
    myTurn: {
        color: '#4CAF50',
    },
    waitingTurn: {
        color: '#ff9800',
    },
    gameArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
});

export default GameScreen;