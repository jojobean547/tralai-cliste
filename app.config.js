module.exports = {
  expo: {
    name: "Tralaí Cliste",
    slug: "tralai-cliste",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/app_icon_dark.png",
    scheme: "basepricechecker",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      package: "ie.tralaicliste.app",
      adaptiveIcon: {
        backgroundColor: "#e4fade",
        foregroundImage: "./assets/images/adaptive_icon_foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/app_icon_dark.png",
          imageWidth: 500,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: { backgroundColor: "#000000" },
        },
      ],
      "expo-sqlite",
      "@react-native-google-signin/google-signin",
      "expo-web-browser",
      "expo-font",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      anthropicApiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
      router: {},
      eas: {
        projectId: "cd596fef-df50-4e95-b85e-f7c0d35b01ec",
      },
    },
  },
};
