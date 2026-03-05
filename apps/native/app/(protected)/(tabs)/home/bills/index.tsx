import { Image, View, Text, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "@/constants";
import { router } from "expo-router";
import arrowRight from "@/assets/icons/cards/arrow-right.png";
import electricity from "@/assets/icons/bills/electricity.png";
import cableTv from "@/assets/icons/bills/cable-tv.png";
import subscriptions from "@/assets/icons/bills/subscriptions.png";
import betting from "@/assets/icons/bills/betting.png";
import others from "@/assets/icons/bills/others.png";

const Index = () => {
  const billItems = [
    {
      id: 1,
      icon: electricity,
      title: "Electricity",
      route: "/home/bills/electricity" as any,
    },
    {
      id: 2,
      icon: cableTv,
      title: "Cable TV",
      route: "/home/bills/cable-tv" as any,
    },
    {
      id: 3,
      icon: betting,
      title: "Betting",
      route: "/home/bills/betting" as any,
    },
    {
      id: 4,
      icon: subscriptions,
      title: "Subscriptions",
      route: "/home/bills/subscriptions" as any,
    },
    {
      id: 5,
      icon: others,
      title: "Others",
      route: "/home/bills/others" as any,
    },
  ];

  return (
    <View className="flex-1 bg-black h-full">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1 bg-black" edges={["top"]}>
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 bg-black">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-white/50 rounded-lg p-2"
          >
            <Image
              source={ICONS.arrowLeft}
              className="w-auto h-5 text-white"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Bills</Text>
          <TouchableOpacity className="bg-white/50 rounded-lg p-2">
            <Image
              source={ICONS.notificationBell}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <ScrollView className="flex-1 px-6 py-4 bg-white">
          {billItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(item.route)}
              className="flex-row items-center justify-between py-4 border-b border-gray-100"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-4">
                  <Image
                    source={item.icon}
                    className="w-6 h-6"
                    resizeMode="contain"
                  />
                </View>
                <Text className="text-black text-base">{item.title}</Text>
              </View>
              <Image
                source={arrowRight}
                className="w-4 h-4"
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Index;
