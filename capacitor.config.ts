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
      iconColor: '#fa2d48'
    }
  }
};

export default config;
