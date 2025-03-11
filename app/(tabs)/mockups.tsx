import {
  StyleSheet,
  Image,
  Platform,
  ActivityIndicator,
  Pressable,
  ViewStyle,
  TextStyle,
  View,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useMockups, Mockup, useGetMockup } from "@/app/api/mockups";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";

interface MockupCardProps {
  mockup: Mockup;
}

function MockupCard({ mockup }: MockupCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const { getMockup } = useGetMockup();
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const data = await getMockup(mockup.id);

      // Store the HTML content in the global variable
      global.generatedHtml = data.html;
      global.editedHtml = data.html; // Also store in editedHtml to ensure it's available

      // Navigate to the preview screen
      router.push({
        pathname: "/preview",
        params: {
          source: "edited", // Change to edited since we're viewing an existing mockup
          screenId: data.screenId,
        },
      });
    } catch (error) {
      console.error("Error loading mockup:", error);
      // We'll let the preview screen handle the error display
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Pressable onPress={handlePress} disabled={isLoading}>
      <ThemedView style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.cardMainContent}>
            <ThemedText style={styles.cardTitle}>
              {mockup.screenTitle}
            </ThemedText>
            <View style={styles.deviceBadge}>
              <ThemedText style={styles.deviceText}>
                {mockup.deviceInfo.model}
              </ThemedText>
            </View>
          </View>
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color={
                colorScheme === "light"
                  ? "rgba(0, 0, 0, 0.5)"
                  : "rgba(255, 255, 255, 0.5)"
              }
            />
          ) : (
            <Ionicons
              name="chevron-forward"
              size={24}
              color={
                colorScheme === "light"
                  ? "rgba(0, 0, 0, 0.5)"
                  : "rgba(255, 255, 255, 0.5)"
              }
            />
          )}
        </View>
      </ThemedView>
    </Pressable>
  );
}

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
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadMockups(false);
    setIsRefreshing(false);
  }, [loadMockups]);

  useEffect(() => {
    loadMockups(true);
  }, [loadMockups]);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <View style={styles.titleContainer}>
          <ThemedText type="title" style={styles.title}>
            Your Mockups
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            View your generated screen mockups
          </ThemedText>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colorScheme === "light" ? "#808080" : "#A0A0A0"}
              colors={[colorScheme === "light" ? "#808080" : "#A0A0A0"]} // Android
              progressBackgroundColor={
                colorScheme === "light" ? "#FFFFFF" : "#1E1E1E"
              } // Android
            />
          }
        >
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
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  titleContainer: {
    flexDirection: "column",
    marginBottom: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  } as ViewStyle,
  scrollView: {
    flex: 1,
  } as ViewStyle,
  scrollViewContent: {
    paddingBottom: Platform.OS === "ios" ? 100 : 80, // Add padding for tab bar
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
    paddingBottom: Platform.OS === "ios" ? 20 : 16, // Extra padding for last item
  } as ViewStyle,
  card: {
    backgroundColor: "rgba(45, 45, 69, 0.75)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardMainContent: {
    flex: 1,
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    color: "#FFFFFF",
  },
  deviceBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  deviceText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  noMockups: {
    textAlign: "center",
    marginTop: 20,
    opacity: 0.7,
  },
});
