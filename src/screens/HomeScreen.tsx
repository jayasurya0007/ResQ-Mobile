import { Button, View } from 'react-native';

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', gap: 20, padding: 20 }}>
      <Button
        title="Organization Login"
        onPress={() => navigation.navigate('Login')}
      />
      <Button
        title="Emergency User Access"
        onPress={() => navigation.navigate('UserLogin')}
      />
    </View>
  );
}