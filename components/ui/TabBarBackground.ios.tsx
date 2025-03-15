import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function BlurTabBarBackground() {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <BlurView
      // Using a tint that matches our theme based on color scheme
      tint={colorScheme === "dark" ? "dark" : "light"}
      intensity={colorScheme === "dark" ? 75 : 65}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  const tabHeight = useBottomTabBarHeight();
  const { bottom } = useSafeAreaInsets();
  return tabHeight - bottom;
}
