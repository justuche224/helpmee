import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ICONS, NETWORK_PROVIDERS } from "@/constants";
import { router } from "expo-router";

type NetworkProvider = {
  id: string;
  name: string;
  icon: any;
};

const networkProviders: NetworkProvider[] = [
  { id: "glo", name: "Glo", icon: NETWORK_PROVIDERS.glo },
  { id: "mtn", name: "MTN", icon: NETWORK_PROVIDERS.mtn },
  { id: "9mobile", name: "9 Mobile", icon: NETWORK_PROVIDERS.nineMobile },
  { id: "airtel", name: "Airtel", icon: NETWORK_PROVIDERS.airtel },
];

const Airtime = () => {
  const [activeTab, setActiveTab] = useState("airtime");
  const [mobileNumber, setMobileNumber] = useState("");
  const [selectedProvider, setSelectedProvider] =
    useState<NetworkProvider | null>(null);
  const [amount, setAmount] = useState("");
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showPaymentSummary, setShowPaymentSummary] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");

  const handleProviderSelect = (provider: NetworkProvider) => {
    setSelectedProvider(provider);
    setShowProviderModal(false);
  };

  const handleProceed = () => {
    if (mobileNumber && selectedProvider && amount) {
      setShowPaymentSummary(true);
    }
  };

  const handlePay = () => {
    setShowPaymentSummary(false);
    setShowPinModal(true);
  };

  const handlePinInput = (digit: string) => {
    if (digit === "delete") {
      setPin((prev) => prev.slice(0, -1));
    } else if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);

      if (newPin.length === 4) {
        setTimeout(() => {
          console.log("Success");
          setShowPinModal(false);
          setPin("");
          router.back();
        }, 500);
      }
    }
  };

  const renderPinDots = () => {
    return (
      <View className="flex-row justify-center gap-4 mb-12">
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            className={`w-10 h-10 rounded-full border-2 ${
              index < pin.length
                ? "bg-[#19B360] border-[#19B360]"
                : "border-gray-300"
            }`}
          />
        ))}
      </View>
    );
  };

  const keypadButtons = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["*", "0", "delete"],
  ];

  if (showPaymentSummary) {
    return (
      <View className="flex-1 bg-[#FFAE0E] h-full">
        <StatusBar style="light" />
        <SafeAreaView className="flex-1 bg-[#FFAE0E]" edges={["top"]}>
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100 bg-[#FFAE0E]">
            <TouchableOpacity onPress={() => setShowPaymentSummary(false)}>
              <Image
                source={ICONS.arrowLeft}
                className="w-auto h-5 text-white"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Airtime</Text>
            <TouchableOpacity className="bg-white/20 rounded-lg p-2">
              <Image
                source={ICONS.notificationBell}
                className="w-6 h-6"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 bg-white">
            <View className="px-6 pt-6 pb-8">
              <View className="flex-row justify-between items-center mb-8">
                <Text className="text-black text-xl font-bold">
                  Payment Description
                </Text>
                <TouchableOpacity
                  onPress={() => setShowPaymentSummary(false)}
                  className="bg-gray-100 px-4 py-2 rounded-lg"
                >
                  <Text className="text-gray-700 font-medium">Edit</Text>
                </TouchableOpacity>
              </View>

              <View className="gap-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-[#8E9BAE] text-base">
                    Payment Category
                  </Text>
                  <Text className="text-black text-base font-medium">
                    Airtime
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-[#8E9BAE] text-base">
                    Network Provider
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-black text-base font-medium">
                      {selectedProvider?.name}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-[#8E9BAE] text-base">Biller</Text>
                  <Text className="text-black text-base font-medium">
                    Daniel Yolade
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-[#8E9BAE] text-base">Destination</Text>
                  <View className="flex-row items-center">
                    <Text className="text-black text-base font-medium">
                      {mobileNumber}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-[#8E9BAE] text-base">Amount</Text>
                  <View className="flex-row items-center">
                    <Text className="text-black text-base font-medium">
                      ₦{amount}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={handlePay}
                className="bg-[#19B360] rounded-2xl py-5 mt-12"
              >
                <Text className="text-white text-center text-lg font-semibold">
                  Pay
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FFAE0E] h-full">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1 bg-[#FFAE0E]" edges={["top"]}>
        <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100 bg-[#FFAE0E]">
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={ICONS.arrowLeft}
              className="w-auto h-5 text-white"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Airtime</Text>
          <TouchableOpacity className="bg-white/20 rounded-lg p-2">
            <Image
              source={ICONS.notificationBell}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 bg-white">
          <View className="px-6 pt-6 pb-8">
            <Text className="text-black text-base font-semibold mb-4">
              Airtime Payment
            </Text>

            <View className="flex-row mb-4 bg-[#F5F5F5] p-1 rounded-2xl">
              <TouchableOpacity
                onPress={() => setActiveTab("airtime")}
                className={`flex-1 py-3 px-6 rounded-l-xl ${
                  activeTab === "airtime" ? "bg-[#19B360]" : "bg-[#F5F5F5]"
                }`}
              >
                <Text
                  className={`text-center font-semibold text-base ${
                    activeTab === "airtime" ? "text-white" : "text-gray-500"
                  }`}
                >
                  Airtime
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("data")}
                className={`flex-1 py-3 px-6 rounded-r-2xl ${
                  activeTab === "data" ? "bg-[#19B360]" : "bg-[#F5F5F5]"
                }`}
              >
                <Text
                  className={`text-center font-semibold text-base ${
                    activeTab === "data" ? "text-white" : "text-gray-500"
                  }`}
                >
                  Data
                </Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-5 flex flex-col gap-4">
              <View>
                <TextInput
                  className="w-full h-16 px-5 bg-gray-50 rounded-2xl border border-gray-200 text-gray-900 text-base"
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  placeholder="Mobile Number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
              </View>

              <View>
                <TouchableOpacity
                  onPress={() => setShowProviderModal(true)}
                  className={`w-full h-16 px-5 bg-gray-50 rounded-2xl border justify-between flex-row items-center ${
                    selectedProvider ? "border-[#19B360]" : "border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-base ${
                      selectedProvider ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {selectedProvider
                      ? selectedProvider.name
                      : "Select Network Provider"}
                  </Text>
                  <Text className="text-gray-400 text-lg">⌄</Text>
                </TouchableOpacity>
              </View>

              <View>
                <TextInput
                  className="w-full h-16 px-5 bg-gray-50 rounded-2xl border border-gray-200 text-gray-900 text-base"
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="Amount"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleProceed}
              className="bg-[#19B360] rounded-2xl py-5 mt-12"
            >
              <Text className="text-white text-center text-lg font-semibold">
                Proceed
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Modal
          visible={showProviderModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowProviderModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />
              <Text className="text-xl font-bold text-center mb-8">
                Select Network Provider
              </Text>

              <View className="space-y-4">
                {networkProviders.map((provider) => (
                  <TouchableOpacity
                    key={provider.id}
                    onPress={() => handleProviderSelect(provider)}
                    className="flex-row items-center justify-between py-4"
                  >
                    <View className="flex-row items-center">
                      <Image
                        source={provider.icon}
                        className="w-10 h-10 mr-4"
                        resizeMode="contain"
                      />
                      <Text className="text-lg font-medium">
                        {provider.name}
                      </Text>
                    </View>
                    <View
                      className={`w-6 h-6 rounded-full border-2 ${
                        selectedProvider?.id === provider.id
                          ? "bg-[#19B360] border-[#19B360]"
                          : "border-gray-300"
                      } items-center justify-center`}
                    >
                      {selectedProvider?.id === provider.id && (
                        <Text className="text-white text-xs">✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row space-x-4 mt-8 gap-4">
                <TouchableOpacity
                  onPress={() => setShowProviderModal(false)}
                  className="flex-1 py-4 rounded-xl bg-gray-200"
                >
                  <Text className="text-gray-700 text-center font-semibold">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowProviderModal(false)}
                  className="flex-1 py-4 rounded-xl bg-[#19B360]"
                >
                  <Text className="text-white text-center font-semibold">
                    Proceed
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showPinModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPinModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl px-6 py-8">
              <View className="flex-row justify-between items-center mb-8">
                <Text className="text-xl font-semibold">
                  Enter Transaction PIN
                </Text>
                <TouchableOpacity onPress={() => setShowPinModal(false)}>
                  <Text className="text-[#8E9BAE] text-2xl">×</Text>
                </TouchableOpacity>
              </View>

              {renderPinDots()}

              <View className="space-y-4">
                {keypadButtons.map((row, rowIndex) => (
                  <View key={rowIndex} className="flex-row justify-around">
                    {row.map((button) => (
                      <TouchableOpacity
                        key={button}
                        onPress={() => handlePinInput(button)}
                        className="w-16 h-16 justify-center items-center"
                      >
                        {button === "delete" ? (
                          <Text className="text-2xl font-bold">×</Text>
                        ) : (
                          <Text className="text-2xl font-semibold">
                            {button}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>

              <View className="flex-row justify-center items-center mt-8">
                <View className="w-6 h-6 bg-gray-300 rounded-full mr-2 justify-center items-center">
                  <Text className="text-white text-xs font-bold">?</Text>
                </View>
                <Text className="text-gray-500">Need help? </Text>
                <TouchableOpacity>
                  <Text className="text-[#19B360] font-semibold">
                    Click Here
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

export default Airtime;
