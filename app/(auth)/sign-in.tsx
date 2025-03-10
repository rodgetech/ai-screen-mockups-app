import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import React from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  // Handle the submission of the sign-in form
  const onSignInPress = React.useCallback(async () => {
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
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      if (err.errors) {
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
      }
      console.error("Some error occurred", err);
    }
  }, [isLoaded, emailAddress, password]);

  const isDisabled = !isLoaded || !emailAddress.trim() || !password.trim();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Welcome Back</ThemedText>
        <ThemedText style={styles.subtitle}>
          Sign in to your account to continue
        </ThemedText>

        <ThemedView style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            placeholderTextColor="#999"
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
          <ThemedText style={styles.errorText}>{errors.identifier}</ThemedText>
        )}

        <ThemedView style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#999"
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
            <ThemedText style={styles.signUpLink}>Sign up</ThemedText>
          </Link>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
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
});
