import {
  Image,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "@/constants";
import { router } from "expo-router";
import arrowDown from "@/assets/icons/arrow-down.png";

const Index = () => {
  const [selectedCableCompany, setSelectedCableCompany] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const cableCompanies = ["DStv", "GOtv", "StarTimes", "Showmax", "Netflix"];

  const handleCableCompanySelect = (company: string) => {
    setSelectedCableCompany(company);
    setShowDropdown(false);
  };

  return (
    <View className="flex-1 bg-black h-full">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1 bg-black mb-16" edges={["top"]}>
        <View className="flex-row items-center px-6 py-4 border-b border-gray-100 bg-black">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-white/50 rounded-lg p-2"
          >
            <Image
              source={ICONS.arrowLeft}
              className="w-auto h-5"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold text-center flex-1">
            Cable TV
          </Text>
        </View>

        <ScrollView className="flex-1 px-6 py-6 bg-white">
          <View className="gap-6">
            <View className="relative">
              <TouchableOpacity
                onPress={() => setShowDropdown(!showDropdown)}
                className="border border-gray-300 rounded-xl px-4 py-4 flex-row items-center justify-between bg-white"
              >
                <Text
                  className={`text-base ${
                    selectedCableCompany ? "text-black" : "text-gray-400"
                  }`}
                >
                  {selectedCableCompany || "Cable Company"}
                </Text>
                <Image
                  source={arrowDown}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
              </TouchableOpacity>

              {showDropdown && (
                <View className="absolute top-16 left-0 right-0 bg-white border border-gray-300 rounded-xl shadow-lg z-10">
                  {cableCompanies.map((company, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleCableCompanySelect(company)}
                      className={`px-4 py-3 ${
                        index !== cableCompanies.length - 1
                          ? "border-b border-gray-200"
                          : ""
                      }`}
                    >
                      <Text className="text-black text-base">{company}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View>
              <Text className="text-gray-500 text-base">
                ---Account name---
              </Text>
            </View>

            <View>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="Amount"
                placeholderTextColor="#9CA3AF"
                className="border border-gray-300 rounded-xl px-4 py-4 text-base text-black bg-white"
                keyboardType="numeric"
              />
            </View>

            <View>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Description"
                placeholderTextColor="#9CA3AF"
                className="border border-gray-300 rounded-xl px-4 py-4 text-base text-black bg-white"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        <View className="px-6 pb-6 bg-white">
          <TouchableOpacity className="bg-[#22C55E] rounded-xl py-4">
            <Text className="text-white text-center text-lg font-semibold">
              Proceed
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Index;
