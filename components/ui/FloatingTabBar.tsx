import React from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/useColorScheme";

const { width } = Dimensions.get("window");

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const colorScheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 },
      ]}
    >
      <View
        style={[
          styles.tabBar,
          { backgroundColor: colorScheme === "dark" ? "#2d2d45" : "#FFFFFF" },
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title || route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabItem}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <View>
                {options.tabBarIcon &&
                  options.tabBarIcon({
                    focused: isFocused,
                    color: isFocused
                      ? colorScheme === "dark"
                        ? "#FFFFFF"
                        : "#007AFF"
                      : colorScheme === "dark"
                      ? "#9BA1A6"
                      : "#687076",
                    size: 24,
                  })}
              </View>

              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused
                      ? colorScheme === "dark"
                        ? "#FFFFFF"
                        : "#000000"
                      : colorScheme === "dark"
                      ? "#9BA1A6"
                      : "#687076",
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    width: width - 32,
    height: 70,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
});
