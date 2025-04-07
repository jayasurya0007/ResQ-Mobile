import { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Hardcoded credentials
    const validUsers = {
      ngo: { pass: 'ngo123', screen: 'NgoDashboard' },
      gov: { pass: 'gov123', screen: 'GovernmentDashboard' },
    };

    const user = validUsers[username as keyof typeof validUsers];
    
    if (user && password === user.pass) {
      navigation.navigate(user.screen);
    } else {
      Alert.alert('Error', 'Invalid credentials!');
    }
  };

  return (
    <View style={{ padding: 20, gap: 15 }}>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}