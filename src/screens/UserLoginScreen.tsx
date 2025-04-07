import { useState } from 'react';
import { View, TextInput, Button } from 'react-native';

export default function UserLoginScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = () => {
    navigation.navigate('UserDashboard');
  };

  return (
    <View style={{ padding: 20, gap: 15 }}>
      <TextInput
        placeholder="Your Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <Button title="Get Help" onPress={handleSubmit} />
    </View>
  );
}