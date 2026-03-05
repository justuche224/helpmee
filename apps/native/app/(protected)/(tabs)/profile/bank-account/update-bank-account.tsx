import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  ImageBackground,
} from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "@/constants";
import { router } from "expo-router";
import BG from "@/assets/images/home/BG.png";

type Bank = {
  id: string;
  name: string;
};

const banks: Bank[] = [
  { id: "access", name: "Access Bank PLC" },
  { id: "ecobank", name: "Ecobank" },
  { id: "fcmb", name: "FCMB" },
  { id: "fidelity", name: "Fidelity Bank" },
  { id: "first", name: "First Bank of Nigeria" },
  { id: "heritage", name: "First Heritage" },
  { id: "gtco", name: "Guaranty Trust Holding Company (GTCO)" },
  { id: "heritage_bank", name: "Heritage" },
  { id: "keystone", name: "Keystone Bank" },
  { id: "opay", name: "Opay Digital Services Limited" },
  { id: "palmpay", name: "PalmPay Limited" },
  { id: "polaris", name: "Polaris Bank" },
  { id: "stanbic", name: "Stanbic IBTC Bank" },
  { id: "sterling", name: "Sterling Bank" },
  { id: "union", name: "Union Bank" },
  { id: "uba", name: "United Bank for Africa (UBA)" },
  { id: "unity", name: "Unity Bank" },
  { id: "wema", name: "Wema Bank" },
  { id: "zenith", name: "Zenith Bank" },
];

const UpdateBankAccount = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedBank, setSelectedBank] = useState<Bank | null>({
    id: "access",
    name: "Access Bank PLC",
  });
  const [accountNumber, setAccountNumber] = useState("6132406178");
  const [bvn, setBvn] = useState("57589678230276590");
  const [showBankModal, setShowBankModal] = useState(false);

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
    setShowBankModal(false);
  };

  const accountName = "Richard Chike";

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
            Update Bank Account
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-6">
            <View className="rounded-2xl mb-8 overflow-hidden">
              <ImageBackground source={BG} className="p-6" resizeMode="cover">
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1">
                    <Text className="text-white text-base font-medium">
                      {selectedBank?.name} -{" "}
                    </Text>
                    <Text className="text-white text-2xl font-bold mt-1">
                      {showBalance ? "₦234,050.00" : accountNumber}
                    </Text>
                    <Text className="text-white/90 text-sm mt-1">
                      Account Type: Silver
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowBalance(!showBalance)}
                    className="p-2"
                  >
                    <Image
                      source={showBalance ? ICONS.eye : ICONS.eyeHide}
                      className="w-6 h-6"
                      resizeMode="contain"
                      tintColor="white"
                    />
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            </View>

            <View className="gap-6">
              <View>
                <TouchableOpacity
                  onPress={() => setShowBankModal(true)}
                  className="w-full h-16 px-4 bg-gray-50 rounded-xl border border-gray-200 justify-between flex-row items-center"
                >
                  <Text className="text-gray-900 text-base">
                    {selectedBank?.name || "Select Bank"}
                  </Text>
                  <Text className="text-gray-400 text-lg">⌄</Text>
                </TouchableOpacity>
              </View>

              <View>
                <TextInput
                  className="w-full h-16 px-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 text-base"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  placeholder="Account Number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>

              <View>
                <TextInput
                  className="w-full h-16 px-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 text-base"
                  value={bvn}
                  onChangeText={setBvn}
                  placeholder="BVN"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={11}
                />
              </View>

              {accountName && (
                <View className="px-2">
                  <Text className="text-gray-500 text-sm">{accountName}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity className="bg-[#19B360] rounded-2xl py-4 mt-12">
              <Text className="text-white text-center text-lg font-semibold">
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Modal
          visible={showBankModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowBankModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
              <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />
              <Text className="text-xl font-bold text-center mb-8">
                Select Bank
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  onPress={() =>
                    handleBankSelect({ id: "select", name: "--select--" })
                  }
                  className="py-4 border-b border-gray-100"
                >
                  <Text className="text-lg font-medium text-gray-400">
                    --select--
                  </Text>
                </TouchableOpacity>
                {banks.map((bank) => (
                  <TouchableOpacity
                    key={bank.id}
                    onPress={() => handleBankSelect(bank)}
                    className="py-4 border-b border-gray-100"
                  >
                    <Text className="text-lg font-medium text-gray-900">
                      {bank.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                onPress={() => setShowBankModal(false)}
                className="bg-gray-200 py-4 rounded-xl mt-6"
              >
                <Text className="text-gray-700 text-center font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

export default UpdateBankAccount;
