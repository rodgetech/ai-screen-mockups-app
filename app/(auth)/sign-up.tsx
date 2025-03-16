import React, { useCallback, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  useColorScheme,
  ScrollView,
} from "react-native";
import { useSignUp, useSSO } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Sentry from "@sentry/react-native";
import { Ionicons } from "@expo/vector-icons";

export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  useWarmUpBrowser();
  const colorScheme = useColorScheme();

  const { startSSOFlow } = useSSO();
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  const onGoogleSignInPress = useCallback(async () => {
    try {
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: "screenmockups",
        path: "oauth-native-callback",
      });
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl,
      });

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  }, [startSSOFlow]);

  const onAppleSignInPress = useCallback(async () => {
    try {
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: "screenmockups",
        path: "oauth-native-callback",
      });
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_apple",
        redirectUrl,
      });

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  }, [startSSOFlow]);

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

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      setErrors({});
      console.log({ emailAddress, password });
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      if (err.errors) {
        const formErrors: { [key: string]: string } = {};
        err.errors.forEach((error: any) => {
          const field = error.meta?.paramName || "general";
          formErrors[field] = error.longMessage || error.message;
        });
        setErrors(formErrors);
      } else {
        setErrors({ general: "An error occurred. Please try again." });
      }
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      setErrors({});
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err: any) {
      if (err.errors) {
        const formErrors: { [key: string]: string } = {};
        err.errors.forEach((error: any) => {
          const field = error.meta?.paramName || "general";
          formErrors[field] = error.longMessage || error.message;
        });
        setErrors(formErrors);
      } else {
        setErrors({ general: "An error occurred. Please try again." });
      }
      console.error("Some error occurred", err);
    }
  };

  if (pendingVerification) {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                Verify Your Email
              </ThemedText>
              <ThemedText
                style={[
                  styles.subtitle,
                  { color: colorScheme === "dark" ? "#CCCCCC" : "#666666" },
                ]}
              >
                We've sent a verification code to your email
              </ThemedText>

              <View
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
                  value={code}
                  placeholder="Enter verification code"
                  placeholderTextColor={
                    colorScheme === "dark" ? "#999" : "#AAAAAA"
                  }
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  autoComplete="off"
                />
              </View>
              {errors.code && (
                <ThemedText style={styles.errorText}>{errors.code}</ThemedText>
              )}

              <Button
                title="Verify Email"
                onPress={onVerifyPress}
                disabled={!isLoaded || !code.trim()}
                icon={{ name: "checkmark-outline" }}
                style={styles.actionButton}
              />

              {errors.general && (
                <ThemedText style={[styles.errorText, styles.generalError]}>
                  {errors.general}
                </ThemedText>
              )}

              <View style={styles.signInContainer}>
                <ThemedText style={styles.signInText}>
                  Already have an account?
                </ThemedText>
                <Link href="/sign-in" replace>
                  <ThemedText style={styles.signInLink}>Sign in</ThemedText>
                </Link>
              </View>
            </ScrollView>
          </ThemedView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    );
  }

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
            Create Account
          </ThemedText>
          <ThemedText
            style={[
              styles.subtitle,
              { color: colorScheme === "dark" ? "#CCCCCC" : "#666666" },
            ]}
          >
            Sign up to get started with Screen Mockups
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

          <View
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
                setErrors((prev) => ({ ...prev, emailAddress: "" }));
              }}
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>
          {errors.emailAddress && (
            <ThemedText style={styles.errorText}>
              {errors.emailAddress}
            </ThemedText>
          )}

          <View
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
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
              autoComplete="new-password"
            />
          </View>
          {errors.password && (
            <ThemedText style={styles.errorText}>{errors.password}</ThemedText>
          )}

          <Button
            title="Sign Up"
            onPress={onSignUpPress}
            disabled={!isLoaded || !emailAddress.trim() || !password.trim()}
            icon={{ name: "person-add-outline" }}
            style={styles.actionButton}
          />

          {errors.general && (
            <ThemedText style={[styles.errorText, styles.generalError]}>
              {errors.general}
            </ThemedText>
          )}

          <View style={styles.signInContainer}>
            <ThemedText style={styles.signInText}>
              Already have an account?
            </ThemedText>
            <Link href="/sign-in" replace>
              <ThemedText style={styles.signInLink}>Sign in</ThemedText>
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
    color: "#FFFFFF",
    height: 24,
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
  actionButton: {
    marginTop: 8,
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 8,
  },
  signInText: {
    color: "#CCCCCC",
    fontSize: 16,
  },
  signInLink: {
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
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
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
  appleButton: {
    backgroundColor: "#000000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  appleButtonText: {
    color: "#FFFFFF",
  },
});
