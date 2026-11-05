import Constants from 'expo-constants';
import { Platform } from 'react-native';

export function getBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configured) {
    return configured;
  }

  if (!__DEV__) {
    throw new Error('EXPO_PUBLIC_API_URL is required for production builds.');
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }

  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host) {
    return `http://${host}:3000`;
  }

  const fallback = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${fallback}:3000`;
}
