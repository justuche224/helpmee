import React, { useState, useEffect } from "react";
import { ICONS, LOGO } from "@/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useGradualAnimation } from "@/hooks/use-gradual-animation";
import { authClient } from "@/lib/auth-client";
import { Container } from "@/components/container";

const isProd = process.env.NODE_ENV === "production";
const serverIp = process.env.EXPO_PUBLIC_SERVER_IP;
const port = process.env.EXPO_PUBLIC_SERVER_PORT;

const baseURL = isProd ? process.env.EXPO_PUBLIC_SERVER_URL : `http://${serverIp}:${port}`;

const SignUp = () => {
  const { height } = useGradualAnimation();
  const keyboardPadding = useAnimatedStyle(() => {
    return {
      height: height.value + 40,
    };
  }, []);
  const { colorScheme } = useColorScheme();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const { eye, eyeHide } = ICONS;

  const handleSignUpWithGoogle = async () => {
    try {
      const data = await authClient.signIn.social({
        provider: "google",
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
        router.replace("/(protected)/(tabs)/home");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to sign up with Google",
        text2: error instanceof Error ? error.message : "Something went wrong",
      });
    }
  };

  const handleSubmit = async () => {
    if (isLoading || !form.name || !form.email || !form.password) return;
    setIsLoading(true);
    try {
      const data = await authClient.signUp.email({
        email: form.email,
        password: form.password,
        name: form.name,
        callbackURL: `${baseURL}/v1/auth/email-verificatied`,
      });
      const { data: res, error } = data;
      if (error) {
        throw new Error(error.message);
      }
      if (res?.user) {
        Toast.show({
          type: "success",
          text1: "Account created successfully",
          text2: "A verification email has been sent to your email address",
        });
        setTimeout(() => {
          router.replace("/sign-in");
        }, 2000);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to create account",
        text2: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <Container>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <ScrollView className="flex-1">
          <View className="h-full w-full items-center flex flex-col gap-[32px]">
            <Image source={LOGO} className="h-[33px] w-auto mt-[61px]" />
            <View className="flex flex-col gap-[8px] text-center">
              <Text className="text-[#161616] font-semibold text-3xl text-center">
                Create Account!
              </Text>
              <Text className="text-[#A1A1A1] font-normal text-base text-center">
                It only takes a minute to create your account
              </Text>
            </View>
            <View className="w-full max-w-[327px]">
              <TouchableOpacity
                disabled={isLoading}
                className="bg-[#161616] rounded-[10px] py-[16px] px-[75px] w-full disabled:opacity-50"
                onPress={handleSignUpWithGoogle}
              >
                <Text className="text-white font-semibold text-base text-center">
                  Sign up with Google
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
                editable={!isLoading}
                autoCapitalize="words"
                value={form.name}
                onChangeText={(e) => setForm({ ...form, name: e })}
                placeholder="Full Name"
                aria-label="Full Name"
                placeholderTextColor="#8E9BAE"
                className="text-[#8E9BAE] font-psemibold text-base border border-[#E2E8F0] rounded-[10px] py-[17px] px-[21px] w-full "
                autoComplete="name"
                textContentType="name"
                accessibilityLabel="Full Name"
                accessibilityHint="Enter your full name"
              />
              <TextInput
                keyboardType="email-address"
                editable={!isLoading}
                value={form.email}
                onChangeText={(e) => setForm({ ...form, email: e })}
                placeholder="Email Address"
                placeholderTextColor="#8E9BAE"
                className="text-[#8E9BAE] font-psemibold text-base border border-[#E2E8F0] rounded-[10px] py-[17px] px-[21px] w-full mt-[16px]"
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
              <View className="text-[#8E9BAE] font-semibold text-sm text-center mt-[16px] flex flex-row items-center gap-[4px]">
                <BouncyCheckbox
                  size={20}
                  fillColor="#19B360"
                  className="w-full flex flex-row items-center justify-center"
                  onPress={(isChecked: boolean) => {
                    setForm({ ...form, agreeToTerms: isChecked });
                  }}
                  textComponent={
                    <Text className="text-sm ml-2">
                      I agree to{" "}
                      <Text className="text-primary font-semibold text-sm underline">
                        Terms of Services
                      </Text>
                      and{" "}
                      <Text className="text-primary font-semibold text-sm underline">
                        Privacy Policy
                      </Text>
                    </Text>
                  }
                />
              </View>
              <TouchableOpacity
                disabled={
                  isLoading || !form.name || !form.email || !form.password
                }
                onPress={handleSubmit}
                className="bg-primary rounded-[10px] py-[16px] px-[75px] w-full mt-[16px]"
              >
                <Text className="text-white font-semibold text-base text-center">
                  Sign up
                </Text>
              </TouchableOpacity>
              <Text className="text-center text-[#8E9BAE] font-semibold text-base mt-[16px]">
                Already have an account?{" "}
                <Text className="text-primary font-semibold text-base">
                  <Link href="/sign-in">Sign in</Link>
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
                Creating account...
              </Text>
            </View>
          </View>
        )}
      </Container>
    </>
  );
};

export default SignUp;
