import { Image, View, Text, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "@/constants";
import { router } from "expo-router";
import arrowRight from "@/assets/icons/cards/arrow-right.png";
import creditCard from "@/assets/icons/cards/card.png";
import paymentMethods from "@/assets/icons/cards/payment-methods.png";
import requestCard from "@/assets/icons/cards/request-card.png";

const Index = () => {
  return (
    <View className="flex-1 bg-white h-full">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={ICONS.arrowLeft}
              className="w-auto h-5 text-black"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text className="text-black text-xl font-bold">Cards</Text>
          <TouchableOpacity className="bg-black/20 rounded-lg p-2 relative">
            <Image
              source={ICONS.notificationBell}
              className="w-6 h-6"
              resizeMode="contain"
            />
            <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </TouchableOpacity>
        </View>
        <ScrollView className="flex-1 px-6 py-4">
          <TouchableOpacity
            onPress={() => router.push("/profile/cards/manage-cards")}
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mr-4">
                <Image
                  source={creditCard}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-black text-base">Credit & Debit Card</Text>
            </View>
            <Image
              source={arrowRight}
              className="w-4 h-4"
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/profile/cards/payment-methods")}
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mr-4">
                <Image
                  source={paymentMethods}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-black text-base">Payment Methods</Text>
            </View>
            <Image
              source={arrowRight}
              className="w-4 h-4"
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/profile/cards/request-card")}
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mr-4">
                <Image
                  source={requestCard}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-black text-base">Request Card</Text>
            </View>
            <Image
              source={arrowRight}
              className="w-4 h-4"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Index;
