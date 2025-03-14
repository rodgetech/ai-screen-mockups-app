import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { useUserCredits } from "@/app/api/credits";
import { useCreditsStore } from "@/app/stores/credits";
import Purchases, {
  LOG_LEVEL,
  PurchasesOffering,
} from "react-native-purchases";

const APIKeys = {
  apple: "appl_oJECusJtJWeYQNeXBJObBLfEpqO",
  google: "test",
};

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { loadCredits } = useUserCredits();
  const { credits, isLoading, error, setCredits } = useCreditsStore();

  const [currentOffering, setCurrentOffering] =
    useState<PurchasesOffering | null>(null);

  useEffect(() => {
    const setup = async () => {
      if (Platform.OS == "android") {
        await Purchases.configure({ apiKey: APIKeys.google });
      } else {
        await Purchases.configure({ apiKey: APIKeys.apple });
      }

      const offerings = await Purchases.getOfferings();
      console.log(offerings.current?.availablePackages);
      setCurrentOffering(offerings.current);
    };

    Purchases.setLogLevel(LOG_LEVEL.INFO);

    setup().catch(console.log);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handlePurchase = async (pkg: any) => {
    try {
      // Parse credits from description (e.g., "5 screens, 5 revisions")
      const description = pkg.product.description;
      const matches = description.match(
        /(\d+)\s+screens?,\s+(\d+)\s+revisions?/i
      );

      if (!matches) {
        console.error("Could not parse credits from description:", description);
        return;
      }

      const screenCredits = parseInt(matches[1]);
      const revisionCredits = parseInt(matches[2]);

      // Make the purchase
      const { customerInfo, productIdentifier } =
        await Purchases.purchasePackage(pkg);

      // Optimistically update credits
      if (credits) {
        setCredits({
          ...credits,
          screenCredits: credits.screenCredits + screenCredits,
          remainingScreenCredits:
            credits.remainingScreenCredits + screenCredits,
          revisionCredits: credits.revisionCredits + revisionCredits,
          remainingRevisionCredits:
            credits.remainingRevisionCredits + revisionCredits,
        });
      }
    } catch (e: any) {
      if (e.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        // User cancelled - no need for error message
        return;
      }
      Alert.alert(
        "Error purchasing package",
        "There was a problem with your purchase. Please try again."
      );
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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

            <Button
              title="Sign Out"
              onPress={handleSignOut}
              icon={{ name: "log-out-outline" }}
              variant="secondary"
              style={styles.signOutButton}
            />
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
                    <Ionicons
                      name="refresh-outline"
                      size={18}
                      color="#007AFF"
                    />
                    <ThemedText style={styles.retryText}>Retry</ThemedText>
                  </View>
                </TouchableOpacity>
              </View>
            ) : credits ? (
              <View>
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

                <View style={styles.bundlesSection}>
                  <ThemedText style={styles.sectionTitle}>
                    Credit Bundles
                  </ThemedText>
                  <View style={styles.bundlesContainer}>
                    {currentOffering?.availablePackages
                      .sort((a, b) => a.product.price - b.product.price)
                      .map((pkg, index) => (
                        <TouchableOpacity
                          key={pkg.identifier}
                          style={styles.bundleCard}
                          activeOpacity={0.8}
                        >
                          <View
                            style={[
                              styles.bundleIconContainer,
                              pkg.identifier === "large"
                                ? styles.largeIconContainer
                                : pkg.identifier === "medium"
                                ? styles.mediumIconContainer
                                : styles.smallIconContainer,
                            ]}
                          >
                            <Ionicons
                              name={
                                pkg.identifier === "large"
                                  ? "diamond"
                                  : pkg.identifier === "medium"
                                  ? "star"
                                  : "rocket"
                              }
                              size={24}
                              color="#FFFFFF"
                            />
                          </View>
                          <ThemedText
                            style={[
                              styles.bundleTitle,
                              pkg.identifier === "large"
                                ? styles.largeTitle
                                : pkg.identifier === "medium"
                                ? styles.mediumTitle
                                : styles.smallTitle,
                            ]}
                          >
                            {pkg.product.title}
                          </ThemedText>
                          <View style={styles.bundleDetails}>
                            <ThemedText style={styles.bundleText}>
                              {pkg.product.description}
                            </ThemedText>
                          </View>
                          <View style={styles.priceContainer}>
                            <ThemedText style={styles.priceText}>
                              {pkg.product.priceString}
                            </ThemedText>
                            <TouchableOpacity
                              style={[
                                styles.purchaseButton,
                                pkg.identifier === "large"
                                  ? styles.largePurchaseButton
                                  : pkg.identifier === "medium"
                                  ? styles.mediumPurchaseButton
                                  : styles.smallPurchaseButton,
                              ]}
                              onPress={() => handlePurchase(pkg)}
                            >
                              <ThemedText style={styles.purchaseButtonText}>
                                Purchase
                              </ThemedText>
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 20 : 40,
    paddingBottom: 32,
    paddingHorizontal: 20,
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
    marginBottom: 32,
    gap: 12,
  },
  creditCard: {
    flex: 1,
    backgroundColor: "rgba(45, 45, 69, 0.75)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    aspectRatio: 1,
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
  signOutButton: {
    width: "100%",
    marginTop: 24,
  },
  bundlesSection: {
    marginTop: 24,
  },
  bundlesContainer: {
    marginTop: 12,
  },
  bundleCard: {
    backgroundColor: "rgba(45, 45, 69, 0.75)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: "relative",
    overflow: "hidden",
  },
  bundleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  smallIconContainer: {
    backgroundColor: "rgba(52, 199, 89, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.4)",
  },
  mediumIconContainer: {
    backgroundColor: "rgba(90, 200, 250, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(90, 200, 250, 0.4)",
  },
  largeIconContainer: {
    backgroundColor: "rgba(175, 82, 222, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(175, 82, 222, 0.4)",
  },
  smallTitle: {
    color: "rgba(52, 199, 89, 1)",
  },
  mediumTitle: {
    color: "rgba(90, 200, 250, 1)",
  },
  largeTitle: {
    color: "rgba(175, 82, 222, 1)",
  },
  bundleTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  bundleDetails: {
    marginTop: 4,
  },
  bundleText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 2,
  },
  priceContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  purchaseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  purchaseButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  smallPurchaseButton: {
    backgroundColor: "rgba(52, 199, 89, 1)",
  },
  mediumPurchaseButton: {
    backgroundColor: "rgba(90, 200, 250, 1)",
  },
  largePurchaseButton: {
    backgroundColor: "rgba(175, 82, 222, 1)",
  },
});
