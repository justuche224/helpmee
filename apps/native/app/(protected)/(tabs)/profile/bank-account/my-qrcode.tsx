import { Image, View, Text, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "@/constants";
import { router } from "expo-router";
import qrcode from "@/assets/images/bank/qrcode.png";

const MyQrCode = () => {
  const accountNumber = "6132406178";

  return (
    <View className="flex-1 bg-white h-full">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-row items-center px-6 py-4 border-b border-gray-100 bg-white">
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={ICONS.arrowLeft}
              className="w-auto h-5 text-black"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text className="text-black text-xl font-bold text-center flex-1">
            My QR Code
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32 }}
        >
          <View className="items-center">
            <Text className="text-gray-400 text-base text-center mb-8">
              Your QR-code for account {accountNumber}
            </Text>

            <View className="bg-gray-50 border border-gray-200 rounded-3xl p-8 mb-8 w-full max-w-sm">
              <View className="items-center justify-center">
                <Image
                  source={qrcode}
                  className="w-64 h-64"
                  resizeMode="contain"
                />
              </View>
            </View>

            <Text className="text-gray-400 text-base text-center px-8 leading-6">
              People can scan your QR-code to make transfers to your wallet
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default MyQrCode;
