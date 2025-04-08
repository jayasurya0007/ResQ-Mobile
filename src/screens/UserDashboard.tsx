import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Modal,
  Dimensions 
} from 'react-native';
import * as Location from 'expo-location';
import Svg, { Path, Circle, G } from 'react-native-svg';

interface EmergencyAlert {
  id: string;
  content: string;
  guidelines: string[];
  timestamp: Date;
}

interface Resource {
  id: string;
  name: string;
  type: 'shelter' | 'medical' | 'food';
  location: string;
  timestamp: Date;
}

const UserDashboard = () => {
  const [activePanel, setActivePanel] = useState<'alerts' | 'resources' | null>(null);
  const [sosStatus, setSosStatus] = useState<'idle' | 'locating' | 'requested' | 'accepted' | 'rescued'>('idle');
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [showLocationError, setShowLocationError] = useState(false);
  const [ws] = useState(() => new WebSocket('wss://resq-mobile.onrender.com/ws/user'));

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setShowLocationError(true);
      }
    })();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch(data.type) {
        case 'disaster_alert':
          setAlerts(prev => [{
            id: data.id,
            content: data.content,
            guidelines: data.guidelines,
            timestamp: new Date(data.timestamp)
          }, ...prev]);
          break;
          
        case 'resource_update':
          setResources(prev => [{
            id: data.resource.id,
            name: data.resource.name,
            type: data.resource.type,
            location: data.resource.location,
            timestamp: new Date()
          }, ...prev]);
          break;
          
        case 'sos_accepted':
          setSosStatus('accepted');
          break;
          
        case 'rescued_notification':
          setSosStatus('rescued');
          setTimeout(() => setSosStatus('idle'), 30000);
          break;
      }
    };

    return () => ws.close();
  }, []);

  const handleSOS = async () => {
    setSosStatus('locating');
    
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      ws.send(JSON.stringify({
        type: 'sos_request',
        requestId: Date.now().toString(),
        location: {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        },
        timestamp: new Date().toISOString()
      }));
      
      setSosStatus('requested');
    } catch (error) {
      setShowLocationError(true);
      setSosStatus('idle');
    }
  };

  const getButtonState = () => {
    switch(sosStatus) {
      case 'locating': return { text: 'LOCATING...', color: '#dc2626', disabled: true };
      case 'requested': return { text: 'HELP REQUESTED...', color: '#dc2626', disabled: true };
      case 'accepted': return { text: 'HELP IS COMING!', color: '#f59e0b', disabled: true };
      case 'rescued': return { text: 'RESCUED 🎉', color: '#16a34a', disabled: false };
      default: return { text: 'SOS EMERGENCY', color: '#dc2626', disabled: false };
    }
  };

  const ResourceIcon = ({ type }: { type: Resource['type'] }) => {
    const iconProps = { stroke: 'currentColor', strokeWidth: 2 };
    
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        {type === 'shelter' ? (
          <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" {...iconProps} />
        ) : type === 'medical' ? (
          <G {...iconProps}>
            <Path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </G>
        ) : (
          <G {...iconProps}>
            <Path d="M12 3v1m0 16v1m9-9h-1M4 12H3m18.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </G>
        )}
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      {/* SOS Button */}
      <View style={styles.sosContainer}>
        <TouchableOpacity
          style={[
            styles.sosButton,
            { 
              backgroundColor: getButtonState().color,
              width: Dimensions.get('window').width * 0.7,
              height: Dimensions.get('window').width * 0.7
            }
          ]}
          onPress={handleSOS}
          disabled={getButtonState().disabled}
        >
          <Text style={styles.sosButtonText}>{getButtonState().text}</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation */}
      <View style={styles.navContainer}>
        <TouchableOpacity
          style={[styles.navButton, activePanel === 'alerts' && styles.activeNavButton]}
          onPress={() => setActivePanel(activePanel === 'alerts' ? null : 'alerts')}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <Path d="M10 5.91667C10 5.09672 10.3582 4.31947 10.9763 3.76822C11.5944 3.21697 12.4163 2.94444 13.2631 3.01278C14.5611 3.12262 15.7733 3.66823 16.69 4.55151C17.6067 5.4348 18.1696 6.59693 18.28 7.83333C18.28 9.66667 18 10.5 18 10.5H6C6 10.5 5.72 9.66667 5.72 7.83333C5.83044 6.59693 6.39333 5.4348 7.31004 4.55151C8.22675 3.66823 9.43893 3.12262 10.7369 3.01278C11.5837 2.94444 12.4056 3.21697 13.0237 3.76822C13.6418 4.31947 14 5.09672 14 5.91667M10 10.5V14.8333L8 16.5M14 10.5V14.8333L16 16.5" strokeWidth={2} />
          </Svg>
          <Text style={styles.navButtonText}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, activePanel === 'resources' && styles.activeNavButton]}
          onPress={() => setActivePanel(activePanel === 'resources' ? null : 'resources')}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <Path d="M12 2L3 7V17L12 22L21 17V7L12 2ZM12 12.5C11.7239 12.5 11.5 12.2761 11.5 12C11.5 11.7239 11.7239 11.5 12 11.5C12.2761 11.5 12.5 11.7239 12.5 12C12.5 12.2761 12.2761 12.5 12 12.5ZM12 15.5C11.7239 15.5 11.5 15.2761 11.5 15C11.5 14.7239 11.7239 14.5 12 14.5C12.2761 14.5 12.5 14.7239 12.5 15C12.5 15.2761 12.2761 15.5 12 15.5Z" strokeWidth={2} />
          </Svg>
          <Text style={styles.navButtonText}>Resources</Text>
        </TouchableOpacity>
      </View>

      {/* Panels */}
      {activePanel && (
        <View style={styles.panelContainer}>
          <ScrollView style={styles.panelContent}>
            <Text style={styles.panelTitle}>
              {activePanel === 'alerts' ? 'Emergency Alerts' : 'Available Resources'}
            </Text>

            {activePanel === 'alerts' ? (
                alerts.map(alert => (
                  <View key={alert.id} style={styles.alertCard}>
                    <View style={styles.alertHeader}>
                      <Text style={styles.alertTitle}>{alert.content}</Text>
                      <Text style={styles.alertTime}>
                        {alert.timestamp.toLocaleTimeString()}
                      </Text>
                    </View>
                    <Text style={styles.instructionsText}>Safety instructions:</Text>
                    {alert.guidelines.map((guideline, index) => (
                      <Text 
                        key={`${alert.id}-guideline-${index}`} 
                        style={styles.guideline}
                      >
                        • {guideline}
                      </Text>
                    ))}
                  </View>
                ))
              ) : (
                resources.map(resource => (
                  <View 
                    key={`${resource.id}-${resource.timestamp.getTime()}`} 
                    style={styles.resourceCard}
                  >
                    <View style={styles.resourceIcon}>
                      <ResourceIcon type={resource.type} />
                    </View>
                    <View style={styles.resourceDetails}>
                      <Text style={styles.resourceName}>{resource.name}</Text>
                      <Text style={styles.resourceType}>{resource.type.toUpperCase()}</Text>
                      <View style={styles.locationContainer}>
                        <Svg width={18} height={18} viewBox="0 0 24 24">
                          <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                          <Circle cx="12" cy="9" r="2.5" />
                        </Svg>
                        <Text style={styles.resourceLocation}>{resource.location}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
          </ScrollView>
        </View>
      )}

      {/* Location Error Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLocationError}
        onRequestClose={() => setShowLocationError(false)}
      >
        <View style={styles.errorModalContainer}>
          <View style={styles.errorModalContent}>
            <Text style={styles.errorModalTitle}>Location Error</Text>
            <Text style={styles.errorModalText}>Could not get your location</Text>
            <TouchableOpacity
              style={styles.errorModalButton}
              onPress={() => setShowLocationError(false)}
            >
              <Text style={styles.errorModalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  sosContainer: {
    flex: 7,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  sosButton: {
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  sosButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 16,
  },
  navContainer: {
    flex: 3,
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
  },
  navButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    gap: 8,
  },
  activeNavButton: {
    backgroundColor: '#2563eb',
  },
  navButtonText: {
    fontSize: 16,
    color: '#1e293b',
  },
  panelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '85%',
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 16,
    padding: 24,
  },
  panelContent: {
    flex: 1,
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1e293b',
  },
  alertCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  alertTime: {
    color: '#64748b',
    fontSize: 14,
  },
  instructionsText: {
    fontWeight: '500',
    marginBottom: 12,
  },
  guideline: {
    marginLeft: 16,
    marginBottom: 8,
  },
  resourceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceDetails: {
    flex: 1,
    gap: 4,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  resourceType: {
    color: '#2563eb',
    fontWeight: '500',
    fontSize: 14,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  resourceLocation: {
    color: '#64748b',
  },
  errorModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  errorModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
  },
  errorModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 16,
  },
  errorModalText: {
    fontSize: 16,
    marginBottom: 24,
  },
  errorModalButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  errorModalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UserDashboard;