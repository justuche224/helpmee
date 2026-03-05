import { ConfigContext, ExpoConfig } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return "org.helpmee.dev";
  }

  if (IS_PREVIEW) {
    return "org.helpmee.preview";
  }

  return "org.helpmee";
};

const getAppName = () => {
  if (IS_DEV) {
    return "Helpmee (Dev)";
  }

  if (IS_PREVIEW) {
    return "Helpmee (Preview)";
  }

  return "Helpmee";
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: "helpmee",
  version: "1.0.0",
  scheme: "helpmee",
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/favicon.png",
  },
  plugins: ["expo-router", "expo-secure-store", "expo-web-browser"],
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true,
  },
  newArchEnabled: true,
  orientation: "portrait",
  icon: "./assets/icons/core/adaptive-icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/icons/core/splash-icon-dark.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: getUniqueIdentifier(),
    icon: {
      light: "./assets/icons/core/ios-light.png",
      dark: "./assets/icons/core/ios-dark.png",
      tinted: "./assets/icons/core/ios-tinted.png",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/icons/core/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: getUniqueIdentifier(),
    edgeToEdgeEnabled: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "01996631-0ecb-4aa4-bd67-6c34ce31ca3a",
    },
  },
  owner: "ominisolutions",
});
