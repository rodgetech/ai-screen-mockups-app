import { StyleSheet, Image, Platform, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { useMockups, Mockup } from "@/app/api/mockups";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";

export default function MockupsScreen() {
  const { fetchUserMockups } = useMockups();
  const [mockups, setMockups] = useState<Mockup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMockups();
  }, [fetchUserMockups]);

  const loadMockups = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchUserMockups();
      setMockups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Your Mockups</ThemedText>
      </ThemedView>

      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#808080" />
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
        mockups.map((mockup, index) => (
          <Collapsible
            key={mockup.id}
            title={mockup.title || `Mockup ${index + 1}`}
          >
            <ThemedText>
              {mockup.description || "No description available"}
            </ThemedText>
            {mockup.imageUrl && (
              <Image
                source={{ uri: mockup.imageUrl }}
                style={styles.mockupImage}
                resizeMode="contain"
              />
            )}
          </Collapsible>
        ))
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#808080",
  },
  errorContainer: {
    padding: 20,
    backgroundColor: "#FFE5E5",
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#808080",
    textAlign: "center",
  },
  mockupImage: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 8,
  },
});
