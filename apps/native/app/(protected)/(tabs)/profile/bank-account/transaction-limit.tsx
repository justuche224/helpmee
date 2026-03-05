import {
  Image,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Modal,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "@/constants";
import { router } from "expo-router";
import BG from "@/assets/images/home/BG.png";

type TransactionType = {
  id: string;
  name: string;
  description?: string;
};

const transactionTypes: TransactionType[] = [
  {
    id: "transfer",
    name: "Bank Transfer",
    description: "Transfer to other banks",
  },
  {
    id: "withdrawal",
    name: "ATM Withdrawal",
    description: "Withdraw from ATM",
  },
  {
    id: "online",
    name: "Online Transaction",
    description: "Web and mobile payments",
  },
  { id: "pos", name: "POS Transaction", description: "Point of sale payments" },
  {
    id: "airtime",
    name: "Airtime Purchase",
    description: "Buy airtime and data",
  },
  { id: "bills", name: "Bill Payment", description: "Pay utility bills" },
];

const TransactionLimit = () => {
  const [showBalance, setShowBalance] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionType | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [dailyLimit, setDailyLimit] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");

  const accountNumber = "6132406178";
  const bankName = "Access Bank PLC";

  const handleTransactionSelect = (transaction: TransactionType) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(false);
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
            Transaction Limit
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-6">
            <View className="rounded-2xl mb-8 overflow-hidden">
              <ImageBackground source={BG} className="p-6" resizeMode="cover">
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1">
                    <Text className="text-white text-base font-medium">
                      {bankName} -{" "}
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

            <Text className="text-gray-400 text-base mb-8 leading-6">
              Select your preferred transaction process and set a limit
            </Text>

            <View className="gap-6">
              <View>
                <TouchableOpacity
                  onPress={() => setShowTransactionModal(true)}
                  className="w-full h-16 px-4 bg-gray-50 rounded-xl border border-gray-200 justify-between flex-row items-center"
                >
                  <Text
                    className={`text-base ${
                      selectedTransaction ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {selectedTransaction
                      ? selectedTransaction.name
                      : "Select Transaction"}
                  </Text>
                  <Text className="text-gray-400 text-lg">⌄</Text>
                </TouchableOpacity>
              </View>

              {selectedTransaction && (
                <>
                  <View>
                    <Text className="text-gray-700 text-sm mb-2 font-medium">
                      Daily Limit
                    </Text>
                    <TextInput
                      className="w-full h-16 px-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 text-base"
                      value={dailyLimit}
                      onChangeText={setDailyLimit}
                      placeholder="₦0.00"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 text-sm mb-2 font-medium">
                      Monthly Limit
                    </Text>
                    <TextInput
                      className="w-full h-16 px-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 text-base"
                      value={monthlyLimit}
                      onChangeText={setMonthlyLimit}
                      placeholder="₦0.00"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                    />
                  </View>

                  <TouchableOpacity className="bg-[#19B360] rounded-2xl py-4 mt-6">
                    <Text className="text-white text-center text-lg font-semibold">
                      Set Limit
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </ScrollView>

        <Modal
          visible={showTransactionModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTransactionModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
              <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />
              <Text className="text-xl font-bold text-center mb-8">
                Select Transaction Type
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                {transactionTypes.map((transaction) => (
                  <TouchableOpacity
                    key={transaction.id}
                    onPress={() => handleTransactionSelect(transaction)}
                    className="py-4 border-b border-gray-100"
                  >
                    <Text className="text-lg font-medium text-gray-900 mb-1">
                      {transaction.name}
                    </Text>
                    {transaction.description && (
                      <Text className="text-sm text-gray-500">
                        {transaction.description}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                onPress={() => setShowTransactionModal(false)}
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

export default TransactionLimit;
