import { Image, View, Text, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "@/constants";
import { router } from "expo-router";
import paypal from "@/assets/icons/cards/paypal.png";
import paystack from "@/assets/icons/cards/paystack.png";
import googlePay from "@/assets/icons/cards/google-pay.png";
import applePay from "@/assets/icons/cards/apple-pay.png";
import helpmee from "@/assets/icons/cards/helpmee.png";
import creditCard from "@/assets/icons/cards/card.png";

const PaymentMethods = () => {
  return (
    <View className="flex-1 bg-white h-full">
      <StatusBar style="light" />
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
            Payment Methods
          </Text>
        </View>
        <ScrollView className="flex-1 px-6 py-4">
          <Text className="text-gray-500 text-sm mb-4">In-App Method</Text>
          <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-4">
                <Image
                  source={helpmee}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-black text-base">Helpmee Wallet</Text>
            </View>
            <View className="self-end">
              <BouncyCheckbox
                size={20}
                fillColor="#22C55E"
                unFillColor="#FFFFFF"
                isChecked={true}
                useBuiltInState={false}
                iconStyle={{ borderColor: "#22C55E", borderRadius: 10 }}
                innerIconStyle={{ borderWidth: 2, borderRadius: 10 }}
                onPress={() => {}}
                className="ml-4"
              />
            </View>
          </View>

          <Text className="text-gray-500 text-sm mt-6 mb-4">
            Credit and Debit Card
          </Text>
          <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-4">
                <Image
                  source={creditCard}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-gray-500 text-base">Add New Card</Text>
            </View>
            <View className="self-end">
              <BouncyCheckbox
                size={20}
                fillColor="#22C55E"
                unFillColor="#FFFFFF"
                isChecked={false}
                useBuiltInState={false}
                iconStyle={{ borderColor: "#D1D5DB", borderRadius: 10 }}
                innerIconStyle={{ borderWidth: 2, borderRadius: 10 }}
                onPress={() => {}}
                className="ml-4"
              />
            </View>
          </TouchableOpacity>

          <Text className="text-gray-500 text-sm mt-6 mb-4">
            More Payment Options
          </Text>
          <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100 w-full flex-1">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-4">
                <Image
                  source={paypal}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-gray-500 text-base">Paypal</Text>
            </View>
            <View className="self-end">
              <BouncyCheckbox
                size={20}
                fillColor="#22C55E"
                unFillColor="#FFFFFF"
                isChecked={false}
                useBuiltInState={false}
                iconStyle={{ borderColor: "#D1D5DB", borderRadius: 10 }}
                innerIconStyle={{ borderWidth: 2, borderRadius: 10 }}
                onPress={() => {}}
                className="ml-4"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-4">
                <Image
                  source={paystack}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-gray-500 text-base">Paystack</Text>
            </View>
            <View className="self-end">
              <BouncyCheckbox
                size={20}
                fillColor="#22C55E"
                unFillColor="#FFFFFF"
                isChecked={false}
                useBuiltInState={false}
                iconStyle={{ borderColor: "#D1D5DB", borderRadius: 10 }}
                innerIconStyle={{ borderWidth: 2, borderRadius: 10 }}
                onPress={() => {}}
                className="ml-4"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-4">
                <Image
                  source={googlePay}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-gray-500 text-base">Google Pay</Text>
            </View>
            <View className="self-end">
              <BouncyCheckbox
                size={20}
                fillColor="#22C55E"
                unFillColor="#FFFFFF"
                isChecked={false}
                useBuiltInState={false}
                iconStyle={{ borderColor: "#D1D5DB", borderRadius: 10 }}
                innerIconStyle={{ borderWidth: 2, borderRadius: 10 }}
                onPress={() => {}}
                className="ml-4"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between py-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-4">
                <Image
                  source={applePay}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-gray-500 text-base">Apple Pay</Text>
            </View>
            <View className="self-end">
              <BouncyCheckbox
                size={20}
                fillColor="#22C55E"
                unFillColor="#FFFFFF"
                isChecked={false}
                useBuiltInState={false}
                iconStyle={{ borderColor: "#D1D5DB", borderRadius: 10 }}
                innerIconStyle={{ borderWidth: 2, borderRadius: 10 }}
                onPress={() => {}}
                className="ml-4"
              />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default PaymentMethods;
