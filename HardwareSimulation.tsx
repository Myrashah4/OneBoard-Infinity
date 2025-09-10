import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';

interface HardwareSimulationProps {
    logs: string[];
}

const HardwareSimulation: React.FC<HardwareSimulationProps> = ({ logs }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.statusIndicator}>
                    <View style={styles.greenDot} />
                    <Text style={styles.headerText}>Hardware Simulation Active</Text>
                </View>
            </View>

            <ScrollView style={styles.logContainer} showsVerticalScrollIndicator={false}>
                {logs.length === 0 ? (
                    <Text style={styles.noLogs}>Waiting for moves...</Text>
                ) : (
                    logs.map((log, index) => (
                        <Text key={index} style={styles.logText}>
                            {log}
                        </Text>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 150,
        backgroundColor: '#2d2d54',
        margin: 10,
        borderRadius: 8,
    },
    header: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    greenDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
        marginRight: 8,
    },
    headerText: {
        color: '#4CAF50',
        fontWeight: 'bold',
        fontSize: 12,
    },
    logContainer: {
        flex: 1,
        padding: 10,
    },
    logText: {
        color: '#ffffff',
        fontSize: 11,
        fontFamily: 'monospace',
        marginBottom: 2,
    },
    noLogs: {
        color: '#888',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
    },
});

export default HardwareSimulation;