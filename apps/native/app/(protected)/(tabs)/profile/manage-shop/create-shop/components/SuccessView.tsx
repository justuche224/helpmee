import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import Logo from "@/assets/images/logo.png";

const SuccessView: React.FC = () => {
  return (
    <View className="flex-1 px-6 py-4 justify-center items-center">
      <Image source={Logo} className="w-40 h-20 mb-8" resizeMode="contain" />
      <View className="items-center mb-8">
        <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-4">
          <View className="w-10 h-10 bg-emerald-500 rounded-full items-center justify-center">
            <Text className="text-white text-2xl font-bold">✓</Text>
          </View>
        </View>
        <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Store Created Successfully!
        </Text>
        <Text className="text-gray-600 text-center mb-4 leading-6">
          Your store has been created and is now live. You can start adding
          products and managing your store.
        </Text>
      </View>
      <View className="w-full gap-y-4">
        <TouchableOpacity
          onPress={() => router.push("/profile/manage-shop")}
          className="bg-[#19B360] py-4 px-8 rounded-lg w-full"
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Manage Store
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(protected)/(tabs)/shop")}
          className="border border-gray-300 py-4 px-8 rounded-lg w-full"
          activeOpacity={0.8}
        >
          <Text className="text-gray-700 text-center font-semibold text-lg">
            Browse Stores
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SuccessView;
