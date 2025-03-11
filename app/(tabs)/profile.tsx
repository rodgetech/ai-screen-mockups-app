import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { useUserCredits } from "@/app/api/credits";
import { useCreditsStore } from "@/app/stores/credits";

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { loadCredits } = useUserCredits();
  const { credits, isLoading, error } = useCreditsStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const renderCreditCard = (
    title: string,
    used: number,
    total: number,
    icon: keyof typeof Ionicons.glyphMap
  ) => (
    <View style={styles.creditCard}>
      <View style={styles.creditIconContainer}>
        <Ionicons name={icon} size={24} color="#FFFFFF" />
      </View>
      <ThemedText style={styles.creditTitle}>{title}</ThemedText>
      <View style={styles.creditStats}>
        <ThemedText style={styles.creditValue}>{total - used}</ThemedText>
        <ThemedText style={styles.creditTotal}>/ {total}</ThemedText>
      </View>
      <ThemedText style={styles.creditRemaining}>remaining</ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={40} color="#666" />
              </View>
            )}
          </View>
          <ThemedText style={styles.name}>
            {user?.firstName
              ? `${user.firstName} ${user.lastName || ""}`
              : user?.emailAddresses[0]?.emailAddress}
          </ThemedText>
          <ThemedText style={styles.email}>
            {user?.emailAddresses[0]?.emailAddress}
          </ThemedText>
        </View>

        <View style={styles.content}>
          <ThemedText style={styles.sectionTitle}>Your Credits</ThemedText>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>
                Failed to load credits. Please try again.
              </ThemedText>
              <TouchableOpacity onPress={() => loadCredits(true)}>
                <View style={styles.retryLink}>
                  <Ionicons name="refresh-outline" size={18} color="#007AFF" />
                  <ThemedText style={styles.retryText}>Retry</ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          ) : credits ? (
            <View style={styles.creditsContainer}>
              {renderCreditCard(
                "Screen Credits",
                credits.screenCredits - credits.remainingScreenCredits,
                credits.screenCredits,
                "phone-portrait"
              )}
              {renderCreditCard(
                "Revision Credits",
                credits.revisionCredits - credits.remainingRevisionCredits,
                credits.revisionCredits,
                "git-branch"
              )}
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            icon={{ name: "log-out-outline" }}
            variant="secondary"
            style={styles.signOutButton}
          />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1E1E2E",
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 20 : 40,
    paddingBottom: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#CCCCCC",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#FFFFFF",
  },
  creditsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  creditCard: {
    flex: 1,
    backgroundColor: "rgba(45, 45, 69, 0.75)",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  creditIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  creditTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  creditStats: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  creditValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  creditTotal: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
    marginLeft: 4,
  },
  creditRemaining: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF6B6B",
    textAlign: "center",
    marginBottom: 16,
  },
  retryLink: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  retryText: {
    fontSize: 16,
    color: "#007AFF",
    marginLeft: 6,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 150,
  },
  signOutButton: {
    marginTop: 8,
  },
});
