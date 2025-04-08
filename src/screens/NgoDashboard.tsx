import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface RescueRequest {
  requestId: string;
  timestamp: Date;
  location: string;
  status: 'pending' | 'accepted' | 'rescued';
  responder?: string;
}

interface Resource {
  id: string;
  name: string;
  type: string;
  location: string;
  timestamp: Date;
}

interface Alert {
  id: string;
  content: string;
  guidelines: string[];
  timestamp: Date;
}

const NgoDashboard = () => {
  const [activeTab, setActiveTab] = useState<'rescue' | 'resource'>('rescue');
  const [rescueRequests, setRescueRequests] = useState<RescueRequest[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [newResource, setNewResource] = useState({
    name: '',
    type: 'shelter',
    location: ''
  });
  
  const [ws] = useState(() => new WebSocket('wss://resq-mobile.onrender.com/ws/ngo'));

  useEffect(() => {
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch(data.type) {
        case 'sos_request':
          setRescueRequests(prev => [{
            requestId: data.requestId,
            timestamp: new Date(data.timestamp),
            location: formatCoordinates(data.location),
            status: 'pending'
          }, ...prev]);
          break;
          
        case 'request_updated':
          setRescueRequests(prev => prev.map(req => 
            req.requestId === data.requestId ? { 
              ...req, 
              status: data.status,
              responder: data.responder 
            } : req
          ));
          break;
          
        case 'resource_added':
          setResources(prev => [{
            id: data.resource.id,
            ...data.resource,
            timestamp: new Date()
          }, ...prev]);
          break;
          
        case 'disaster_alert':
          setAlerts(prev => [{
            id: data.id,
            content: data.content,
            guidelines: data.guidelines,
            timestamp: new Date(data.timestamp)
          }, ...prev]);
          break;
      }
    };

    return () => ws.close();
  }, []);

  const formatCoordinates = (coords: { lat: number; lng: number }) => {
    return `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
  };

  const handleAcceptRequest = (requestId: string) => {
    const responderId = `NGO-TEAM-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    ws.send(JSON.stringify({
      type: 'accept_sos',
      requestId,
      responder: responderId
    }));
  };

  const handleMarkRescued = (requestId: string) => {
    ws.send(JSON.stringify({
      type: 'mark_rescued',
      requestId
    }));
  };

  const handleAddResource = () => {
    if (newResource.name && newResource.location) {
      ws.send(JSON.stringify({
        type: 'add_resource',
        resource: newResource
      }));
      setNewResource({ name: '', type: 'shelter', location: '' });
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Alerts */}
      <View style={styles.alertsContainer}>
        {alerts.map(alert => (
          <View key={alert.id} style={styles.alertCard}>
            <Text style={styles.alertTitle}>⚠️ {alert.content}</Text>
            <Text>{alert.guidelines.join(' • ')}</Text>
            <Text style={styles.alertTime}>
              {alert.timestamp.toLocaleString()}
            </Text>
          </View>
        ))}
      </View>

      {/* Navigation */}
      <View style={styles.navContainer}>
        <TouchableOpacity
          style={[styles.navButton, activeTab === 'rescue' && styles.activeNavButton]}
          onPress={() => setActiveTab('rescue')}
        >
          <Text style={activeTab === 'rescue' ? styles.activeNavText : styles.navText}>
            Rescue Operations
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, activeTab === 'resource' && styles.activeNavButton]}
          onPress={() => setActiveTab('resource')}
        >
          <Text style={activeTab === 'resource' ? styles.activeNavText : styles.navText}>
            Resource Management
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rescue Operations */}
      {activeTab === 'rescue' && (
        <View style={styles.pageSection}>
          <Text style={styles.sectionTitle}>Rescue Requests</Text>
          {rescueRequests.map(request => (
            <View key={request.requestId} style={[
              styles.requestCard,
              request.status === 'accepted' && styles.acceptedCard,
              request.status === 'rescued' && styles.rescuedCard
            ]}>
              <View style={styles.requestHeader}>
                <Text style={styles.requestTitle}>
                  {request.status === 'pending' ? '🚨 Emergency Request' : 
                   request.status === 'accepted' ? '✅ Accepted Request' : '🎉 Successful Rescue'}
                </Text>
                <Text style={styles.requestTime}>
                  {request.timestamp.toLocaleTimeString()}
                </Text>
              </View>
              
              <Text>Coordinates: {request.location}</Text>
              
              {request.status === 'accepted' && (
                <Text>Responder: {request.responder}</Text>
              )}

              {request.status !== 'rescued' && (
                <View style={styles.actionsContainer}>
                  {request.status === 'pending' && (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => handleAcceptRequest(request.requestId)}
                    >
                      <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rescuedButton]}
                    onPress={() => handleMarkRescued(request.requestId)}
                  >
                    <Text style={styles.buttonText}>Mark Rescued</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Resource Management */}
      {activeTab === 'resource' && (
        <View style={styles.pageSection}>
          <View style={styles.resourceForm}>
            <Text style={styles.formTitle}>Add New Resource</Text>
            <TextInput
              style={styles.input}
              placeholder="Resource Name"
              value={newResource.name}
              onChangeText={text => setNewResource(prev => ({ ...prev, name: text }))
              }
            />
            <Picker
              selectedValue={newResource.type}
              onValueChange={value => setNewResource(prev => ({ ...prev, type: value }))}
              style={styles.picker}
            >
              <Picker.Item label="Shelter" value="shelter" />
              <Picker.Item label="Medical Facility" value="medical" />
              <Picker.Item label="Food Center" value="food" />
            </Picker>
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={newResource.location}
              onChangeText={text => setNewResource(prev => ({ ...prev, location: text }))
              }
            />
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleAddResource}
            >
              <Text style={styles.buttonText}>Add Resource</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Available Resources</Text>
          <View style={styles.resourceList}>
            {resources.map(resource => (
              <View key={resource.id} style={styles.resourceCard}>
                <Text style={styles.resourceName}>{resource.name}</Text>
                <Text>Type: {resource.type}</Text>
                <Text>Location: {resource.location}</Text>
                <Text style={styles.resourceTime}>
                  Added: {resource.timestamp.toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  navContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  navButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  activeNavButton: {
    backgroundColor: '#2563eb',
  },
  navText: {
    color: '#1e293b',
    fontSize: 16,
  },
  activeNavText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  pageSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
    marginBottom: 8,
  },
  acceptedCard: {
    borderLeftColor: '#f59e0b',
  },
  rescuedCard: {
    borderLeftColor: '#16a34a',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  requestTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  requestTime: {
    color: '#64748b',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#f59e0b',
  },
  rescuedButton: {
    backgroundColor: '#16a34a',
  },
  resourceForm: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    gap: 16,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  picker: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  resourceList: {
    gap: 12,
  },
  resourceCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
  },
  resourceName: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  resourceTime: {
    color: '#64748b',
    marginTop: 4,
  },
  alertsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  alertCard: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 12,
  },
  alertTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  alertTime: {
    color: '#64748b',
    marginTop: 8,
  },
});

export default NgoDashboard;