import React, { useState } from "react";
import { LOGO } from "@/constants";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { authClient } from "@/lib/auth-client";
import { router } from "expo-router";
import { Container } from "@/components/container";

const ForgotPassword = () => {
  const { colorScheme } = useColorScheme();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSendResetCode = async () => {
    if (isLoading || !email) return;
    setIsLoading(true);
    try {
      const { data, error } = await authClient.requestPasswordReset({
        email: email,
        redirectTo: `${process.env.EXPO_PUBLIC_SERVER_URL}/v1/auth/reset-password`,
      });
      if (error) {
        throw new Error(error.message);
      }
      if (data?.status) {
        Toast.show({
          type: "success",
          text1: "Reset link sent successfully",
          text2: "Please check your email to reset your password",
        });
        router.replace("/sign-in");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to Sign in",
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
        <ScrollView>
          <View className="h-full w-full items-center flex flex-col gap-[32px]">
            <Image source={LOGO} className="h-[33px] w-auto mt-[61px]" />
            <View className="flex flex-col gap-[8px] text-center">
              <Text className="text-[#161616] font-semibold text-3xl text-center">
                Forgot Password
              </Text>
              <Text className="text-[#A1A1A1] font-normal text-base text-center px-4">
                Just input your email to set a new password
              </Text>
            </View>
            <View className="w-full max-w-[327px]">
              <TextInput
                editable={!isLoading}
                value={email}
                onChangeText={setEmail}
                placeholder="Email Address"
                placeholderTextColor="#8E9BAE"
                className="text-[#8E9BAE] font-psemibold text-base border border-[#E2E8F0] rounded-[10px] py-[17px] px-[21px] w-full"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                accessibilityLabel="Email address"
                accessibilityHint="Enter your email address"
              />
              <TouchableOpacity
                disabled={isLoading || !email}
                onPress={handleSendResetCode}
                className={`rounded-[10px] py-[16px] px-[75px] w-full mt-[32px] ${
                  email && !isLoading ? "bg-[#22C55E]" : "bg-[#E2E8F0]"
                }`}
              >
                <Text
                  className={`font-semibold text-base text-center ${
                    email && !isLoading ? "text-white" : "text-[#8E9BAE]"
                  }`}
                >
                  {isLoading ? "Sending..." : "Send Reset Code"}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex flex-row items-center gap-[8px]">
              <View className="w-[20px] h-[20px] bg-[#8E9BAE] rounded-full items-center justify-center">
                <Text className="text-white text-xs">?</Text>
              </View>
              <Text className="text-[#8E9BAE] font-normal text-base">
                Need help?{" "}
                <Text className="text-[#22C55E] font-semibold">Click Here</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
        {isLoading && (
          <View className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <View className="bg-white rounded-[10px] p-6 flex items-center justify-center">
              <ActivityIndicator size="large" color="#19B360" />
              <Text className="text-[#161616] font-semibold text-base mt-4">
                Sending reset code...
              </Text>
            </View>
          </View>
        )}
      </Container>
    </>
  );
};

export default ForgotPassword;
