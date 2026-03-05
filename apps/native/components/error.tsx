import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import Logo from "@/assets/icon.png";
import { Container } from "./container";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/lib/use-color-scheme";
import { router } from "expo-router";

const Error = ({ error, refetch }: { error: string; refetch: () => void }) => {
  const { isDarkColorScheme } = useColorScheme();
  return (
    <Container>
      <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Image source={Logo} className="w-20 h-20 mb-8" resizeMode="contain" />

        <View className="items-center mb-8">
          <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Oops!
          </Text>
          <Text className="text-gray-600 text-center mb-4 leading-6">
            {error || "An unexpected error occurred."}
          </Text>
        </View>

        <View className="w-full gap-y-4">
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-[#19B360] py-4 px-8 rounded-lg w-full"
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Try Again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            // onPress={() => router.replace("/(protected)/(tabs)/home")}
            onPress={() => router.replace("/")}
            className="border border-gray-300 py-4 px-8 rounded-lg w-full"
            activeOpacity={0.8}
          >
            <Text className="text-gray-700 text-center font-semibold text-lg">
              Go Home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {}}
            className="border border-gray-300 py-4 px-8 rounded-lg w-full"
            activeOpacity={0.8}
          >
            <Text className="text-gray-700 text-center font-semibold text-lg">
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
};

export default Error;
