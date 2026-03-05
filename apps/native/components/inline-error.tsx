import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import Logo from "@/assets/icon.png";

const InlineError = ({
  error,
  refetch,
}: {
  error: string;
  refetch: () => void;
}) => {
  return (
    <View className="items-center justify-center px-6 w-full">
      <Image source={Logo} className="w-6 h-6 mb-8" resizeMode="contain" />

      <View className="items-center mb-8">
        <Text className="text-lg font-bold text-gray-800 mb-2 text-center">
          Oops!
        </Text>
        <Text className="text-gray-600 text-center mb-4 leading-6">
          {error || "An unexpected error occurred."}
        </Text>
      </View>

      <View className="w-full gap-y-4">
        <TouchableOpacity
          onPress={() => refetch()}
          className="bg-[#19B360] py-2 px-4 rounded-lg w-full"
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Try Again
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {}}
          className="border border-gray-300 py-2 px-4 rounded-lg w-full"
          activeOpacity={0.8}
        >
          <Text className="text-gray-700 text-center font-semibold text-lg">
            Contact Support
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default InlineError;
