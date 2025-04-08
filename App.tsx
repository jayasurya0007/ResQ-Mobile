import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from '@/navigation/AppNavigator';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// Ignore specific warnings
LogBox.ignoreLogs([
  'JavaScript logs will be removed from Metro',
  'Non-serializable values were found in the navigation state',
]);