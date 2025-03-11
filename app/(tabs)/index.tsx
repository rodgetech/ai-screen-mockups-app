import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
  PixelRatio,
  StatusBar as RNStatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useGenerateMockup } from "@/app/api/mockups";
import { Button } from "@/components/ui/Button";
import { useCreditsStore } from "@/app/stores/credits";

// Declare global variable for HTML content
declare global {
  var generatedHtml: string;
  var editedHtml: string;
}

// Get device information
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const PIXEL_RATIO = PixelRatio.get();
const FONT_SCALE = PixelRatio.getFontScale();
export const CHAT_ID = "rodgetech";

// Function to get device model information
const getDeviceInfo = () => {
  // Try to determine if it's an iPhone and which model
  let deviceModel = "Unknown";
  let osVersion =
    Platform.OS === "ios" ? Platform.Version : `Android ${Platform.Version}`;
  const { width, height } = Dimensions.get("window");

  if (Platform.OS === "ios") {
    // This is a simplified way to determine iPhone models
    // A more comprehensive solution would use native modules
    if (
      height === 812 ||
      height === 844 ||
      height === 852 ||
      height === 896 ||
      height === 926 ||
      height === 932
    ) {
      deviceModel = "iPhone with notch (X or newer)";

      if (height === 812 && width === 375) {
        deviceModel = "iPhone X/XS/11 Pro/12 mini/13 mini";
      } else if (height === 896 && width === 414) {
        deviceModel = "iPhone XR/XS Max/11/11 Pro Max";
      } else if (height === 844 && width === 390) {
        deviceModel = "iPhone 12/12 Pro/13/13 Pro/14";
      } else if (height === 926 && width === 428) {
        deviceModel = "iPhone 12 Pro Max/13 Pro Max/14 Plus";
      } else if (height === 852 && width === 393) {
        deviceModel = "iPhone 14 Pro";
      } else if (height === 932 && width === 430) {
        deviceModel = "iPhone 14 Pro Max/15 Pro Max";
      }
    } else {
      deviceModel = "iPhone 8 or earlier";
    }
  } else {
    deviceModel = `Android device (${width}x${height})`;
  }

  return {
    deviceModel,
    osVersion,
    platform: Platform.OS,
    isNotchDevice: deviceModel.includes("notch"),
  };
};

