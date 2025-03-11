import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  StyleProp,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  icon?: {
    name: keyof typeof Ionicons.glyphMap;
    size?: number;
  };
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  isLoading?: boolean;
}

export function Button({
  title,
  icon,
  variant = "primary",
  fullWidth = true,
  style,
  disabled,
  isLoading,
  ...props
}: ButtonProps) {
  const buttonStyles = [
    styles.button,
    variant === "primary" ? styles.primaryButton : styles.secondaryButton,
    fullWidth && styles.fullWidth,
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyles = [
    styles.buttonText,
    variant === "primary"
      ? styles.primaryButtonText
      : styles.secondaryButtonText,
  ];

  const iconColor = variant === "primary" ? "#FFFFFF" : "#007AFF";

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon.name}
              size={icon.size || 20}
              color={iconColor}
              style={styles.buttonIcon}
            />
          )}
          <ThemedText style={textStyles}>{title}</ThemedText>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fullWidth: {
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
  },
  buttonDisabled: {
    backgroundColor: "#2D2D45",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  primaryButtonText: {
    color: "#FFFFFF",
  },
  secondaryButtonText: {
    color: "#007AFF",
  },
});
