import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tapedeck.player',
  appName: 'TapeDeck Player',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
