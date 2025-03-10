import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
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
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          icon={{ name: "log-out-outline" }}
          variant="secondary"
          style={styles.signOutButton}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  header: {
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 80 : 40,
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
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 17,
    marginLeft: 12,
    color: "#333",
  },
  menuIcon: {
    marginLeft: 8,
  },
  signOutButton: {
    marginTop: 20,
  },
});
