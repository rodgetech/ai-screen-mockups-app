import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  View,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  Dimensions,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { CHAT_ID } from "./(tabs)";
import { useEditMockup } from "@/app/api/mockups";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Declare global variable for HTML content
declare global {
  var generatedHtml: string;
  var editedHtml: string;
}

export default function PreviewScreen() {
  const { source, screenId } = useLocalSearchParams();
  const router = useRouter();
  const viewShotRef = useRef<ViewShot>(null);
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentHtml, setCurrentHtml] = useState("");
  const [showStatusBar, setShowStatusBar] = useState(false);
  const [currentScreenId, setCurrentScreenId] = useState<string | null>(
    (screenId as string) || null
  );
  const { editMockup } = useEditMockup();

  // Hide/show status bar based on state
  useEffect(() => {
    RNStatusBar.setHidden(!showStatusBar);
    return () => {
      RNStatusBar.setHidden(false); // Restore status bar when unmounting
    };
  }, [showStatusBar]);

  // Load HTML content from global variable on mount
  useEffect(() => {
    try {
      if (source === "generated" && global.generatedHtml) {
        setCurrentHtml(global.generatedHtml);
      } else if (source === "edited" && global.editedHtml) {
        setCurrentHtml(global.editedHtml);
      } else {
        setError("No HTML content available");
      }
    } catch (error) {
      console.error("Error loading HTML content:", error);
      setError("Failed to load HTML content");
    }
  }, [source]);

  // Request media library permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasMediaPermission(status === "granted");
    })();
  }, []);

  // Basic HTML wrapper to make content responsive
  const htmlWrapper = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #ffffff;
            overflow: hidden;
          }
          * {
            box-sizing: border-box;
          }
          ${
            showStatusBar
              ? `
          body {
            padding-top: ${Platform.OS === "ios" ? "44px" : "24px"};
          }
          `
              : ""
          }
        </style>
      </head>
      <body>
        ${currentHtml}
      </body>
    </html>
  `;

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleScreenshot = async () => {
    if (!hasMediaPermission) {
      Alert.alert(
        "Permission Required",
        "Please grant permission to save screenshots to your photo library.",
        [{ text: "OK" }]
      );
      return;
    }

    if (!viewShotRef.current) {
      console.error("ViewShot ref is not available");
      return;
    }

    try {
      // Temporarily hide controls
      setShowControls(false);

      // Small delay to ensure UI updates before screenshot
      await new Promise((resolve) => setTimeout(resolve, 100));

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const uri = await captureRef(viewShotRef);
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Success", "Screenshot saved to photo library!");
    } catch (error) {
      console.error("Error taking screenshot:", error);
      Alert.alert("Error", "Failed to save screenshot");
    } finally {
      // Restore controls after screenshot is taken
      setShowControls(true);
    }
  };

  const toggleControls = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowControls(!showControls);
  };

  const handleEditPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowEditModal(true);
  };

  const toggleStatusBar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowStatusBar(!showStatusBar);
  };

  const handleEditSubmit = async () => {
    if (!editPrompt.trim() || !currentScreenId) {
      return;
    }

    setIsEditing(true);
    setShowEditModal(false);

    try {
      const data = await editMockup({
        screenId: currentScreenId,
        userPrompt: editPrompt.trim(),
      });

      // Update the current HTML with the edited version
      setCurrentHtml(data.html);
      // Update the screenId
      setCurrentScreenId(data.screenId);
      // Also store in global variable for persistence
      global.editedHtml = data.html;
      setEditPrompt("");
    } catch (error) {
      console.error("Error editing mockup:", error);
      Alert.alert(
        "Edit Failed",
        "There was an error editing your mockup. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <ViewShot ref={viewShotRef} style={styles.fullScreenContainer}>
      {/* No StatusBar component - we're handling it with useEffect */}

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#ff3b30" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity
            style={styles.tryAgainButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.tryAgainText}>Try Again</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.webviewContainer}>
          {/* Full screen WebView with no UI elements */}
          <WebView
            source={{ html: htmlWrapper }}
            style={styles.webview}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError("Failed to load preview");
            }}
            onTouchStart={toggleControls}
            scrollEnabled={true}
            bounces={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            originWhitelist={["*"]}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            key={`${currentHtml}-${showStatusBar}`} // Force re-render when HTML or status bar changes
          />

          {/* Loading indicator */}
          {(isLoading || isEditing) && (
            <BlurView intensity={50} style={styles.loadingContainer}>
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color="#007AFF" />
                <ThemedText style={styles.loadingText}>
                  {isEditing ? "Updating mockup..." : "Rendering preview..."}
                </ThemedText>
              </View>
            </BlurView>
          )}

          {/* Floating controls that appear when tapping the screen */}
          {showControls && (
            <SafeAreaView style={styles.floatingControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleBackPress}
              >
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </TouchableOpacity>

              <View style={styles.controlsRight}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={toggleStatusBar}
                >
                  <Ionicons
                    name={
                      showStatusBar
                        ? "phone-portrait"
                        : "phone-portrait-outline"
                    }
                    size={22}
                    color="#fff"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, styles.controlButtonMargin]}
                  onPress={handleEditPress}
                >
                  <Ionicons name="pencil" size={22} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, styles.controlButtonMargin]}
                  onPress={handleScreenshot}
                >
                  <Ionicons name="camera-outline" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          )}

          {/* Edit Modal */}
          <Modal
            visible={showEditModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowEditModal(false)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalContainer}
              keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalInnerContainer}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <ThemedText style={styles.modalTitle}>
                        Edit Mockup
                      </ThemedText>
                      <TouchableOpacity
                        onPress={() => setShowEditModal(false)}
                        style={styles.closeButton}
                      >
                        <Ionicons name="close" size={24} color="#333" />
                      </TouchableOpacity>
                    </View>

                    <ThemedText style={styles.modalSubtitle}>
                      Describe how you want to modify the current mockup
                    </ThemedText>

                    <TextInput
                      style={styles.editInput}
                      placeholder="e.g., Change the background color to blue"
                      placeholderTextColor="#999"
                      value={editPrompt}
                      onChangeText={setEditPrompt}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      autoFocus
                    />

                    <TouchableOpacity
                      style={[
                        styles.editButton,
                        !editPrompt.trim() && styles.editButtonDisabled,
                      ]}
                      onPress={handleEditSubmit}
                      disabled={!editPrompt.trim()}
                    >
                      <ThemedText style={styles.editButtonText}>
                        Apply Changes
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </Modal>
        </View>
      )}
    </ViewShot>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#fff",
    zIndex: 9999,
  },
  webviewContainer: {
    flex: 1,
    position: "relative",
    backgroundColor: "#fff",
  },
  webview: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: "500",
    color: "#333",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1E1E1E",
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    textAlign: "center",
    color: "#fff",
    marginBottom: 24,
  },
  tryAgainButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  tryAgainText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  floatingControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    marginHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
  },
  controlsRight: {
    flexDirection: "row",
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  controlButtonMargin: {
    marginLeft: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalInnerContainer: {
    width: "100%",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  editInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
    minHeight: 100, // Reduced height to ensure it fits
    maxHeight: 150, // Limit maximum height
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  editButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonDisabled: {
    backgroundColor: "#b0b0b0",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
