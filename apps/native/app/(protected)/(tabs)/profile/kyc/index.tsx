import { Image, View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "@/constants";
import { router } from "expo-router";
import arrowDown from "@/assets/icons/arrow-down.png";
import arrowUp from "@/assets/icons/arrow-up.png";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/loader";
import SubmittedView from "./components/SubmittedView";
import Error from "@/components/error";

interface Tier {
  level: number;
  label: string;
  dailyLimit: string;
  maxBalance: string;
  requirements: string[];
  isCurrent: boolean;
  isNext: boolean;
}

const Index = () => {
  const [showKycDetails, setShowKycDetails] = useState(false);
  const {
    data: KYCInfo,
    isPending,
    error,
    refetch,
  } = useQuery(orpc.kyc.getUserKYC.queryOptions());

  if (isPending) {
    return <Loader />;
  }

  if (error) {
    return <Error error={error.message} refetch={refetch} />;
  }

  if (KYCInfo?.kycData) {
    console.log("KYCInfo.kycData is", KYCInfo.kycData);
    return <SubmittedView />;
  }

  const tiers: Tier[] = [
    {
      level: 1,
      label: "Tier 1",
      dailyLimit: "₦50,000",
      maxBalance: "₦300,000",
      requirements: ["Verify BVN or NIN"],
      isCurrent: false,
      isNext: false,
    },
    {
      level: 2,
      label: "Tier 2",
      dailyLimit: "₦200,000",
      maxBalance: "₦500,000",
      requirements: ["Verify BVN", "Verify NIN"],
      isCurrent: true,
      isNext: false,
    },
    {
      level: 3,
      label: "Tier 3",
      dailyLimit: "₦5,000,000",
      maxBalance: "Unlimited",
      requirements: [
        "Face Recognition",
        "Proof of Address",
        "Verify NIN Photo",
      ],
      isCurrent: false,
      isNext: true,
    },
  ];

  const slides = [
    { level: 3, label: "Next Level" },
    { level: 2, label: "Current" },
    { level: 1, label: "" },
  ];

  const TierCard = ({
    tier,
    isMain = false,
  }: {
    tier: Tier;
    isMain?: boolean;
  }) => (
    <View className={`mx-4 mb-6 ${isMain ? "mb-8" : ""}`}>
      <View
        className={`rounded-2xl p-6 ${isMain ? "bg-green-500" : "bg-gray-800"}`}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Text
              className={`text-2xl font-bold ${
                isMain ? "text-white" : "text-white"
              }`}
            >
              {tier.label}
            </Text>
            {tier.isCurrent && (
              <View className="ml-3 bg-yellow-400 px-2 py-1 rounded-full">
                <Text className="text-black text-xs font-semibold">
                  Current
                </Text>
              </View>
            )}
            {tier.isNext && (
              <View className="ml-3 bg-blue-400 px-2 py-1 rounded-full">
                <Text className="text-white text-xs font-semibold">
                  Next Level
                </Text>
              </View>
            )}
          </View>
          {isMain && (
            <View className="bg-green-400 w-12 h-12 rounded-full items-center justify-center">
              <Text className="text-green-800 text-lg font-bold">
                {tier.level}
              </Text>
              <Text className="text-green-800 text-xs">Tier</Text>
            </View>
          )}
        </View>

        <View className="flex-row justify-between mb-4">
          <View>
            <Text
              className={`${
                isMain ? "text-green-100" : "text-gray-300"
              } text-sm mb-1`}
            >
              Daily Transaction Limit
            </Text>
            <Text
              className={`${
                isMain ? "text-white" : "text-white"
              } text-xl font-bold`}
            >
              {tier.dailyLimit}
            </Text>
          </View>
          <View>
            <Text
              className={`${
                isMain ? "text-green-100" : "text-gray-300"
              } text-sm mb-1`}
            >
              Maximum Balance
            </Text>
            <Text
              className={`${
                isMain ? "text-white" : "text-white"
              } text-xl font-bold`}
            >
              {tier.maxBalance}
            </Text>
          </View>
        </View>

        {isMain && (
          <>
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <View className="bg-green-400 w-8 h-5 rounded items-center justify-center mr-2">
                  <Text className="text-green-800 text-xs font-bold">NIN</Text>
                </View>
                <Text className="text-white flex-1">**** *** 0027</Text>
                <TouchableOpacity className="flex-row items-center">
                  <Text className="text-white mr-1">Verify NIN photo</Text>
                  <Image
                    source={ICONS.rightArrow}
                    className="w-4 h-4 tint-white"
                  />
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center">
                <View className="bg-green-400 w-8 h-5 rounded items-center justify-center mr-2">
                  <Text className="text-green-800 text-xs font-bold">BVN</Text>
                </View>
                <Text className="text-white">**** *** 0015</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowKycDetails(!showKycDetails)}
              className="flex-row items-center justify-between"
            >
              <Text className="text-white text-lg font-semibold">
                KYC Details
              </Text>
              <Image
                source={showKycDetails ? arrowUp : arrowDown}
                className="w-4 h-4"
              />
            </TouchableOpacity>

            {showKycDetails && (
              <View className="mt-4 space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-green-100">Full name</Text>
                  <Text className="text-white font-semibold">
                    DONALD UCHENNA AMOKE
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-green-100">Gender</Text>
                  <Text className="text-white font-semibold">Male</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-green-100">Date of Birth</Text>
                  <Text className="text-white font-semibold">Aug **,**</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-green-100">Mobile number</Text>
                  <Text className="text-white font-semibold">08057707327</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-green-100">Face Photo</Text>
                  <TouchableOpacity className="flex-row items-center">
                    <Text className="text-white font-semibold mr-1">View</Text>
                    <Image
                      source={ICONS.rightArrow}
                      className="w-4 h-4 tint-white"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity className="bg-white/20 rounded-lg py-3 mt-4">
                  <Text className="text-white text-center font-semibold">
                    Update Information
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {!isMain && (
          <View className="mt-4">
            <Text className="text-gray-300 text-sm mb-2">Requirements</Text>
            <View className="flex-row flex-wrap">
              {tier.requirements.map((req: string, index: number) => (
                <View key={index} className="flex-row items-center mr-4 mb-2">
                  <Text className="text-white text-2xl mr-1">•</Text>
                  <Text className="text-white text-sm">{req}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-row items-center px-6 py-4 border-b border-gray-100 bg-white">
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={ICONS.arrowLeft}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text className="text-black text-xl font-bold text-center flex-1">
            KYC Levels
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="pt-6">
            <TierCard tier={tiers[1]} isMain={true} />

            <View className="px-6 py-4">
              <View className="flex-row items-center justify-center mb-2">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="mx-4 text-gray-600 font-semibold">
                  KYC Level Benefit
                </Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>
              <Text className="text-center text-gray-600 text-sm">
                The higher the level, the higher the transaction limit
              </Text>
            </View>

            {slides.map((slide, index) => {
              const tier = tiers.find((t) => t.level === slide.level);
              if (!tier || tier.isCurrent) return null;
              return <TierCard key={tier.level} tier={tier} />;
            })}

            <View className="flex-row justify-center space-x-2 mb-6">
              {slides.map((_, index) => (
                <View
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === 0 ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        <View className="px-6 pb-6 mb-16">
          <View className="bg-gray-100 rounded-2xl p-4 mb-4">
            <View className="flex-row items-center mb-2">
              <View className="bg-green-500 w-8 h-8 rounded-full items-center justify-center mr-3">
                <Text className="text-white text-xs font-bold">3</Text>
              </View>
              <View className="flex-1">
                <Text className="text-black font-semibold">
                  Upgrade to Tier 3
                </Text>
                <Text className="text-gray-600 text-sm">
                  Get transaction limit increase & win rewards
                </Text>
              </View>
              <TouchableOpacity className="bg-green-500 px-4 py-2 rounded-lg">
                <Text className="text-white font-semibold">Upgrade</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/profile/kyc/submit")}
            className="bg-green-500 rounded-2xl py-4"
          >
            <Text className="text-white text-center text-lg font-bold">
              Verify to Upgrade
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Index;
