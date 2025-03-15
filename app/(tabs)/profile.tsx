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
  StatusBar as RNStatusBar,
} from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { Card, TouchableCard } from "@/components/ui/Card";
import { Ionicons } from "@expo/vector-icons";
import { useUserCredits } from "@/app/api/credits";
import { useCreditsStore } from "@/app/stores/credits";
import Purchases, {
  LOG_LEVEL,
  PurchasesOffering,
} from "react-native-purchases";
import { useColorScheme } from "react-native";

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
  const colorScheme = useColorScheme();

  const [currentOffering, setCurrentOffering] =
    useState<PurchasesOffering | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Ensure status bar is visible
  useEffect(() => {
    RNStatusBar.setHidden(false);

    if (Platform.OS === "android") {
      RNStatusBar.setBackgroundColor(
        colorScheme === "dark" ? "#1E1E1E" : "#F2F0FF"
      );
    }
  }, [colorScheme]);

  useEffect(() => {
    const setup = async () => {
      if (Platform.OS == "android") {
        await Purchases.configure({ apiKey: APIKeys.google });
      } else {
        await Purchases.configure({ apiKey: APIKeys.apple });
      }

      // Set user attributes for webhook metadata
      if (user?.id) {
        await Purchases.setAttributes({
          userId: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
        });
      }

      const offerings = await Purchases.getOfferings();
      setCurrentOffering(offerings.current);
    };

    Purchases.setLogLevel(LOG_LEVEL.INFO);

    setup().catch(console.log);
  }, [user]);

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

      // Set user attributes including credit amounts before purchase
      if (user?.id) {
        await Purchases.setAttributes({
          userId: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          screenCredits: screenCredits.toString(),
          revisionCredits: revisionCredits.toString(),
          packageId: pkg.identifier,
          bundleType: pkg.identifier, // "small", "medium", or "large"
        });
      }

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
    <Card style={styles.creditCard} variant="elevated">
      <View
        style={[
          styles.creditIconContainer,
          title === "Screen Credits"
            ? styles.screenCreditsIconContainer
            : styles.revisionCreditsIconContainer,
        ]}
      >
        <Ionicons
          name={icon}
          size={24}
          color={
            title === "Screen Credits"
              ? "rgba(52, 199, 89, 1)"
              : "rgba(90, 200, 250, 1)"
          }
        />
      </View>
      <View style={styles.creditDetails}>
        <ThemedText
          style={[
            styles.creditTitle,
            title === "Screen Credits"
              ? styles.screenCreditsTitle
              : styles.revisionCreditsTitle,
          ]}
        >
          {title}
        </ThemedText>
        <ThemedText style={styles.creditCount}>
          {used} / {total}
        </ThemedText>
      </View>
    </Card>
  );

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? "#1E1E2E" : "#fff",
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
    content: {
      padding: 20,
    },
    header: {
      paddingTop: Platform.OS === "ios" ? 60 : 40,
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: colorScheme === "dark" ? "#1E1E2E" : "#fff",
      alignItems: "center",
    },
    avatarContainer: {
      marginBottom: 16,
      alignItems: "center",
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 60,
      alignSelf: "center",
    },
    avatarPlaceholder: {
      backgroundColor: colorScheme === "dark" ? "#f0f0f0" : "#e0e0e0",
      justifyContent: "center",
      alignItems: "center",
    },
    userInfoContainer: {
      alignItems: "center",
      marginBottom: 16,
      width: "100%",
    },
    name: {
      fontSize: 24,
      fontWeight: "bold",
      color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
      marginBottom: 4,
      textAlign: "center",
    },
    email: {
      fontSize: 16,
      color: colorScheme === "dark" ? "#CCCCCC" : "#666666",
      textAlign: "center",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      marginBottom: 16,
      color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
    },
    creditsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
      gap: 16,
    },
    creditCard: {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
    },
    creditIconContainer: {
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.1)",
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      alignSelf: "center",
    },
    creditDetails: {
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
    },
    creditTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
    },
    creditCount: {
      fontSize: 14,
      color:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.6)"
          : "rgba(0, 0, 0, 0.6)",
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
      color: colorScheme === "dark" ? "#007AFF" : "#0066CC",
      marginLeft: 6,
      fontWeight: "500",
    },
    signOutButton: {
      width: "100%",
      marginTop: 8,
    },
    bundlesSection: {
      marginTop: 24,
    },
    bundlesContainer: {
      marginTop: 12,
    },
    bundleCard: {
      padding: 0,
      marginBottom: 12,
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
      marginBottom: 8,
    },
    bundleDetails: {
      marginTop: 4,
    },
    bundleText: {
      fontSize: 16,
      color:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.8)"
          : "rgba(0, 0, 0, 0.8)",
      marginBottom: 2,
    },
    priceContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.1)",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    priceText: {
      fontSize: 18,
      fontWeight: "bold",
      color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
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
    screenCreditsIconContainer: {
      backgroundColor: "rgba(52, 199, 89, 0.2)",
      borderWidth: 1,
      borderColor: "rgba(52, 199, 89, 0.4)",
    },
    revisionCreditsIconContainer: {
      backgroundColor: "rgba(90, 200, 250, 0.2)",
      borderWidth: 1,
      borderColor: "rgba(90, 200, 250, 0.4)",
    },
    screenCreditsTitle: {
      color: "rgba(52, 199, 89, 1)",
    },
    revisionCreditsTitle: {
      color: "rgba(90, 200, 250, 1)",
    },
  });

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
                  <Ionicons
                    name="person"
                    size={40}
                    color={colorScheme === "dark" ? "#666" : "#999"}
                  />
                </View>
              )}
            </View>

            <View style={styles.userInfoContainer}>
              <ThemedText style={styles.name}>
                {user?.firstName
                  ? `${user.firstName} ${user.lastName || ""}`
                  : user?.emailAddresses[0]?.emailAddress}
              </ThemedText>
              <ThemedText style={styles.email}>
                {user?.emailAddresses[0]?.emailAddress}
              </ThemedText>
            </View>

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
                <ActivityIndicator
                  size="large"
                  color={colorScheme === "dark" ? "#FFFFFF" : "#000000"}
                />
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
                      color={colorScheme === "dark" ? "#007AFF" : "#0066CC"}
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
                        <TouchableCard
                          key={pkg.identifier}
                          style={styles.bundleCard}
                          variant="elevated"
                          activeOpacity={0.8}
                          onPress={() => handlePurchase(pkg)}
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
                              color={
                                pkg.identifier === "large"
                                  ? "rgba(175, 82, 222, 1)"
                                  : pkg.identifier === "medium"
                                  ? "rgba(90, 200, 250, 1)"
                                  : "rgba(52, 199, 89, 1)"
                              }
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
                        </TouchableCard>
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