export default function HomeScreen() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo());
  const { generateMockup } = useGenerateMockup();
  const { credits, setCredits } = useCreditsStore();

  // Update device info when component mounts
  useEffect(() => {
    setDeviceInfo(getDeviceInfo());
  }, []);

  // Ensure status bar is visible
  useEffect(() => {
    // Make sure status bar is visible on home screen
    RNStatusBar.setHidden(false);
    RNStatusBar.setBarStyle("light-content");

    if (Platform.OS === "android") {
      RNStatusBar.setBackgroundColor("#1E1E1E");
    }
  }, []);

  const handleGenerate = async () => {
    // Dismiss keyboard when generating
    Keyboard.dismiss();

    if (!prompt.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsGenerating(true);

    try {
      // Get safe area insets
      const safeAreaTop = Platform.OS === "ios" ? 47 : 24; // Approximate values
      const safeAreaBottom = Platform.OS === "ios" ? 34 : 16; // Approximate values

      // Create an enhanced prompt with device information
      const enhancedPrompt = {
        chatID: CHAT_ID,
        userPrompt: prompt.trim(),
        deviceInfo: {
          platform: Platform.OS,
          model: deviceInfo.deviceModel,
          dimensions: {
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            pixelRatio: PIXEL_RATIO,
            fontScale: FONT_SCALE,
          },
          safeArea: {
            top: safeAreaTop,
            bottom: safeAreaBottom,
            left: 0,
            right: 0,
          },
          isNotchDevice: deviceInfo.isNotchDevice,
          osVersion: deviceInfo.osVersion,
        },
        renderingHints: [
          "Use native-looking UI components for the specified platform",
          "Respect safe areas, especially on notched devices",
          "Use appropriate font sizes considering the device's pixel ratio",
          "Optimize layout for the specific screen dimensions",
          "Follow platform design guidelines (iOS/Material Design)",
        ],
      };

      const data = await generateMockup(enhancedPrompt);

      // Store the HTML content in a global variable instead of passing it through URL params
      global.generatedHtml = data.html;

      // Update credits store with new remaining credits
      if (credits) {
        setCredits({
          ...credits,
          remainingScreenCredits: data.remainingScreenCredits,
        });
      }

      // Navigate to preview screen with the screenId
      router.push({
        pathname: "/preview",
        params: {
          source: "generated",
          screenId: data.screenId,
        },
      });
    } catch (error) {
      // Only log in development
      if (__DEV__) {
        console.log("Debug - Generation error:", error);
      }

      const errorMessage =
        error instanceof Error
          ? error.message.includes("Insufficient credits")
            ? "You don't have enough credits to generate a mockup. Please purchase more credits to continue."
            : error.message || "Something went wrong, please try again later."
          : "Something went wrong, please try again later.";

      Alert.alert("Generation Failed", errorMessage, [{ text: "OK" }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <StatusBar style="light" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedView style={styles.content}>
            <ThemedText style={styles.title}>Generate Mockup</ThemedText>
            <ThemedText style={styles.subtitle}>
              Describe the screen you want to create and we'll generate a mockup
              for you.
            </ThemedText>

            <ThemedView style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="e.g., A login screen with email and password fields"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={prompt}
                onChangeText={setPrompt}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={Keyboard.dismiss}
              />
            </ThemedView>

            <ThemedView style={styles.examplesContainer}>
              <ThemedText style={styles.examplesTitle}>
                Try these examples:
              </ThemedText>
              <TouchableOpacity
                style={[styles.exampleButton, styles.exampleButtonFirst]}
                onPress={() => {
                  setPrompt("A login screen with email and password fields");
                  Keyboard.dismiss();
                }}
              >
                <Ionicons
                  name="log-in-outline"
                  size={22}
                  color="rgba(255, 255, 255, 0.9)"
                />
                <ThemedText style={styles.exampleText}>Login Screen</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exampleButton}
                onPress={() => {
                  setPrompt(
                    "A user profile screen with avatar, stats, and bio"
                  );
                  Keyboard.dismiss();
                }}
              >
                <Ionicons
                  name="person-outline"
                  size={22}
                  color="rgba(255, 255, 255, 0.9)"
                />
                <ThemedText style={styles.exampleText}>
                  Profile Screen
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.exampleButton, styles.exampleButtonLast]}
                onPress={() => {
                  setPrompt("A dashboard with statistics and recent activity");
                  Keyboard.dismiss();
                }}
              >
                <Ionicons
                  name="stats-chart-outline"
                  size={22}
                  color="rgba(255, 255, 255, 0.9)"
                />
                <ThemedText style={styles.exampleText}>
                  Dashboard Screen
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>

            <Button
              title="Generate Mockup"
              icon={{ name: "flash", size: 20 }}
              onPress={handleGenerate}
              disabled={!prompt.trim()}
              isLoading={isGenerating}
            />
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E2E",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#1E1E2E",
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#1E1E2E",
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: Platform.OS === "ios" ? 80 : 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#FFFFFF",
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 17,
    color: "#CCCCCC",
    marginBottom: 24,
    lineHeight: 24,
  },
  inputContainer: {
    backgroundColor: "rgba(45, 45, 69, 0.75)",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  input: {
    fontSize: 17,
    color: "#FFFFFF",
    minHeight: 120,
    lineHeight: 24,
  },
  examplesContainer: {
    marginBottom: 32,
  },
  examplesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#FFFFFF",
  },
  exampleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(45, 45, 69, 0.75)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  exampleButtonFirst: {
    marginTop: 4,
  },
  exampleButtonLast: {
    marginBottom: 0,
  },
  exampleText: {
    marginLeft: 12,
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  generateButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  generateButtonDisabled: {
    backgroundColor: "#6e6e6e",
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonIcon: {
    marginRight: 10,
  },
});
