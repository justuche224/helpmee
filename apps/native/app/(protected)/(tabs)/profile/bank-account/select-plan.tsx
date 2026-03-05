import {
  Image,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "@/constants";
import { router } from "expo-router";
import gold from "@/assets/images/plans/gold.png";
import regular from "@/assets/images/plans/regular.png";

type Plan = {
  id: string;
  name: string;
  badge: string;
  color: string;
  background: any;
  features: string[];
};

const plans: Plan[] = [
  {
    id: "silver",
    name: "Silver",
    badge: "I don Set",
    color: "#19B360",
    background: regular,
    features: ["Limited transfers", "25 items for shops", "Limited ads"],
  },
  {
    id: "gold",
    name: "Gold",
    badge: "Pablo",
    color: "#F59E0B",
    background: gold,
    features: ["Unlimited transfers", "Unlimited items", "Access to ads"],
  },
];

const SelectPlan = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>("silver");

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const PlanCard = ({
    plan,
    isSelected,
  }: {
    plan: Plan;
    isSelected: boolean;
  }) => {
    return (
      <TouchableOpacity
        onPress={() => handlePlanSelect(plan.id)}
        className={`rounded-3xl overflow-hidden ${
          isSelected ? "opacity-100" : "opacity-70"
        }`}
        style={{
          width: 165,
          height: 290,
          borderWidth: isSelected ? 3 : 1,
          borderColor: isSelected ? plan.color : "#E5E7EB",
          borderStyle: isSelected ? "solid" : "dashed",
        }}
      >
        <ImageBackground
          source={plan.background}
          className="flex-1 p-6 justify-between"
          resizeMode="cover"
        >
          <View>
            <View
              className="self-start px-3 py-1 rounded-full mb-4"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            >
              <Text className="text-white text-sm font-medium">
                {plan.badge}
              </Text>
            </View>

            <Text className="text-white text-2xl font-bold mb-6">
              {plan.name}
            </Text>
          </View>

          <View className="gap-3">
            {plan.features.map((feature, index) => (
              <Text key={index} className="text-white text-base">
                {feature}
              </Text>
            ))}
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

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
            Select Plans
          </Text>
          <TouchableOpacity className="relative">
            <Image
              source={ICONS.notificationBell}
              className="w-6 h-6"
              resizeMode="contain"
            />
            <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-4 py-6">
            <Text className="text-gray-400 text-base mb-8 leading-6 px-2">
              Select your preferred plan and your account will follow.
            </Text>

            <View className="relative h-96 mb-12 px-2">
              <View className="absolute left-0 top-0 z-10">
                <PlanCard
                  plan={plans[0]}
                  isSelected={selectedPlan === plans[0].id}
                />
              </View>
              <View className="absolute right-0 top-12">
                <PlanCard
                  plan={plans[1]}
                  isSelected={selectedPlan === plans[1].id}
                />
              </View>
            </View>

            <TouchableOpacity
              className="bg-[#19B360] rounded-2xl py-4 mt-8 mx-6"
              onPress={() => {
                // Handle plan selection confirmation
                console.log(`Selected plan: ${selectedPlan}`);
              }}
            >
              <Text className="text-white text-center text-lg font-semibold">
                Confirm Plan
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default SelectPlan;
