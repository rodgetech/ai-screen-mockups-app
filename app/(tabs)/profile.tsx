import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Platform,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar as RNStatusBar,
  Alert,
  Linking,
  TouchableOpacity,
} from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [isDeleting, setIsDeleting] = useState(false);

  // Ensure status bar is visible
  useEffect(() => {
    RNStatusBar.setHidden(false);

    if (Platform.OS === "android") {
      RNStatusBar.setBackgroundColor(
        colorScheme === "dark" ? "#1E1E1E" : "#F2F0FF"
      );
    }
  }, [colorScheme]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      setIsDeleting(true);

      // Delete the user account using Clerk's API
      if (user) {
        await user.delete();
        // After successful deletion, sign out and redirect to sign-in
        router.replace("/sign-in");
      } else {
        throw new Error("User not found");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      Alert.alert(
        "Error",
        "There was a problem deleting your account. Please try again later."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSupportPress = () => {
    Linking.openURL("mailto:rodgetech@gmail.com");
  };

  const handlePrivacyPress = () => {
    Linking.openURL("https://screenmockups.app/privacy");
  };

  const handleTermsPress = () => {
    Linking.openURL("https://screenmockups.app/terms");
  };

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
    signOutButton: {
      width: "100%",
      marginTop: 8,
    },
    dangerZone: {
      marginTop: 40,
      padding: 20,
      borderRadius: 12,
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(255, 59, 48, 0.1)"
          : "rgba(255, 59, 48, 0.05)",
      borderWidth: 1,
      borderColor:
        colorScheme === "dark"
          ? "rgba(255, 59, 48, 0.3)"
          : "rgba(255, 59, 48, 0.2)",
    },
    dangerZoneTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "rgba(255, 59, 48, 1)",
      marginBottom: 12,
    },
    dangerZoneText: {
      fontSize: 14,
      color:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.8)"
          : "rgba(0, 0, 0, 0.8)",
      marginBottom: 16,
    },
    deleteButton: {
      backgroundColor: "rgba(255, 59, 48, 1)",
    },
    deleteButtonDisabled: {
      backgroundColor: "rgba(255, 59, 48, 0.5)",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 16,
      color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
    },
    sectionContainer: {
      marginBottom: 24,
    },
    linkItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.1)",
    },
    linkText: {
      fontSize: 16,
      marginLeft: 12,
      color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.05)",
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
            {/* Support Section */}
            <View style={styles.sectionContainer}>
              <ThemedText style={styles.sectionTitle}>Support</ThemedText>

              <TouchableOpacity
                style={styles.linkItem}
                onPress={handleSupportPress}
              >
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={colorScheme === "dark" ? "#FFFFFF" : "#000000"}
                  />
                </View>
                <ThemedText style={styles.linkText}>Contact Support</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Legal Section */}
            <View style={styles.sectionContainer}>
              <ThemedText style={styles.sectionTitle}>Legal</ThemedText>

              <TouchableOpacity
                style={styles.linkItem}
                onPress={handlePrivacyPress}
              >
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="shield-outline"
                    size={18}
                    color={colorScheme === "dark" ? "#FFFFFF" : "#000000"}
                  />
                </View>
                <ThemedText style={styles.linkText}>Privacy Policy</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkItem}
                onPress={handleTermsPress}
              >
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color={colorScheme === "dark" ? "#FFFFFF" : "#000000"}
                  />
                </View>
                <ThemedText style={styles.linkText}>
                  Terms of Service
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.dangerZone}>
              <ThemedText style={styles.dangerZoneTitle}>
                Danger Zone
              </ThemedText>
              <ThemedText style={styles.dangerZoneText}>
                Unhappy with our app? You can permanently delete your account
                and all associated data.
              </ThemedText>
              <Button
                title={isDeleting ? "Deleting..." : "Delete Account"}
                onPress={handleDeleteAccount}
                disabled={isDeleting}
                icon={{ name: "trash-outline" }}
                variant="primary"
                style={[
                  styles.deleteButton,
                  isDeleting && styles.deleteButtonDisabled,
                ]}
              />
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
