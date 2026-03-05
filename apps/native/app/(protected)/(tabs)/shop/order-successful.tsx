import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import CheckIcon from "@/assets/icons/shop/check-mark-green.png";

const OrderSuccessful = () => {
  return (
    <SafeAreaView className="flex-1 bg-white pb-16">
      <View className="flex-1 justify-center items-center px-8">
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-green-500 rounded-full justify-center items-center mb-6">
            <Image
              source={CheckIcon}
              className="w-12 h-12"
              resizeMode="contain"
            />
          </View>
          <Text className="text-2xl font-bold text-green-500 mb-2">
            Order Successful!
          </Text>
          <Text className="text-base text-gray-500 text-center leading-6">
            Your order have been successfully placed for delivery.
          </Text>
        </View>
      </View>

      <View className="px-8 pb-8">
        <TouchableOpacity
          className="bg-green-500 rounded-2xl py-4 mb-4"
          onPress={() => router.push("/(protected)/(tabs)/shop")}
        >
          <Text className="text-white text-center font-bold text-lg">
            Track My Order Now
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white border border-gray-300 rounded-2xl py-4"
          onPress={() => router.push("/(protected)/(tabs)/shop")}
        >
          <Text className="text-gray-900 text-center font-bold text-lg">
            Continue Shopping
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OrderSuccessful;
