import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    Animated,
    Dimensions,
} from 'react-native';
import SocketService from '../services/SocketService';

const { width } = Dimensions.get('window');

interface LobbyScreenProps {
    navigation: any;
    route: any;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ navigation, route }) => {
    const [searching, setSearching] = useState(false);
    const [queuePosition, setQueuePosition] = useState(0);
    const { username } = route.params;

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const searchPulseAnim = useRef(new Animated.Value(1)).current;
    const dotAnimations = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]).current;
    const cardScaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        // Initial animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(cardScaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        if (searching) {
            // Start search pulse animation
            const pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(searchPulseAnim, {
                        toValue: 1.1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(searchPulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulseAnimation.start();

            // Start loading dots animation
            const dotAnimation = Animated.loop(
                Animated.stagger(200,
                    dotAnimations.map(anim =>
                        Animated.sequence([
                            Animated.timing(anim, {
                                toValue: 1,
                                duration: 400,
                                useNativeDriver: true,
                            }),
                            Animated.timing(anim, {
                                toValue: 0,
                                duration: 400,
                                useNativeDriver: true,
                            }),
                        ])
                    )
                )
            );
            dotAnimation.start();

            return () => {
                pulseAnimation.stop();
                dotAnimation.stop();
            };
        }
    }, [searching]);

    const handleFindGame = async () => {
        setSearching(true);

        // Set up game start listener
        SocketService.onGameStarted((gameData) => {
            console.log('Game started:', gameData);
            navigation.navigate('Game', {
                gameData,
                username,
                playerId: SocketService.getSocketId()
            });
            setSearching(false);
        });

        // Join queue
        const queueData = await SocketService.joinQueue(username, 'chess');
        if (queueData) {
            setQueuePosition((queueData as any).position);
        }
    };

    const handleCancelSearch = () => {
        setSearching(false);
        setQueuePosition(0);
        // Reset animations
        searchPulseAnim.setValue(1);
        dotAnimations.forEach(anim => anim.setValue(0));
        // TODO: Implement cancel queue functionality
    };

    const gameTypes = [
        {
            id: 'chess',
            icon: '♟️',
            title: 'Chess',
            description: 'Classic chess game for 2 players',
            features: ['Turn-based strategy', '5 min per turn limit', 'Automatic hardware movement'],
            color: '#4CAF50',
            gradient: ['#4CAF50', '#45a049']
        },
        {
            id: 'checkers',
            icon: '🔴',
            title: 'Checkers',
            description: 'Traditional checkers game for 2 players',
            features: ['Jump-based captures', '3 min per turn limit', 'King promotion system'],
            color: '#FF5722',
            gradient: ['#FF5722', '#E64A19']
        },
        {
            id: 'tic-tac-toe',
            icon: '❌',
            title: 'Tic Tac Toe',
            description: 'Quick 3x3 grid game for 2 players',
            features: ['Fast-paced gameplay', '30 sec per turn', 'Best of 3 rounds'],
            color: '#2196F3',
            gradient: ['#2196F3', '#1976D2']
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <Animated.ScrollView
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
                contentContainerStyle={{ paddingBottom: 50 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.welcome}>Welcome back! 👋</Text>
                    <Text style={styles.username}>{username}</Text>
                </View>

                <View style={styles.gameSelection}>
                    <Text style={styles.sectionTitle}>🎮 Select Game Type</Text>

                    {gameTypes.map((game, index) => (
                        <Animated.View
                            key={game.id}
                            style={[
                                styles.gameCard,
                                {
                                    transform: [{ scale: cardScaleAnim }],
                                    borderColor: game.color + '30',
                                }
                            ]}
                        >
                            <View style={styles.gameHeader}>
                                <Text style={styles.gameIcon}>{game.icon}</Text>
                                <View style={styles.gameInfo}>
                                    <Text style={styles.gameTitle}>{game.title}</Text>
                                    <Text style={styles.gameDescription}>{game.description}</Text>
                                </View>
                            </View>

                            <View style={styles.gameFeatures}>
                                {game.features.map((feature, idx) => (
                                    <View key={idx} style={styles.featureRow}>
                                        <View style={[styles.featureDot, { backgroundColor: game.color }]} />
                                        <Text style={styles.gameFeature}>{feature}</Text>
                                    </View>
                                ))}
                            </View>

                            {game.id === 'chess' && (
                                <View style={styles.gameActions}>
                                    {!searching ? (
                                        <TouchableOpacity
                                            style={[styles.findGameButton, { backgroundColor: game.color }]}
                                            onPress={handleFindGame}
                                        >
                                            <Text style={styles.findGameText}>🔍 Find Game</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <Animated.View
                                            style={[
                                                styles.searchingContainer,
                                                { transform: [{ scale: searchPulseAnim }] }
                                            ]}
                                        >
                                            <View style={styles.searchingHeader}>
                                                <Text style={styles.searchingText}>Searching for opponent</Text>
                                                <View style={styles.loadingDots}>
                                                    {dotAnimations.map((anim, idx) => (
                                                        <Animated.View
                                                            key={idx}
                                                            style={[
                                                                styles.loadingDot,
                                                                {
                                                                    opacity: anim,
                                                                    transform: [{ scale: anim }],
                                                                }
                                                            ]}
                                                        />
                                                    ))}
                                                </View>
                                            </View>
                                            <Text style={styles.queueText}>Queue position: #{queuePosition}</Text>
                                            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSearch}>
                                                <Text style={styles.cancelText}>❌ Cancel Search</Text>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    )}
                                </View>
                            )}

                            {game.id !== 'chess' && (
                                <View style={styles.gameActions}>
                                    <TouchableOpacity
                                        style={[styles.comingSoonButton, { borderColor: game.color }]}
                                        disabled={true}
                                    >
                                        <Text style={[styles.comingSoonText, { color: game.color }]}>
                                            🚧 Coming Soon
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </Animated.View>
                    ))}
                </View>

                <View style={styles.hardwareStatus}>
                    <Text style={styles.statusTitle}>🔧 Hardware Status</Text>
                    <View style={styles.statusCard}>
                        <View style={styles.statusIndicator}>
                            <Animated.View style={[styles.statusDot, styles.greenDot]} />
                            <Text style={styles.statusText}>Board Ready - Simulation Mode</Text>
                        </View>
                        <Text style={styles.statusDetails}>
                            Physical board simulation active. All moves will be demonstrated with animated hardware commands.
                        </Text>
                    </View>
                </View>
            </Animated.ScrollView>
        </SafeAreaView>
    );
};

export default LobbyScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a1a',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginBottom: 30,
        alignItems: 'center',
    },
    welcome: {
        fontSize: 24,
        color: '#ffffff',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    username: {
        fontSize: 18,
        color: '#4CAF50',
        fontWeight: '600',
        textShadowColor: '#4CAF50',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    gameSelection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        color: '#4CAF50',
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    gameCard: {
        backgroundColor: 'rgba(45, 45, 84, 0.9)',
        padding: 20,
        borderRadius: 16,
        marginBottom: 15,
        borderWidth: 2,
        shadowColor: '#4CAF50',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    gameHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    gameIcon: {
        fontSize: 30,
        marginRight: 15,
    },
    gameInfo: {
        flex: 1,
    },
    gameTitle: {
        fontSize: 20,
        color: '#ffffff',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    gameDescription: {
        fontSize: 14,
        color: '#ccc',
    },
    gameFeatures: {
        marginBottom: 15,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    featureDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 10,
    },
    gameFeature: {
        fontSize: 13,
        color: '#aaa',
        flex: 1,
    },
    gameActions: {
        alignItems: 'center',
    },
    findGameButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        minWidth: 150,
        alignItems: 'center',
        shadowColor: '#4CAF50',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 4,
    },
    findGameText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    comingSoonButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        borderWidth: 2,
        minWidth: 150,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    comingSoonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    searchingContainer: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.3)',
        minWidth: 250,
    },
    searchingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    searchingText: {
        color: '#ffffff',
        fontSize: 16,
        marginRight: 10,
        fontWeight: '600',
    },
    loadingDots: {
        flexDirection: 'row',
    },
    loadingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
        marginHorizontal: 2,
    },
    queueText: {
        color: '#4CAF50',
        fontSize: 14,
        marginBottom: 15,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#ff4444',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        shadowColor: '#ff4444',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    cancelText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    hardwareStatus: {
        marginTop: 10,
    },
    statusTitle: {
        color: '#4CAF50',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'center',
    },
    statusCard: {
        backgroundColor: 'rgba(45, 45, 84, 0.7)',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.2)',
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 10,
    },
    greenDot: {
        backgroundColor: '#4CAF50',
        shadowColor: '#4CAF50',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 2,
    },
    statusText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    statusDetails: {
        color: '#aaa',
        fontSize: 12,
        fontStyle: 'italic',
        lineHeight: 16,
    },
});