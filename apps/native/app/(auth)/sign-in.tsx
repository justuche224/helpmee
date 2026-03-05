import React, { useState } from "react";
import { ICONS, LOGO } from "@/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Link, router } from "expo-router";
import { useGradualAnimation } from "@/hooks/use-gradual-animation";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { Container } from "@/components/container";
import { authClient } from "@/lib/auth-client";

const SignIn = () => {
  const { height } = useGradualAnimation();
  const keyboardPadding = useAnimatedStyle(() => {
    return {
      height: height.value + 40,
    };
  }, []);
  const { colorScheme } = useColorScheme();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { eye, eyeHide } = ICONS;

  const isEmail = (input: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  };

  const handleSignInWithGoogle = async () => {
    try {
      const data = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      const { data: res, error } = data;
      console.log(res, error);
      if (error) {
        console.log(error);
        throw new Error(error.message);
      }
      if (res) {
        Toast.show({
          type: "success",
          text1: "Signed in successfully",
          text2: "A verification email has been sent to your email address",
        });
        // router.replace("/(protected)/(tabs)/home");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to sign in with Google",
        text2: error instanceof Error ? error.message : "Something went wrong",
      });
    }
  };

  const handleSubmit = async () => {
    if (isLoading || !form.email || !form.password) return;
    setIsLoading(true);
    try {
      const { data: res, error } = await authClient.signIn.email({
        email: form.email,
        password: form.password,
        callbackURL: "/",
        rememberMe:true
      });
      if (error) {
        if (error.status === 403) {
          Toast.show({
            type: "error",
            text1: "Email not verified",
            text2:
              "Please check your email to verify your account, try signing in with your email address to get a verification email",
          });
          if (isEmail(form.email)) {
            await authClient.sendVerificationEmail({
              email: form.email,
              callbackURL: `${process.env.EXPO_PUBLIC_SERVER_URL}/v1/auth/email-verificatied`,
            });
          }
        } else {
          throw new Error(error.message);
        }
      }
      if (res && res.user) {
        Toast.show({
          type: "success",
          text1: "Signed in successfully",
        });
        console.log('From sign in res && res.user block ');
        console.log(res.user);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to Sign in",
        text2: error instanceof Error ? error.message : "Something went wrong",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Container>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <ScrollView>
          <View className="h-full w-full items-center flex flex-col gap-[32px]">
            <Image source={LOGO} className="h-[33px] w-auto mt-[61px]" />
            <View className="flex flex-col gap-[8px] text-center">
              <Text className="text-[#161616] font-semibold text-3xl">
                Welcome Back!
              </Text>
              <Text className="text-[#A1A1A1] font-normal text-base text-center">
                You've been missed.
              </Text>
            </View>
            <View className="w-full max-w-[327px]">
              <TouchableOpacity
                disabled={isLoading}
                className="bg-[#161616] rounded-[10px] py-[16px] px-[75px] w-full disabled:opacity-50"
                onPress={handleSignInWithGoogle}
              >
                <Text className="text-white font-semibold text-base text-center">
                  Sign in with Google
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex gap-[11px] w-full max-w-[327px]">
              <Text className="text-[#8E9BAE] font-semibold text-base text-center">
                OR
              </Text>
            </View>
            <View className="w-full max-w-[327px]">
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
                value={form.email}
                onChangeText={(e) => setForm({ ...form, email: e })}
                placeholder="Email"
                placeholderTextColor="#8E9BAE"
                className="text-[#8E9BAE] font-psemibold text-base border border-[#E2E8F0] rounded-[10px] py-[17px] px-[21px] w-full "
                autoComplete="email"
                textContentType="emailAddress"
                accessibilityLabel="Email address"
                accessibilityHint="Enter your email address"
              />
              <View className="relative mt-[16px]">
                <TextInput
                  editable={!isLoading}
                  value={form.password}
                  onChangeText={(e) => setForm({ ...form, password: e })}
                  placeholder="Password"
                  placeholderTextColor="#8E9BAE"
                  className="text-[#8E9BAE] font-psemibold text-base border border-[#E2E8F0] rounded-[10px] py-[17px] px-[21px] w-full"
                  secureTextEntry={!showPassword}
                  autoComplete="current-password"
                  textContentType="password"
                  accessibilityLabel="Password"
                  accessibilityHint="Enter your password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center justify-center pr-4"
                >
                  <Image
                    source={!showPassword ? eye : eyeHide}
                    className="h-6 w-6"
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              <Text className="text-primary font-bold text-sm text-right mt-[16px]">
                <Link href="/(auth)/forgot-password">Forgot Password?</Link>
              </Text>
              <TouchableOpacity
                disabled={isLoading || !form.email || !form.password}
                onPress={handleSubmit}
                className="bg-primary rounded-[10px] py-[16px] px-[75px] w-full mt-[16px]"
              >
                <Text className="text-white font-semibold text-base text-center">
                  Sign in
                </Text>
              </TouchableOpacity>
              <Text className="text-center text-[#8E9BAE] font-semibold text-base mt-[16px]">
                Don't have an account?{" "}
                <Text className="text-primary font-semibold text-base">
                  <Link href="/sign-up">Sign up</Link>
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
        <Animated.View style={keyboardPadding} />
        {isLoading && (
          <View className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <View className="bg-white rounded-[10px] p-6 flex items-center justify-center">
              <ActivityIndicator size="large" color="#19B360" />
              <Text className="text-[#161616] font-semibold text-base mt-4">
                Signing in...
              </Text>
            </View>
          </View>
        )}
      </Container>
    </>
  );
};

export default SignIn;
