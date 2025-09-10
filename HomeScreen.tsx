import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    SafeAreaView,
    Animated,
    Dimensions,
    ImageBackground,
} from 'react-native';
import SocketService from '../services/SocketService';

const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
    navigation: any;
}


const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [connecting, setConnecting] = useState(false);

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-50)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Start animations on mount
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        // Continuous pulse animation for connect button
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulseAnimation.start();

        // Floating animation for chess pieces
        const floatAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 3000,
                    useNativeDriver: true,
                }),
            ])
        );
        floatAnimation.start();

        return () => {
            pulseAnimation.stop();
            floatAnimation.stop();
        };
    }, []);

    const handleConnect = async () => {
        if (!username.trim()) {
            Alert.alert('Error', 'Please enter a username');
            return;
        }

        setConnecting(true);
        const connected = await SocketService.connect();

        if (connected) {
            navigation.navigate('Lobby', { username });
        } else {
            Alert.alert('Connection Failed', 'Could not connect to server');
        }
        setConnecting(false);
    };

    const floatingTranslateY = floatAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -10],
    });

    return (
        <SafeAreaView style={styles.container}>
            {/* Animated Background Elements */}
            <View style={styles.backgroundElements}>
                <Animated.View
                    style={[
                        styles.chesspiece,
                        styles.piece1,
                        { transform: [{ translateY: floatingTranslateY }] }
                    ]}
                >
                    <Text style={styles.chessPieceText}>♛</Text>
                </Animated.View>
                <Animated.View
                    style={[
                        styles.chesspiece,
                        styles.piece2,
                        { transform: [{ translateY: floatingTranslateY }] }
                    ]}
                >
                    <Text style={styles.chessPieceText}>♞</Text>
                </Animated.View>
                <Animated.View
                    style={[
                        styles.chesspiece,
                        styles.piece3,
                        { transform: [{ translateY: floatingTranslateY }] }
                    ]}
                >
                    <Text style={styles.chessPieceText}>♜</Text>
                </Animated.View>
            </View>

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim }
                        ],
                    },
                ]}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>One Board Infinity</Text>
                    <View style={styles.titleUnderline} />
                    <Text style={styles.subtitle}>Play board games anywhere in the world</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Enter Username:</Text>
                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Your username"
                            placeholderTextColor="#888"
                            maxLength={20}
                        />
                    </View>

                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                        <TouchableOpacity
                            style={[styles.button, connecting && styles.buttonDisabled]}
                            onPress={handleConnect}
                            disabled={connecting}
                        >
                            <Text style={styles.buttonText}>
                                {connecting ? 'Connecting...' : '🚀 Enter Game Lobby'}
                            </Text>
                            {connecting && <View style={styles.loadingDot} />}
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                <View style={styles.features}>
                    <Text style={styles.featureTitle}>✨ Features</Text>
                    <View style={styles.featuresList}>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureIcon}>♟️</Text>
                            <Text style={styles.feature}>Real-time multiplayer chess</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureIcon}>⚡</Text>
                            <Text style={styles.feature}>Smart matchmaking system</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureIcon}>🎮</Text>
                            <Text style={styles.feature}>Hardware-controlled board simulation</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureIcon}>🌍</Text>
                            <Text style={styles.feature}>Play with anyone, anywhere</Text>
                        </View>
                    </View>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
};

export default HomeScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a1a',
    },
    backgroundElements: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    chesspiece: {
        position: 'absolute',
        opacity: 0.1,
    },
    piece1: {
        top: height * 0.15,
        right: width * 0.1,
    },
    piece2: {
        bottom: height * 0.25,
        left: width * 0.05,
    },
    piece3: {
        top: height * 0.4,
        left: width * 0.8,
    },
    chessPieceText: {
        fontSize: 80,
        color: '#4CAF50',
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        textShadowColor: '#4CAF50',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    titleUnderline: {
        width: 100,
        height: 3,
        backgroundColor: '#4CAF50',
        marginTop: 8,
        marginBottom: 15,
        borderRadius: 2,
    },
    subtitle: {
        fontSize: 16,
        color: '#aaa',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    card: {
        backgroundColor: 'rgba(45, 45, 84, 0.9)',
        padding: 25,
        borderRadius: 20,
        marginBottom: 30,
        shadowColor: '#4CAF50',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.3)',
    },
    inputContainer: {
        marginBottom: 25,
    },
    label: {
        fontSize: 16,
        color: '#ffffff',
        marginBottom: 10,
        fontWeight: '600',
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        padding: 18,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.5)',
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#4CAF50',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
        position: 'relative',
        overflow: 'hidden',
    },
    buttonDisabled: {
        backgroundColor: '#666',
        shadowOpacity: 0.2,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loadingDot: {
        position: 'absolute',
        right: 20,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ffffff',
    },
    features: {
        backgroundColor: 'rgba(45, 45, 84, 0.7)',
        padding: 25,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.2)',
    },
    featureTitle: {
        color: '#4CAF50',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    featuresList: {
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
    },
    featureIcon: {
        fontSize: 20,
        marginRight: 12,
        width: 30,
    },
    feature: {
        color: '#ffffff',
        fontSize: 15,
        flex: 1,
        fontWeight: '500',
    },
});