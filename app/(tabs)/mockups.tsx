import {
  StyleSheet,
  Image,
  Platform,
  ActivityIndicator,
  Pressable,
  ViewStyle,
  TextStyle,
  RefreshControl,
  View,
  ScrollView,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useMockups, Mockup } from "@/app/api/mockups";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function MockupsScreen() {
  const { fetchUserMockups } = useMockups();
  const [mockups, setMockups] = useState<Mockup[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme() ?? "light";

  const loadMockups = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setIsInitialLoading(true);
      }
      setError(null);
      const data = await fetchUserMockups();
      setMockups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMockups(true);
  }, [loadMockups]);

  const MockupCard = ({ mockup }: { mockup: Mockup }) => (
    <Pressable>
      <ThemedView
        style={styles.mockupCardContent}
        lightColor="#E6E6FA"
        darkColor="#2D2D3A"
      >
        <View style={styles.mockupCardHeader}>
          <ThemedText style={styles.mockupTitle}>
            {mockup.screenTitle}
          </ThemedText>
          <View style={styles.timeSlots}>
            <ThemedView
              style={styles.deviceBadge}
              lightColor={
                colorScheme === "light"
                  ? "rgba(0,0,0,0.05)"
                  : "rgba(255,255,255,0.1)"
              }
              darkColor={
                colorScheme === "light"
                  ? "rgba(0,0,0,0.05)"
                  : "rgba(255,255,255,0.1)"
              }
            >
              <IconSymbol
                size={14}
                color={colorScheme === "light" ? "#808080" : "#A0A0A0"}
                name={
                  mockup.deviceInfo.platform === "ios" ? "apple.logo" : "phone"
                }
                style={styles.deviceIcon}
              />
              <ThemedText style={styles.deviceText}>
                {mockup.deviceInfo.model}
              </ThemedText>
            </ThemedView>
          </View>
        </View>
        <IconSymbol
          size={24}
          color={colorScheme === "light" ? "#808080" : "#A0A0A0"}
          name="chevron.right"
          style={styles.chevron}
        />
      </ThemedView>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <View style={styles.titleContainer}>
          <ThemedText type="title" style={styles.title}>
            Your Mockups
          </ThemedText>
        </View>

        <ScrollView style={styles.scrollView}>
          {isInitialLoading ? (
            <ThemedView style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={colorScheme === "light" ? "#808080" : "#A0A0A0"}
              />
              <ThemedText style={styles.loadingText}>
                Loading your mockups...
              </ThemedText>
            </ThemedView>
          ) : error ? (
            <ThemedView style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </ThemedView>
          ) : mockups.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                No mockups found. Create your first mockup!
              </ThemedText>
            </ThemedView>
          ) : (
            <ThemedView style={styles.mockupsList}>
              {mockups.map((mockup) => (
                <MockupCard key={mockup.id} mockup={mockup} />
              ))}
            </ThemedView>
          )}
        </ScrollView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#FFFFFF",
    lineHeight: 28,
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  } as ViewStyle,
  scrollView: {
    flex: 1,
  } as ViewStyle,
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  } as ViewStyle,
  loadingText: {
    marginTop: 10,
    color: "#808080",
  } as TextStyle,
  errorContainer: {
    padding: 20,
    backgroundColor: "#FFE5E5",
    borderRadius: 8,
    marginBottom: 20,
  } as ViewStyle,
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
  } as TextStyle,
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  } as ViewStyle,
  emptyText: {
    color: "#808080",
    textAlign: "center",
  } as TextStyle,
  mockupsList: {
    gap: 12,
  } as ViewStyle,
  mockupCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
  } as ViewStyle,
  mockupCardHeader: {
    flex: 1,
    gap: 12,
  } as ViewStyle,
  mockupTitle: {
    fontSize: 20,
    fontWeight: "600",
  } as TextStyle,
  timeSlots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  } as ViewStyle,
  deviceBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  } as ViewStyle,
  deviceIcon: {
    marginRight: 6,
  } as ViewStyle,
  deviceText: {
    fontSize: 14,
    color: "#808080",
  } as TextStyle,
  chevron: {
    color: "#808080",
  } as ViewStyle,
});
