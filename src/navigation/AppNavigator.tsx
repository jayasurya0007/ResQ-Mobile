import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import UserLoginScreen from '../screens/UserLoginScreen';
import NgoDashboard from '../screens/NgoDashboard';
import GovernmentDashboard from '../screens/GovernmentDashboard';
import UserDashboard from '../screens/UserDashboard';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="UserLogin" component={UserLoginScreen} />
      <Stack.Screen name="NgoDashboard" component={NgoDashboard} />
      <Stack.Screen name="GovernmentDashboard" component={GovernmentDashboard} />
      <Stack.Screen name="UserDashboard" component={UserDashboard} />
    </Stack.Navigator>
  );
}