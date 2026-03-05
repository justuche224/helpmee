import { Image, View, Text, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "@/constants";
import { router } from "expo-router";
import arrowRight from "@/assets/icons/cards/arrow-right.png";
import paddlock from "@/assets/icons/bank-account/paddlock.png";
import plans from "@/assets/icons/bank-account/plans.png";
import qrcode from "@/assets/icons/bank-account/qrcode.png";
import bank from "@/assets/icons/bank-account/bank.png";
import limit from "@/assets/icons/bank-account/limit.png";

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
          <Text className="text-black text-xl font-bold">Bank Account</Text>
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
            onPress={() => router.push("/profile/bank-account/create-pin")}
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-4">
                <Image
                  source={paddlock}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-black text-base">Transaction PIN</Text>
            </View>
            <Image
              source={arrowRight}
              className="w-4 h-4"
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/profile/bank-account/select-plan")}
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-4">
                <Image
                  source={plans}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-black text-base">Select Plans</Text>
            </View>
            <Image
              source={arrowRight}
              className="w-4 h-4"
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.push("/profile/bank-account/update-bank-account")
            }
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-4">
                <Image source={bank} className="w-6 h-6" resizeMode="contain" />
              </View>
              <Text className="text-black text-base">Update Bank Account</Text>
            </View>
            <Image
              source={arrowRight}
              className="w-4 h-4"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/profile/bank-account/my-qrcode")}
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-4">
                <Image
                  source={qrcode}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-black text-base">My QR Code</Text>
            </View>
            <Image
              source={arrowRight}
              className="w-4 h-4"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              router.push("/profile/bank-account/transaction-limit")
            }
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-4">
                <Image
                  source={limit}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-black text-base">Transaction Limit</Text>
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
