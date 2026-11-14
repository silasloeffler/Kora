import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.silasloeffler.kora',
  appName: 'Kora',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_kora',
      iconColor: '#22d3ee'
    }
  }
};

export default config;
