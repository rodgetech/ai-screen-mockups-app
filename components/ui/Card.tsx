import React, { ReactNode } from "react";
import {
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  variant?: "default" | "elevated";
}

interface TouchableCardProps extends TouchableOpacityProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  variant?: "default" | "elevated";
}

/**
 * A reusable card component that adapts to light/dark mode
 */
export function Card({
  children,
  style,
  contentStyle,
  variant = "default",
}: CardProps) {
  const colorScheme = useColorScheme() ?? "light";

  const backgroundColor =
    colorScheme === "dark" ? "rgba(45, 45, 69, 0.75)" : "#FFFFFF";

  const borderColor =
    colorScheme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";

  return (
    <View
      style={[
        styles.card,
        variant === "elevated" && styles.elevatedCard,
        { backgroundColor, borderColor },
        style,
      ]}
    >
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

/**
 * A touchable version of the Card component
 */
export function TouchableCard({
  children,
  style,
  contentStyle,
  variant = "default",
  activeOpacity = 0.7,
  ...rest
}: TouchableCardProps) {
  const colorScheme = useColorScheme() ?? "light";

  const backgroundColor =
    colorScheme === "dark" ? "rgba(45, 45, 69, 0.75)" : "#FFF";

  const borderColor =
    colorScheme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";

  return (
    <TouchableOpacity
      style={[
        styles.card,
        variant === "elevated" && styles.elevatedCard,
        { backgroundColor, borderColor },
        style,
      ]}
      activeOpacity={activeOpacity}
      {...rest}
    >
      <View style={[styles.content, contentStyle]}>{children}</View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    margin: 1,
    overflow: "hidden",
  },
  elevatedCard: {},
  content: {
    padding: 16,
  },
});
