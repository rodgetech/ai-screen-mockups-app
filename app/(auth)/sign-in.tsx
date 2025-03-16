import { isClerkRuntimeError, useSignIn, useSSO } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  View,
  Pressable,
  Image,
  useColorScheme,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useCallback, useEffect } from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Sentry from "@sentry/react-native";
import { Ionicons } from "@expo/vector-icons";

export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Preloads the browser for Android devices to reduce authentication load time
    // See: https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync();
    return () => {
      // Cleanup: closes browser when component unmounts
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function Page() {
  useWarmUpBrowser();
  const colorScheme = useColorScheme();

  const { startSSOFlow } = useSSO();

  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      setErrors({});
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      }
    } catch (err: any) {
      if (isClerkRuntimeError(err) && err.code === "network_error") {
        setErrors({ general: "Network error. Please try again." });
        Sentry.captureException(err);
      } else if (err.errors) {
        const formErrors: { [key: string]: string } = {};
        err.errors.forEach((error: any) => {
          if (error.code === "form_identifier_not_found") {
            formErrors.identifier = error.longMessage;
          } else if (error.code === "form_password_incorrect") {
            formErrors.password = "Incorrect password";
          } else {
            const field = error.meta?.paramName || "general";
            formErrors[field] = error.longMessage || error.message;
          }
        });
        setErrors(formErrors);
      } else {
        setErrors({ general: "An error occurred. Please try again." });
        Sentry.captureException(err);
      }
    }
  };

  const onGoogleSignInPress = useCallback(async () => {
    try {
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: "screenmockups",
        path: "oauth-native-callback",
      });
      // Start the authentication process by calling `startSSOFlow()`
      const { createdSessionId, setActive, signIn, signUp } =
        await startSSOFlow({
          strategy: "oauth_google",
          redirectUrl,
        });

      // If sign in was successful, set the active session
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      } else {
        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // Use the `signIn` or `signUp` returned from `startSSOFlow`
        // to handle next steps
      }
    } catch (err) {
      if (isClerkRuntimeError(err) && err.code === "network_error") {
        setErrors({ general: "Network error. Please try again." });
        Sentry.captureException(err);
      } else {
        Sentry.captureException(err);
        setErrors({ general: "An error occurred. Please try again." });
      }
    }
  }, []);

  const onAppleSignInPress = useCallback(async () => {
    try {
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: "screenmockups",
        path: "oauth-native-callback",
      });
      // Start the authentication process by calling `startSSOFlow()`
      const { createdSessionId, setActive, signIn, signUp } =
        await startSSOFlow({
          strategy: "oauth_apple",
          redirectUrl,
        });

      // If sign in was successful, set the active session
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      } else {
        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // Use the `signIn` or `signUp` returned from `startSSOFlow`
        // to handle next steps
      }
    } catch (err) {
      if (isClerkRuntimeError(err) && err.code === "network_error") {
        setErrors({ general: "Network error. Please try again." });
        Sentry.captureException(err);
      } else {
        Sentry.captureException(err);
        setErrors({ general: "An error occurred. Please try again." });
      }
    }
  }, []);

  const isDisabled = !isLoaded || !emailAddress.trim() || !password.trim();

  // Custom Apple button with white text
  const AppleButton = () => (
    <TouchableOpacity
      style={[styles.button, styles.socialButton, styles.appleButton]}
      onPress={onAppleSignInPress}
    >
      <Ionicons
        name="logo-apple"
        size={20}
        color="#FFFFFF"
        style={styles.buttonIcon}
      />
      <ThemedText style={[styles.buttonText, styles.appleButtonText]}>
        Continue with Apple
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[
        styles.container,
        { backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#FFFFFF" },
      ]}
    >
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require("@/assets/images/icon-transparent.png")}
            style={styles.icon}
          />
          <ThemedText
            style={[
              styles.title,
              { color: colorScheme === "dark" ? "#FFFFFF" : "#000000" },
            ]}
          >
            Welcome Back
          </ThemedText>
          <ThemedText
            style={[
              styles.subtitle,
              { color: colorScheme === "dark" ? "#CCCCCC" : "#666666" },
            ]}
          >
            Sign in to your Screen Mockups account
          </ThemedText>

          <AppleButton />

          <Button
            title="Continue with Google"
            onPress={onGoogleSignInPress}
            icon={{ name: "logo-google" }}
            variant="secondary"
            style={styles.socialButton}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <ThemedText style={styles.dividerText}>or use email</ThemedText>
            <View style={styles.dividerLine} />
          </View>

          <ThemedView
            style={[
              styles.inputContainer,
              {
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(45, 45, 69, 0.75)"
                    : "rgba(240, 240, 245, 0.75)",
                borderColor:
                  colorScheme === "dark"
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
              },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                { color: colorScheme === "dark" ? "#FFFFFF" : "#000000" },
              ]}
              placeholder="Enter email"
              placeholderTextColor={colorScheme === "dark" ? "#999" : "#AAAAAA"}
              autoCapitalize="none"
              value={emailAddress}
              onChangeText={(text) => {
                setEmailAddress(text);
                setErrors((prev) => ({ ...prev, identifier: "", general: "" }));
              }}
              keyboardType="email-address"
              autoComplete="email"
            />
          </ThemedView>
          {errors.identifier && (
            <ThemedText style={styles.errorText}>
              {errors.identifier}
            </ThemedText>
          )}

          <ThemedView
            style={[
              styles.inputContainer,
              {
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(45, 45, 69, 0.75)"
                    : "rgba(240, 240, 245, 0.75)",
                borderColor:
                  colorScheme === "dark"
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
              },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                { color: colorScheme === "dark" ? "#FFFFFF" : "#000000" },
              ]}
              placeholder="Enter password"
              placeholderTextColor={colorScheme === "dark" ? "#999" : "#AAAAAA"}
              secureTextEntry={true}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: "", general: "" }));
              }}
              autoComplete="password"
            />
          </ThemedView>
          {errors.password && (
            <ThemedText style={styles.errorText}>{errors.password}</ThemedText>
          )}

          <Button
            title="Sign In"
            onPress={onSignInPress}
            disabled={isDisabled}
            icon={{ name: "log-in-outline" }}
            style={styles.signInButton}
          />

          {errors.general && (
            <ThemedText style={[styles.errorText, styles.generalError]}>
              {errors.general}
            </ThemedText>
          )}

          <View style={styles.signUpContainer}>
            <ThemedText style={styles.signUpText}>
              Don't have an account?
            </ThemedText>
            <Link href="/sign-up" replace asChild>
              <Pressable>
                <ThemedText style={styles.signUpLink}>Sign up</ThemedText>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 100 : 60,
    paddingBottom: 90,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#FFFFFF",
    lineHeight: 41,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 17,
    color: "#CCCCCC",
    marginBottom: 32,
    lineHeight: 24,
    textAlign: "center",
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
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  input: {
    fontSize: 17,
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 14,
    marginBottom: 16,
    marginLeft: 4,
  },
  generalError: {
    textAlign: "center",
    marginTop: 8,
  },
  signInButton: {
    marginTop: 8,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    marginTop: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#333333",
  },
  dividerText: {
    color: "#CCCCCC",
    paddingHorizontal: 16,
    fontSize: 16,
  },
  socialButton: {
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },
  appleButton: {
    backgroundColor: "#000000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 8,
  },
  signUpText: {
    color: "#CCCCCC",
    fontSize: 16,
  },
  signUpLink: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  icon: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 4,
  },
  button: {
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
    width: "100%",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  appleButtonText: {
    color: "#FFFFFF",
  },
});
