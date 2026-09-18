import "dotenv/config";

export default {
  expo: {
    name: "merp",
    slug: "merp",
    version: "1.0.14",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "merp",
    userInterfaceStyle: "automatic",

    ios: {
      supportsTablet: true,
      bundleIdentifier: "aura.merp.app",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },

    android: {
      package: "aura.merp.app",
      predictiveBackGestureEnabled: false,
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/logo.png",
        backgroundImage: "./assets/images/bg.png",
        monochromeImage: "./assets/images/logo-alpha.png",
      },
    },

    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: [
      "expo-router",
      "expo-image",
      "expo-status-bar",

      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo.png",
          imageWidth: 160,
          resizeMode: "contain",
          backgroundColor: "#000000",
        },
      ],

      "expo-secure-store",
      "expo-font",
      "expo-web-browser",

      [
        "expo-local-authentication",
        {
          faceIDPermission:
            "Приложению нужен доступ к Face ID для быстрого входа",
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },

    extra: {
      SERVER_URL: process.env.SERVER_URL,
      router: {},
      eas: {
        projectId: "2513b7bb-a3d7-4c2f-bd2f-4f4200486ee2",
      },
    },

    runtimeVersion: {
      policy: "appVersion",
    },

    updates: {
      url: "https://u.expo.dev/413b84a6-b908-4df9-8d27-2a2fa0e3a284",
    },

    owner: "bahram101",
  },
};
