import { View, ViewProps } from 'react-native';

export default function ThemedView({ children, style, ...props }: ViewProps) {
  return <View style={[{ padding: 20, flex: 1 }, style]} {...props}>{children}</View>;
}