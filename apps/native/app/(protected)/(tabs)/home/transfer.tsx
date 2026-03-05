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
import { ICONS } from "@/constants";
import { router } from "expo-router";

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
];

const paymentMethods = [
  { id: "wallet", name: "Wallet Balance" },
  { id: "card", name: "Debit Card" },
  { id: "bank", name: "Bank Account" },
];

const Transfer = () => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [showBankModal, setShowBankModal] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showPaymentSummary, setShowPaymentSummary] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [showTransferCompleted, setShowTransferCompleted] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
    setShowBankModal(false);
    if (accountNumber.length === 10) {
      setAccountName("Daniel Yolade");
    }
  };

  const handlePaymentMethodSelect = (method: any) => {
    setPaymentMethod(method.name);
    setShowPaymentMethodModal(false);
  };

  const handleAccountNumberChange = (text: string) => {
    setAccountNumber(text);
    if (text.length === 10 && selectedBank) {
      setAccountName("Daniel Yolade");
    } else {
      setAccountName("");
    }
  };

  const handleProceed = () => {
    if (paymentMethod && selectedBank && accountNumber && amount) {
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
          const txId = `67890-${Math.random().toString(36).substr(2, 9)}`;
          setTransactionId(txId);
          setShowPinModal(false);
          setPin("");
          setShowTransferCompleted(true);
        }, 500);
      }
    }
  };

  const handleViewReceipt = () => {
    setShowReceiptModal(true);
  };

  const handleCloseReceipt = () => {
    setShowReceiptModal(false);
  };

  const handleBackToHome = () => {
    setShowTransferCompleted(false);
    router.back();
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
      <View className="flex-1 bg-[#19B360] h-full">
        <StatusBar style="light" />
        <SafeAreaView className="flex-1 bg-[#19B360]" edges={["top"]}>
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100 bg-[#19B360]">
            <TouchableOpacity onPress={() => setShowPaymentSummary(false)}>
              <Image
                source={ICONS.arrowLeft}
                className="w-auto h-5 text-white"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Transfer</Text>
            <View className="w-8" />
          </View>

          <ScrollView className="flex-1 bg-white">
            <View className="px-6 pt-6 pb-8">
              <Text className="text-black text-xl font-bold mb-8">
                Payment Description
              </Text>

              <View className="gap-6">
                <View className="flex-row justify-between items-center">
                  <Text className="text-[#8E9BAE] text-base">From</Text>
                  <Text className="text-black text-base font-medium">
                    1489300008
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-[#8E9BAE] text-base">Payment Type</Text>
                  <Text className="text-black text-base font-medium">
                    Transfer
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-[#8E9BAE] text-base">
                    Payment Method
                  </Text>
                  <Text className="text-black text-base font-medium">
                    {selectedBank?.name}
                  </Text>
                </View>

                <View className="flex-row justify-between items-start">
                  <Text className="text-[#8E9BAE] text-base">Recipient</Text>
                  <View className="items-end">
                    <Text className="text-black text-base font-medium">
                      {accountName}
                    </Text>
                    <Text className="text-[#8E9BAE] text-sm">
                      {selectedBank?.name} | {accountNumber}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-[#8E9BAE] text-base">Destination</Text>
                  <Text className="text-black text-base font-medium">
                    {accountNumber}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-[#8E9BAE] text-base">Amount</Text>
                  <Text className="text-black text-base font-medium">
                    ₦{amount}
                  </Text>
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

  if (showTransferCompleted) {
    const currentDate = new Date();
    const formatDate = currentDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const formatTime = currentDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return (
      <View className="flex-1 bg-white">
        <StatusBar style="dark" />
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100">
            <TouchableOpacity onPress={handleBackToHome}>
              <Image
                source={ICONS.arrowLeft}
                className="w-auto h-5"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text className="text-black text-xl font-bold">
              Transfer Completed
            </Text>
            <View className="w-8" />
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            <View className="px-6 pt-8">
              <Text className="text-[#8E9BAE] text-center text-base mb-4">
                Your transaction was completed successfully.
              </Text>

              <Text className="text-[#8E9BAE] text-center text-sm mb-8">
                {formatDate} {formatTime}
              </Text>

              <View className="items-center mb-12">
                <Text className="text-[#8E9BAE] text-lg mb-2">Transfer</Text>
                <Text className="text-black text-4xl font-bold">
                  - ₦{amount}
                </Text>
              </View>

              <View className="gap-6">
                <View className="flex-row justify-between items-center">
                  <Text className="text-[#8E9BAE] text-base">
                    Payment Method
                  </Text>
                  <Text className="text-black text-base font-medium text-right">
                    Money Transfer --{"\n"}Bank Account
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-[#8E9BAE] text-base">From</Text>
                  <Text className="text-black text-base font-medium">
                    Richard Chike
                  </Text>
                </View>

                <View className="flex-row justify-between items-start">
                  <Text className="text-[#8E9BAE] text-base">Account</Text>
                  <Text className="text-black text-base font-medium text-right">
                    {selectedBank?.name} --{"\n"}
                    {accountNumber}
                  </Text>
                </View>

                <View className="flex-row justify-between items-start">
                  <Text className="text-[#8E9BAE] text-base">To</Text>
                  <Text className="text-black text-base font-medium text-right">
                    Zenth Bank /{accountNumber} --{"\n"}
                    {accountName}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-[#8E9BAE] text-base">Description</Text>
                  <Text className="text-black text-base font-medium">
                    {description || "Money transfer"}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-[#8E9BAE] text-base">
                    Transaction ID
                  </Text>
                  <Text className="text-black text-base font-medium">
                    {transactionId}
                  </Text>
                </View>
              </View>

              <TouchableOpacity className="mt-12 mb-8">
                <Text className="text-[#8E9BAE] text-center text-base">
                  Report an issue
                </Text>
              </TouchableOpacity>
            </View>
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4">
              <View className="flex-row gap-4">
                <TouchableOpacity
                  onPress={handleBackToHome}
                  className="flex-1 py-4 rounded-xl bg-gray-200"
                >
                  <Text className="text-gray-700 text-center font-semibold text-lg">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleViewReceipt}
                  className="flex-1 py-4 rounded-xl bg-[#19B360]"
                >
                  <Text className="text-white text-center font-semibold text-lg">
                    View Receipt
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>

        <Modal
          visible={showReceiptModal}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCloseReceipt}
        >
          <View className="flex-1 justify-center items-center bg-black/50 px-6">
            <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
              <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center">
                  <Text className="text-[#19B360] text-xl font-bold">⟡⟡ </Text>
                  <Text className="text-black text-lg font-semibold">
                    Helpmee
                  </Text>
                </View>
                <TouchableOpacity onPress={handleCloseReceipt}>
                  <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center">
                    <Text className="text-gray-600 text-lg">×</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View className="items-center mb-6">
                <Text className="text-[#19B360] text-3xl font-bold mb-2">
                  ₦{amount}
                </Text>
                <Text className="text-black text-lg font-semibold mb-1">
                  Successful Transaction
                </Text>
                <Text className="text-[#8E9BAE] text-sm">
                  {formatDate} {formatTime}
                </Text>
              </View>

              <View className="border-t border-dashed border-gray-300 pt-6 mb-6">
                <View className="gap-4">
                  <View className="flex-row justify-between">
                    <Text className="text-[#8E9BAE] text-sm">From</Text>
                    <Text className="text-black text-sm font-medium">
                      Richard Chike
                    </Text>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-[#8E9BAE] text-sm">Account</Text>
                    <Text className="text-black text-sm font-medium text-right">
                      {selectedBank?.name} --{"\n"}
                      {accountNumber}
                    </Text>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-[#8E9BAE] text-sm">To</Text>
                    <Text className="text-black text-sm font-medium text-right">
                      Zenth Bank /{accountNumber} --{"\n"}
                      {accountName}
                    </Text>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-[#8E9BAE] text-sm">
                      Payment Method
                    </Text>
                    <Text className="text-black text-sm font-medium text-right">
                      Money Transfer --{"\n"}Bank Account
                    </Text>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-[#8E9BAE] text-sm">Description</Text>
                    <Text className="text-black text-sm font-medium">
                      {description || "Money transfer"}
                    </Text>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-[#8E9BAE] text-sm">
                      Transaction ID
                    </Text>
                    <Text className="text-black text-sm font-medium">
                      {transactionId}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="border-t border-dashed border-gray-300 pt-6 mb-6">
                <Text className="text-[#8E9BAE] text-center text-sm mb-1">
                  Support
                </Text>
                <Text className="text-[#8E9BAE] text-center text-sm">
                  customerservice@helpmee.com
                </Text>
              </View>

              <TouchableOpacity className="bg-[#19B360] rounded-2xl py-4">
                <Text className="text-white text-center font-semibold text-lg">
                  Share Receipt
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#19B360] h-full">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1 bg-[#19B360]" edges={["top"]}>
        <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100 bg-[#19B360]">
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={ICONS.arrowLeft}
              className="w-auto h-5 text-white"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Transfer</Text>
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
            <Text className="text-black text-xl font-bold mb-1">
              Quick Transfer
            </Text>
            <Text className="text-[#8E9BAE] text-sm mb-6">
              Please maximum amount: ₦150,000.00
            </Text>

            <View className="space-y-5 flex flex-col gap-4">
              <View>
                <TouchableOpacity
                  onPress={() => setShowPaymentMethodModal(true)}
                  className={`w-full h-16 px-5 bg-gray-50 rounded-2xl border justify-between flex-row items-center ${
                    paymentMethod ? "border-[#19B360]" : "border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-base ${
                      paymentMethod ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {paymentMethod || "Payment Method"}
                  </Text>
                  <Text className="text-gray-400 text-lg">⌄</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity className="self-center">
                <Text className="text-[#19B360] text-base font-medium">
                  + Add new payment method
                </Text>
              </TouchableOpacity>

              <View>
                <TouchableOpacity
                  onPress={() => setShowBankModal(true)}
                  className={`w-full h-16 px-5 bg-gray-50 rounded-2xl border justify-between flex-row items-center ${
                    selectedBank ? "border-[#19B360]" : "border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-base ${
                      selectedBank ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {selectedBank ? selectedBank.name : "Select Bank"}
                  </Text>
                  <Text className="text-gray-400 text-lg">⌄</Text>
                </TouchableOpacity>
              </View>

              <View>
                <TextInput
                  className="w-full h-16 px-5 bg-gray-50 rounded-2xl border border-gray-200 text-gray-900 text-base"
                  value={accountNumber}
                  onChangeText={handleAccountNumberChange}
                  placeholder="Beneficiary Account Number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>

              {accountName ? (
                <View className="px-2">
                  <Text className="text-[#19B360] text-sm">
                    ---{accountName}---
                  </Text>
                </View>
              ) : null}

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

              <View>
                <TextInput
                  className="w-full h-20 px-5 pt-5 bg-gray-50 rounded-2xl border border-gray-200 text-gray-900 text-base"
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Description"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  textAlignVertical="top"
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
          visible={showPaymentMethodModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPaymentMethodModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />
              <Text className="text-xl font-bold text-center mb-8">
                Select Payment Method
              </Text>

              <View className="space-y-4">
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    onPress={() => handlePaymentMethodSelect(method)}
                    className="flex-row items-center justify-between py-4"
                  >
                    <Text className="text-lg font-medium">{method.name}</Text>
                    <View
                      className={`w-6 h-6 rounded-full border-2 ${
                        paymentMethod === method.name
                          ? "bg-[#19B360] border-[#19B360]"
                          : "border-gray-300"
                      } items-center justify-center`}
                    >
                      {paymentMethod === method.name && (
                        <Text className="text-white text-xs">✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => setShowPaymentMethodModal(false)}
                className="bg-gray-200 py-4 rounded-xl mt-8"
              >
                <Text className="text-gray-700 text-center font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
                Select Bank Account
              </Text>

              <ScrollView
                className="space-y-4"
                showsVerticalScrollIndicator={false}
              >
                {banks.map((bank) => (
                  <TouchableOpacity
                    key={bank.id}
                    onPress={() => handleBankSelect(bank)}
                    className="py-4 border-b border-gray-100"
                  >
                    <Text className="text-lg font-medium">{bank.name}</Text>
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

export default Transfer;
