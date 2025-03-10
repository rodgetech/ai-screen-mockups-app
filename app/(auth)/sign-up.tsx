import React from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

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
          style={styles.container}
        >
          <ThemedView style={styles.content}>
            <ThemedText style={styles.title}>Verify Your Email</ThemedText>
            <ThemedText style={styles.subtitle}>
              We've sent a verification code to your email
            </ThemedText>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={code}
                placeholder="Enter verification code"
                placeholderTextColor="#999"
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
          </ThemedView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ThemedView style={styles.content}>
          <ThemedText style={styles.title}>Create Account</ThemedText>
          <ThemedText style={styles.subtitle}>
            Sign up to get started with AI Screen Mockups
          </ThemedText>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter email"
              placeholderTextColor="#999"
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

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#999"
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
        </ThemedView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 100 : 60,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#FFFFFF",
    lineHeight: 41,
  },
  subtitle: {
    fontSize: 17,
    color: "#CCCCCC",
    marginBottom: 32,
    lineHeight: 24,
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 4,
  },
  input: {
    fontSize: 17,
    color: "#333",
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
});
