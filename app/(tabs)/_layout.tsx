import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Platform, StatusBar } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { useUserCredits } from "@/app/api/credits";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

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
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: "transparent",
            position: "absolute",
          },
          android: {
            backgroundColor: colorScheme === "light" ? "#E6E6FA" : "#2D2D3A",
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mockups"
        options={{
          title: "Mockups",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="lightbulb.max.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
