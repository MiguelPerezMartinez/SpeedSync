import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.speedsync.app",
  appName: "speed_sync",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
};

export default config;
