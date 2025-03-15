import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Platform, StatusBar, View } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { useUserCredits } from "@/app/api/credits";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { FloatingTabBar } from "@/components/ui/FloatingTabBar";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isSignedIn } = useAuth();
  const { loadCredits } = useUserCredits();

  // Initialize credits when tabs layout mounts
  useEffect(() => {
    if (isSignedIn) {
      loadCredits();
    }
  }, [isSignedIn]);

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  // Ensure status bar is visible in tabs and set style based on theme
  useEffect(() => {
    StatusBar.setBarStyle(
      colorScheme === "dark" ? "light-content" : "dark-content"
    );
    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor(
        colorScheme === "dark" ? "#1E1E1E" : "#F2F0FF"
      );
    }
  }, [colorScheme]);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarStyle: {
            display: "none",
          },
        }}
        tabBar={(props) => <FloatingTabBar {...props} />}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <IconSymbol size={size} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="mockups"
          options={{
            title: "Mockups",
            tabBarIcon: ({ color, size }) => (
              <IconSymbol size={size} name="lightbulb.max.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <IconSymbol size={size} name="person.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
