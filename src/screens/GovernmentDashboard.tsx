import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const GovernmentDashboard = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [ws] = useState(() => new WebSocket('wss://resq-mobile.onrender.com/ws/government'));

  // Missing error handling for WebSocket connection
  useEffect(() => {
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'rescue_log') {
        // Potential error: Missing data validation
        const formattedLog = `[${new Date(data.timestamp).toLocaleString()}] Rescue at ${formatCoordinates(data.location)}`;
        setLogs(prev => [...prev, formattedLog]);
      }
    };

    return () => ws.close();
  }, []);

  const formatCoordinates = (coords: { lat: number; lng: number }) => {
    // Error: Incorrect coordinate formatting
    return `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
  };

  const verifyPrediction = (disasterType: string) => {
    const guidelines = {
      flood: {
        government: [
          "Activate emergency response teams",
          "Evacuate low-lying areas",
          "Set up relief camps",
          "Coordinate with military forces"
        ]
      }
    };

    // Error 1: Incorrect message type ('verify_prediction' instead of 'disaster_alert')
    // Error 2: Sending nested guidelines object instead of array
    // Error 3: Missing required alert ID and timestamp
    ws.send(JSON.stringify({
      type: 'verify_prediction', // Wrong message type
      disaster: disasterType,
      guidelines: guidelines[disasterType as keyof typeof guidelines] // Sending object instead of array
    }));

    setShowGuidelines(true);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Government Emergency Dashboard</Text>

      <View style={styles.sectionContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disaster Predictions</Text>
          
          <View style={styles.card}>
            <Text style={styles.disasterTitle}>🌊 Flood Prediction</Text>
            <Text>📍 Location: River Delta Region</Text>
            <Text>📊 Probability: 75%</Text>
            
            <TouchableOpacity 
              style={styles.button}
              onPress={() => verifyPrediction('flood')}
            >
              <Text style={styles.buttonText}>Verify & Broadcast</Text>
            </TouchableOpacity>

            {showGuidelines && (
              <View style={styles.guidelines}>
                <Text style={styles.guidelinesTitle}>Government Protocol:</Text>
                {[
                  "Activate emergency response teams",
                  "Evacuate low-lying areas",
                  "Set up relief camps",
                  "Coordinate with military forces"
                ].map((item, index) => (
                  <Text key={index} style={styles.guidelineItem}>• {item}</Text>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Error: Missing key prop in list rendering */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📜 System Logs</Text>
          <View style={styles.logsContainer}>
            {logs.map((log, index) => (
              <View style={styles.logEntry}>
                <Text>✓ [LOG] {log}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2f7',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#090909',
  },
  sectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
  },
  section: {
    flex: 1,
    minWidth: Dimensions.get('window').width > 768 ? 350 : '90%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: '#007bff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  disasterTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 4,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  guidelines: {
    backgroundColor: '#d9e9ff',
    padding: 15,
    marginTop: 10,
    borderRadius: 4,
  },
  guidelinesTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  guidelineItem: {
    marginLeft: 10,
  },
  logsContainer: {
    height: 400,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    padding: 10,
  },
  logEntry: {
    backgroundColor: 'white',
    padding: 10,
    marginVertical: 5,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#007bff',
  },
});

export default GovernmentDashboard;