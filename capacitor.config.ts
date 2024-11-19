import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.audiogata.app",
  appName: "AudioGata",
  webDir: "dist",
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
